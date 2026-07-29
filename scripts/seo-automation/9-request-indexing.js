/**
 * Script 9: Solicitar indexación a Google vía Indexing API
 *
 * Envía notificaciones URL_UPDATED a Google para que reindexe rápido.
 * Lee seo-changes.json y solicita indexación de las páginas modificadas
 * que no hayan sido indexadas en los últimos N días.
 *
 * Requiere: service account con rol de PROPIETARIO en Google Search Console
 * (no solo usuario — hay que añadirlo manualmente en GSC una vez)
 *
 * Uso:
 *   node scripts/seo-automation/9-request-indexing.js            → solo páginas en seo-changes.json
 *   node scripts/seo-automation/9-request-indexing.js --all      → todas las páginas principales
 *   node scripts/seo-automation/9-request-indexing.js --url /ruta → URL específica
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');
const CHANGES_FILE = path.join(__dirname, 'seo-changes.json');
const INDEXING_LOG = path.join(__dirname, 'indexing-log.json');
const BASE_URL = 'https://aisecurity.es';

// Páginas principales a indexar con --all
const MAIN_PAGES = [
  '/',
  '/wazuh',
  '/curso-wazuh',
  '/ciberseguridad',
  '/consultoria-ens',
  '/consultoria-iso27001',
  '/blog/como-instalar-wazuh-en-linux',
  '/blog/como-instalar-agente-wazuh-en-windows',
  '/blog/que-es-wazuh-para-que-sirve',
  '/blog/ia-threat-hunting-wazuh',
  '/blog/wazuh-elastic-security-configuracion-de-siem-completo',
  '/servicios/chatbot',
  '/servicios/gestor-citas',
  '/servicios/atencion-llamadas',
];

function loadLog() {
  try { return JSON.parse(fs.readFileSync(INDEXING_LOG, 'utf-8')); }
  catch { return { requests: [] }; }
}

function saveLog(log) {
  fs.writeFileSync(INDEXING_LOG, JSON.stringify(log, null, 2));
}

// Evitar solicitar la misma URL más de 1 vez cada 24h (límite de la API: 200/día)
function wasRecentlyRequested(url, log, hoursThreshold = 24) {
  const cutoff = Date.now() - hoursThreshold * 60 * 60 * 1000;
  return log.requests.some(r => r.url === url && new Date(r.date).getTime() > cutoff);
}

async function requestIndexing(auth, url) {
  const indexing = google.indexing({ version: 'v3', auth });
  const res = await indexing.urlNotifications.publish({
    requestBody: { url, type: 'URL_UPDATED' }
  });
  return res.data;
}


async function main() {
  const args = process.argv.slice(2);
  const doAll = args.includes('--all');
  const urlArg = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
  const fromEnv = args.includes('--from-env'); // modo GitHub Actions: lee INDEXING_URLS

  let credentials;
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_JSON, 'base64').toString('utf-8'));
  } else {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const authClient = await auth.getClient();

  // Determinar qué URLs solicitar
  let urlsToRequest = [];

  if (fromEnv) {
    // Modo GitHub Actions: URLs separadas por comas en INDEXING_URLS
    const envUrls = process.env.INDEXING_URLS || '';
    if (!envUrls) { console.log('ℹ️  INDEXING_URLS vacío, nada que indexar.'); return; }
    urlsToRequest = envUrls.split(',').map(u => u.trim()).filter(Boolean)
      .map(u => u.startsWith('http') ? u : BASE_URL + u);
  } else if (urlArg) {
    // URL específica por argumento
    urlsToRequest = [urlArg.startsWith('http') ? urlArg : BASE_URL + urlArg];
  } else if (doAll) {
    // Todas las páginas principales
    urlsToRequest = MAIN_PAGES.map(p => BASE_URL + p);
  } else {
    // Solo páginas con cambios en seo-changes.json no indexadas aún hoy
    const changesLog = JSON.parse(fs.readFileSync(CHANGES_FILE, 'utf-8'));
    const today = new Date().toISOString().split('T')[0];

    for (const change of changesLog.changes || []) {
      // Indexar si el cambio es reciente (últimos 30 días) y no fue indexado hoy
      const changeDate = new Date(change.date);
      const daysSinceChange = (Date.now() - changeDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange <= 30 && change.lastIndexed !== today) {
        const fullUrl = change.page.startsWith('http') ? change.page : BASE_URL + change.page;
        urlsToRequest.push(fullUrl);
        change.lastIndexed = today; // marcar para no repetir hoy
      }
    }

    // Guardar el lastIndexed actualizado
    if (urlsToRequest.length > 0) {
      fs.writeFileSync(CHANGES_FILE, JSON.stringify(changesLog, null, 2));
    }
  }

  if (urlsToRequest.length === 0) {
    console.log('ℹ️  No hay URLs que necesiten indexación ahora mismo.');
    return;
  }

  const log = loadLog();
  let success = 0, skipped = 0, errors = 0;

  console.log(`\n🔄 Solicitando indexación para ${urlsToRequest.length} URL(s)...\n`);

  for (const url of urlsToRequest) {
    if (wasRecentlyRequested(url, log)) {
      console.log(`⏭️  Saltando (ya solicitada hoy): ${url}`);
      skipped++;
      continue;
    }

    try {
      await requestIndexing(authClient, url);
      console.log(`✅ Indexación solicitada: ${url}`);
      log.requests.push({ url, date: new Date().toISOString(), status: 'ok' });
      success++;

      // Esperar 500ms entre peticiones para no saturar
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      const msg = err.message || String(err);
      console.error(`❌ Error en ${url}: ${msg}`);
      log.requests.push({ url, date: new Date().toISOString(), status: 'error', error: msg });
      errors++;

      // Si el error es de permisos, abortar con instrucciones
      if (msg.includes('403') || msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        console.error('\n⚠️  ERROR DE PERMISOS — El service account necesita ser PROPIETARIO en GSC.');
        console.error('Pasos para solucionarlo:');
        console.error('1. Ir a https://search.google.com/search-console');
        console.error('2. Configuración → Usuarios y permisos');
        console.error('3. Añadir: seo-automation@julensistemas.iam.gserviceaccount.com como PROPIETARIO');
        console.error('4. Volver a ejecutar este script\n');
        break;
      }
    }
  }

  // Limpiar log de entradas > 7 días
  const cutoff7d = Date.now() - 7 * 24 * 60 * 60 * 1000;
  log.requests = log.requests.filter(r => new Date(r.date).getTime() > cutoff7d);
  saveLog(log);

  console.log(`\n📊 Resultado: ${success} solicitadas · ${skipped} saltadas · ${errors} errores`);
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});

/**
 * Script 2: Indexación automática en Google Search Console
 *
 * Usa la API de Google Indexing para solicitar indexación de URLs.
 * Requiere configurar credenciales de Google Cloud.
 *
 * SETUP:
 * 1. Ir a Google Cloud Console: https://console.cloud.google.com/
 * 2. Crear proyecto o usar existente
 * 3. Habilitar "Indexing API"
 * 4. Crear Service Account y descargar JSON de credenciales
 * 5. Añadir el email del Service Account como propietario en Search Console
 * 6. Guardar credenciales en: scripts/seo-automation/google-credentials.json
 *
 * Uso: node scripts/seo-automation/2-google-indexing.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuración
const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');
const SITE_URL = 'https://aisecurity.es';

// Todas las URLs públicas del sitio a indexar
const URLS_TO_INDEX = [
  // Páginas principales
  '/',
  '/wazuh',
  '/curso-wazuh',
  '/reunion',
  '/soporte-tecnico',
  '/faq',

  // Consultoría ciberseguridad / cumplimiento
  '/ciberseguridad',
  '/consultoria-ens',
  '/consultoria-iso27001',

  // Servicios IA
  '/servicios/chatbot',
  '/servicios/gestor-citas',
  '/servicios/gestor-documental',
  '/servicios/gestor-documental-abogados',
  '/servicios/atencion-llamadas',
  '/servicios/automatizacion',
  '/servicios/agente-fisioterapeutas',
  '/servicios/desarrollo-web',

  // Blog — Wazuh
  '/blog/que-es-wazuh-para-que-sirve',
  '/blog/como-instalar-wazuh-en-linux',
  '/blog/como-instalar-agente-wazuh-en-windows',
  '/blog/como-instalar-agente-wazuh-en-linux',
  '/blog/como-instalar-wazuh-con-docker',
  '/blog/wazuh-elastic-security-configuracion-de-siem-completo',
  '/blog/ia-threat-hunting-wazuh',
  '/blog/monitorizacion-de-contenedores-docker-con-wazuh',
  '/blog/configurar-alertas-correo-wazuh-postfix-gmail',
  '/blog/configuracion-de-grupos-en-wazuh',
  '/blog/crear-reglas-personalizadas-wazuh',
  '/blog/crear-decoders-personalizados-wazuh',
  '/blog/flujo-logs-wazuh-decoders-reglas-alertas',
  '/blog/integracion-wazuh-virustotal',
  '/blog/investigar-ataque-ssh-wazuh-discover',
  '/blog/detectar-instalaciones-software-windows-wazuh',
  '/blog/monitorizar-certificados-wazuh-fim',
  '/blog/panel-vulnerability-detection-wazuh',
  '/blog/configurar-equipos-sin-agente-wazuh-syslog',
  '/blog/como-monitorizar-tu-tenant-de-office365-registros-de-exchange-sharepoint',

  // Blog — Concienciación ciberseguridad
  '/blog/ciberseguridad-basica-empleados-guia-completa',
  '/blog/detectar-phishing-outlook-microsoft-guia-empleados',
  '/blog/detectar-phishing-gmail-guia-empleados',
  '/blog/tu-contrasena-mayuscula-numeros-hackeable',
  '/blog/contrasenas-seguras-empleados-guia-completa',

  // Blog — Soporte técnico / sistemas
  '/blog/backup-automatico-pymes-guia-completa',
  '/blog/pc-empresa-lento-causas-y-soluciones',
  '/blog/configurar-correo-corporativo-outlook-movil',

  // Blog — IA
  '/blog/automatizacion-de-atencion-al-cliente-con-chatbots-ia',
  '/blog/automatizacion-de-generacion-de-reportes-empresariales-con-ia',
  '/blog/deteccion-de-anomalias-en-sistemas-de-monitoreo-it',

  // Soporte técnico — páginas geo
  '/soporte-tecnico/benicarlo',
  '/soporte-tecnico/madrid',
  '/soporte-tecnico/burriana',
  '/soporte-tecnico/vila-real',
  '/soporte-tecnico/vinaros',
  '/soporte-tecnico/peniscola',
  '/soporte-tecnico/oropesa-del-mar',
  '/soporte-tecnico/benicassim',
  '/soporte-tecnico/nules',
  '/soporte-tecnico/moncofa',
  '/soporte-tecnico/onda',
  '/soporte-tecnico/almenara',
  '/soporte-tecnico/almassora',
  '/soporte-tecnico/betxi',
  '/soporte-tecnico/la-vall-duixo',
  '/soporte-tecnico/lalcora',
  '/soporte-tecnico/segorbe',
  '/soporte-tecnico/cabanes',
  '/soporte-tecnico/calig',
  '/soporte-tecnico/torreblanca',
  '/soporte-tecnico/alcala-de-xivert',
];

// Log de indexaciones
const LOG_FILE = path.join(__dirname, 'indexing-log.json');

function loadLog() {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  }
  return { requests: [] };
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

async function requestIndexing(auth, url) {
  const indexing = google.indexing({ version: 'v3', auth });

  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED'
      }
    });

    return {
      success: true,
      url: url,
      notifyTime: response.data.urlNotificationMetadata?.latestUpdate?.notifyTime,
      response: response.data
    };
  } catch (error) {
    return {
      success: false,
      url: url,
      error: error.message
    };
  }
}

async function main() {
  console.log('🔍 Google Indexing API - Solicitando indexación...\n');

  // Verificar credenciales
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log('❌ No se encontraron credenciales de Google.');
    console.log('\n📋 INSTRUCCIONES DE SETUP:');
    console.log('1. Ir a https://console.cloud.google.com/');
    console.log('2. Crear proyecto o seleccionar existente');
    console.log('3. Buscar y habilitar "Indexing API"');
    console.log('4. Ir a "Credenciales" > "Crear credenciales" > "Cuenta de servicio"');
    console.log('5. Descargar el JSON de la cuenta de servicio');
    console.log('6. Guardar como: scripts/seo-automation/google-credentials.json');
    console.log('7. En Search Console, añadir el email del Service Account como propietario');
    console.log('\n📧 El email del Service Account tiene formato: nombre@proyecto.iam.gserviceaccount.com');
    return;
  }

  // Cargar credenciales
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

  // Autenticar
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing']
  });

  const authClient = await auth.getClient();
  const log = loadLog();

  console.log(`📍 Sitio: ${SITE_URL}`);
  console.log(`📄 URLs a indexar: ${URLS_TO_INDEX.length}\n`);

  const results = [];

  for (const urlPath of URLS_TO_INDEX) {
    const fullUrl = `${SITE_URL}${urlPath}`;
    console.log(`🔄 Solicitando: ${fullUrl}`);

    const result = await requestIndexing(authClient, fullUrl);
    results.push(result);

    if (result.success) {
      console.log(`   ✅ Indexación solicitada`);
    } else {
      console.log(`   ❌ Error: ${result.error}`);
    }

    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Guardar log
  log.requests.push({
    timestamp: new Date().toISOString(),
    results: results
  });
  saveLog(log);

  // Resumen
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Exitosas: ${successful}`);
  console.log(`   ❌ Fallidas: ${failed}`);
  console.log(`\n📝 Log guardado en: ${LOG_FILE}`);
}

// Verificar si googleapis está instalado
try {
  require.resolve('googleapis');
  main().catch(console.error);
} catch (e) {
  console.log('📦 Instalando dependencia googleapis...');
  console.log('   Ejecuta: npm install googleapis');
  console.log('\n   O desde la carpeta del proyecto:');
  console.log('   cd scripts/seo-automation && npm init -y && npm install googleapis');
}

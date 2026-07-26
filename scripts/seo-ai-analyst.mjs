/**
 * seo-ai-analyst — Informe SEO autónomo con análisis de IA.
 *
 * Reúne Search Console (núcleo) + GA4 (comportamiento + clics de CTA) + el contenido
 * real de las páginas (lee el repo checkout) y se lo pasa a DeepSeek como "analista SEO
 * senior" con el CONTEXTO DE NEGOCIO. Envía por email:
 *   - Análisis y recomendaciones priorizadas (qué cambiar / qué dejar / keywords / CTA / ideas)
 *   - Sección de Campañas (scripts/seo-analyst/campaigns.json)
 *   - Tablas de datos crudos
 *
 * NUNCA modifica el sitio. Solo informa. Prioridad: SEO clásico > GEO.
 * Secrets/env: GOOGLE_SERVICE_ACCOUNT_JSON, RESEND_API_KEY, DEEPSEEK_API_KEY, EMAIL_TO (opcional)
 */
import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const envPath = join(ROOT, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^"(.*)"$/, '$1');
  }
}
const env = process.env;

const GA4_PROPERTY = '519124169';
const SITE_CANDIDATES = ['sc-domain:aisecurity.es', 'https://aisecurity.es/'];
const EMAIL_TO = (env.EMAIL_TO || 'info@aisecurity.es').trim();
const DEEPSEEK_KEY = (env.DEEPSEEK_API_KEY || '').trim();

// Páginas prioritarias de negocio (siempre se revisan aunque no estén en el top)
const PRIORITY_PAGES = ['/wazuh', '/curso-wazuh', '/curso-wazuh-avanzado'];

// ── Contexto de negocio para la IA ──
const BUSINESS_CONTEXT = `CONTEXTO DE NEGOCIO de aisecurity.es (tenlo MUY en cuenta):
- Somos servicios de IA + ciberseguridad Wazuh para PyMEs (España/LATAM).
- OBJETIVO nº1: atraer visitas cualificadas a /wazuh (implantación de Wazuh/SIEM/ENS para EMPRESAS) y a los cursos /curso-wazuh y /curso-wazuh-avanzado. Es lo que más nos interesa monetizar.
- Prioridad: 1) Wazuh (/wazuh), 2) cursos Wazuh, 3) servicios de IA (/servicios/*), 4) el resto.
- Los BLOGS son top-of-funnel: atraen tráfico informativo (cómo instalar Wazuh, etc.) y su misión es EMPUJAR al lector hacia /wazuh, los cursos o el contacto mediante CTAs (botones). Un blog con muchas visitas pero pocos clics de CTA está fallando en convertir.
- Medimos los clics de esos CTA en GA4 (eventos click_button/click_link/conversion_click con su etiqueta y página). Úsalo para juzgar si los CTA de cada blog funcionan.
- Prioridad SEO clásico > GEO. Céntrate en acciones que suban tráfico cualificado a Wazuh/cursos y en mejorar la conversión de los blogs hacia esos destinos.`;

// ── Auth (GA4 + Search Console, solo lectura) ──
function makeAuth() {
  const scopes = ['https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/webmasters.readonly'];
  if (env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const sa = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new google.auth.JWT({ email: sa.client_email, key: sa.private_key, scopes });
  }
  return new google.auth.JWT({ email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL, key: (env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'), scopes });
}
const auth = makeAuth();
const ga4 = google.analyticsdata({ version: 'v1beta', auth });
const gsc = google.webmasters({ version: 'v3', auth });

const iso = d => d.toISOString().slice(0, 10);
const daysAgo = n => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d; };
const GSC_END = 3; // GSC tiene ~3 días de retraso

// ── Search Console ──
let SITE = null;
async function resolveSite() {
  for (const s of SITE_CANDIDATES) {
    try {
      await gsc.searchanalytics.query({ siteUrl: s, requestBody: { startDate: iso(daysAgo(10)), endDate: iso(daysAgo(GSC_END)), dimensions: ['date'], rowLimit: 1 } });
      return s;
    } catch (e) { /* siguiente */ }
  }
  return null;
}
async function gscQuery({ startDate, endDate, dimensions = [], rowLimit = 25, filters = null }) {
  const body = { startDate, endDate, dimensions, rowLimit };
  if (filters) body.dimensionFilterGroups = [{ filters }];
  return (await gsc.searchanalytics.query({ siteUrl: SITE, requestBody: body })).data.rows || [];
}
async function gscTotals(startDate, endDate, filters = null) {
  const r = (await gscQuery({ startDate, endDate, dimensions: [], rowLimit: 1, filters }))[0];
  return { clicks: r?.clicks || 0, impressions: r?.impressions || 0, ctr: r?.ctr || 0, position: r?.position || 0 };
}
async function weeklyTrend(weeks = 5) {
  const out = [];
  for (let i = 0; i < weeks; i++) {
    const end = daysAgo(GSC_END + i * 7), start = daysAgo(GSC_END + i * 7 + 6);
    try { out.push({ week: `${iso(start)}→${iso(end)}`, ...(await gscTotals(iso(start), iso(end))) }); }
    catch (e) { out.push({ week: `${iso(start)}→${iso(end)}`, error: e.message }); }
  }
  return out.reverse();
}

// ── GA4 ──
async function ga4Report(dimensions, metrics, filter, range) {
  try {
    const res = await ga4.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [range], dimensions: dimensions.map(n => ({ name: n })), metrics: metrics.map(n => ({ name: n })),
        dimensionFilter: filter || undefined, limit: 25, orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
      },
    });
    return res.data.rows || [];
  } catch (e) { return []; }
}
async function ga4Totals(range) {
  try {
    const res = await ga4.properties.runReport({ property: `properties/${GA4_PROPERTY}`, requestBody: { dateRanges: [range], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'screenPageViews' }] } });
    const v = res.data.rows?.[0]?.metricValues || [];
    return { sessions: +(v[0]?.value || 0), users: +(v[1]?.value || 0), pageviews: +(v[2]?.value || 0) };
  } catch (e) { return { error: e.message }; }
}
async function ga4CtaClicks(range) {
  const rows = await ga4Report(
    ['customEvent:event_label', 'pagePath'], ['eventCount'],
    { filter: { fieldName: 'eventName', inListFilter: { values: ['click_link', 'click_button', 'conversion_click'] } } }, range);
  return rows.map(r => ({ label: r.dimensionValues[0].value || '(sin texto)', page: r.dimensionValues[1].value || '/', clicks: +r.metricValues[0].value }));
}

// ── Leer el contenido real de una página del repo (title + description) ──
function pathToFile(p) {
  p = (p || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0].replace(/\/$/, '');
  if (p === '' ) return 'src/pages/index.astro';
  return 'src/pages' + p + '.astro';
}
function getMeta(src, key) {
  let m = src.match(new RegExp('const\\s+' + key + '\\s*=\\s*"([^"]*)"')) || src.match(new RegExp(key + '\\s*=\\s*"([^"]*)"'));
  return m ? m[1] : null;
}
function readPageMeta(path) {
  try {
    const file = join(ROOT, pathToFile(path));
    if (!existsSync(file)) return null;
    const src = readFileSync(file, 'utf8');
    const h1 = (src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
    return { path, title: getMeta(src, 'title'), description: getMeta(src, 'description'), h1: h1 || null };
  } catch (e) { return null; }
}

// ── DeepSeek: el analista ──
async function analyze(payload) {
  if (!DEEPSEEK_KEY) return { error: 'DEEPSEEK_API_KEY no configurada' };
  const prompt = `Eres un analista SEO senior. ${BUSINESS_CONTEXT}

Tienes los datos de Search Console (núcleo), GA4 (incluye clics de CTA), el CONTENIDO REAL de las páginas (title/description/h1) y las campañas. Analiza la semana y su tendencia. Sé concreto, honesto y accionable; cero paja. Si algo sube, dilo y no lo toques. Si hay CTR bajo con impresiones altas, es oportunidad (propón un title/description NUEVO concreto usando el actual que te doy). Prioriza siempre acciones que empujen tráfico a Wazuh/cursos y que mejoren la conversión de los blogs (CTA).

Devuelve EXCLUSIVAMENTE un JSON válido (sin texto extra) con esta forma:
{
 "resumen": "2-4 frases del estado y tendencia, orientado a Wazuh/cursos",
 "cambiar": ["accion concreta priorizada: pagina + que cambiar + por que (si es title/description, escribe la propuesta nueva)", "..."],
 "mantener": ["que va bien, no tocar", "..."],
 "cta": ["observacion sobre CTA de blogs: pagina con visitas pero pocos clics de CTA, o CTA que funciona", "..."],
 "keywords": ["keyword/oportunidad a trabajar y de que dato sale", "..."],
 "ideas_contenido": ["idea de blog o video concreta ligada a un dato, que atraiga clientes hacia Wazuh/cursos", "..."],
 "campanas": [{"nombre":"...", "valoracion":"mejora/empeora/estable + por que"}]
}

DATOS (JSON):
${JSON.stringify(payload).slice(0, 16000)}`;
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({ model: 'deepseek-v4-flash', temperature: 0.4, max_tokens: 3000, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) { let b = ''; try { b = (await res.text()).slice(0, 300); } catch (e) {} return { error: `DeepSeek HTTP ${res.status}${b ? ': ' + b : ''}` }; }
    const data = await res.json();
    let txt = (data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || '').replace(/```json|```/g, '').trim();
    if (!txt) return { error: 'DeepSeek devolvió contenido vacío' };
    const s = txt.indexOf('{'), e = txt.lastIndexOf('}');
    if (s < 0 || e < 0) return { error: 'Respuesta sin JSON: ' + txt.slice(0, 200) };
    try { return JSON.parse(txt.slice(s, e + 1)); } catch (err) { return { error: 'JSON inválido de DeepSeek: ' + txt.slice(0, 200) }; }
  } catch (e) { return { error: e.message }; }
}

// ── Render ──
const pct = (c, p) => (!p ? '' : `${c >= p ? '▲' : '▼'} ${Math.abs(Math.round((c - p) / p * 100))}%`);
const esc = s => String(s ?? '').replace(/</g, '&lt;');
const li = arr => (arr && arr.length ? `<ul style="margin:6px 0 0;padding-left:18px;color:#334155;font-size:13px;line-height:1.6;">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p style="color:#94a3b8;font-size:13px;">—</p>');
function tbl(headers, rows) {
  if (!rows.length) return '<p style="color:#94a3b8;font-size:13px;">Sin datos</p>';
  return `<table style="width:100%;border-collapse:collapse;font-size:12.5px;background:#fff;border-radius:8px;overflow:hidden;"><thead><tr>${headers.map((h, i) => `<th style="padding:8px 10px;background:#f1f5f9;color:#475569;text-align:${i ? 'right' : 'left'};font-size:11px;text-transform:uppercase;">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td style="padding:7px 10px;border-bottom:1px solid #eef2f7;text-align:${i ? 'right' : 'left'};color:#334155;">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const block = (title, inner) => `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px 18px;margin-bottom:16px;"><h3 style="margin:0 0 8px;font-size:14px;color:#1e3a5f;">${title}</h3>${inner}</div>`;

async function main() {
  const cur = { start: iso(daysAgo(GSC_END + 6)), end: iso(daysAgo(GSC_END)) };
  const prev = { start: iso(daysAgo(GSC_END + 13)), end: iso(daysAgo(GSC_END + 7)) };
  SITE = await resolveSite();
  const notes = [];

  // GSC
  let gscCur = {}, gscPrev = {}, trend = [], topQueries = [], topPages = [], lowCtr = [];
  if (SITE) {
    try {
      gscCur = await gscTotals(cur.start, cur.end);
      gscPrev = await gscTotals(prev.start, prev.end);
      trend = await weeklyTrend(5);
      const q = await gscQuery({ startDate: cur.start, endDate: cur.end, dimensions: ['query'], rowLimit: 100 });
      topQueries = q.slice(0, 15);
      lowCtr = q.filter(r => r.impressions >= 30 && r.position >= 4 && r.position <= 20 && r.ctr < 0.03).sort((a, b) => b.impressions - a.impressions).slice(0, 10);
      topPages = await gscQuery({ startDate: cur.start, endDate: cur.end, dimensions: ['page'], rowLimit: 15 });
    } catch (e) { notes.push('Search Console error: ' + e.message); }
  } else {
    notes.push('⚠️ Search Console: sin acceso (la cuenta de servicio no tiene permiso de lectura en la propiedad). Añádela como usuario en Search Console para activar el análisis de CTR/posición.');
  }

  // GA4 (totales + CTA)
  const ga4Cur = await ga4Totals(cur), ga4Prev = await ga4Totals(prev);
  if (ga4Cur.error) notes.push('GA4 error: ' + ga4Cur.error);
  const cta = await ga4CtaClicks(cur);

  // Contenido real de páginas foco (top GSC + prioritarias)
  const focusPaths = [...new Set([...topPages.slice(0, 6).map(r => (r.keys?.[0] || '').replace('https://aisecurity.es', '')), ...PRIORITY_PAGES])].filter(Boolean).slice(0, 10);
  const pageContent = focusPaths.map(readPageMeta).filter(Boolean);

  // Campañas
  const cfg = JSON.parse(readFileSync(join(__dirname, 'seo-analyst/campaigns.json'), 'utf-8'));
  const campaigns = [];
  for (const c of (cfg.campaigns || [])) {
    if (!SITE) { campaigns.push({ name: c.name, note: c.note, error: 'sin GSC' }); continue; }
    let cc = { clicks: 0, impressions: 0 }, cp = { clicks: 0, impressions: 0 };
    try {
      for (const p of c.paths) {
        const f = [{ dimension: 'page', operator: 'contains', expression: p }];
        const a = await gscTotals(cur.start, cur.end, f), b = await gscTotals(prev.start, prev.end, f);
        cc.clicks += a.clicks; cc.impressions += a.impressions; cp.clicks += b.clicks; cp.impressions += b.impressions;
      }
      campaigns.push({ name: c.name, note: c.note, cur: cc, prev: cp });
    } catch (e) { campaigns.push({ name: c.name, note: c.note, error: e.message }); }
  }

  // Análisis IA
  const payload = {
    periodo: cur, comparado_con: prev,
    gsc: {
      actual: gscCur, anterior: gscPrev, tendencia_semanal: trend,
      top_queries: topQueries.map(r => ({ q: r.keys?.[0], clicks: r.clicks, impr: r.impressions, ctr: +(r.ctr * 100).toFixed(1), pos: +r.position.toFixed(1) })),
      ctr_bajo: lowCtr.map(r => ({ q: r.keys?.[0], impr: r.impressions, ctr: +(r.ctr * 100).toFixed(1), pos: +r.position.toFixed(1) })),
      top_pages: topPages.map(r => ({ page: (r.keys?.[0] || '').replace('https://aisecurity.es', ''), clicks: r.clicks, impr: r.impressions, ctr: +(r.ctr * 100).toFixed(1) })),
    },
    ga4: { actual: ga4Cur, anterior: ga4Prev, cta_clicks: cta.slice(0, 20) },
    contenido_paginas: pageContent,
    campanas: campaigns.map(c => ({ nombre: c.name, actual: c.cur, anterior: c.prev, nota: c.note })),
  };
  const ai = await analyze(payload);

  // ── Email ──
  const aiBlock = ai.error
    ? `<p style="color:#b45309;font-size:13px;">No se pudo generar el análisis IA: ${esc(ai.error)}</p>`
    : `${block('📌 Resumen', `<p style="margin:0;font-size:13.5px;color:#0f172a;line-height:1.6;">${esc(ai.resumen)}</p>`)}
       ${block('🔧 Qué cambiar (prioridad)', li(ai.cambiar))}
       ${block('✅ Qué mantener', li(ai.mantener))}
       ${block('🖱️ CTA de blogs', li(ai.cta))}
       ${block('🔑 Oportunidades de keyword', li(ai.keywords))}
       ${block('💡 Ideas de contenido (blog/vídeo)', li(ai.ideas_contenido))}
       ${block('🚀 Campañas (valoración IA)', li((ai.campanas || []).map(c => `${c.nombre}: ${c.valoracion}`)))}`;

  const trendRows = trend.filter(t => !t.error).map(t => [t.week, t.clicks, t.impressions, (t.ctr * 100).toFixed(1) + '%', t.position.toFixed(1)]);
  const qRows = topQueries.map(r => [esc(r.keys?.[0]), r.clicks, r.impressions, (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)]);
  const lowRows = lowCtr.map(r => [esc(r.keys?.[0]), r.impressions, (r.ctr * 100).toFixed(1) + '%', r.position.toFixed(1)]);
  const pRows = topPages.map(r => [esc((r.keys?.[0] || '').replace('https://aisecurity.es', '')), r.clicks, r.impressions, (r.ctr * 100).toFixed(1) + '%']);
  const ctaRows = cta.slice(0, 12).map(c => [esc(c.label), esc(c.page), c.clicks]);
  const campRows = campaigns.map(c => c.error ? [esc(c.name), 'error: ' + c.error, '', esc(c.note || '')] : [esc(c.name), `${c.cur.clicks} (${pct(c.cur.clicks, c.prev.clicks) || '='})`, `${c.cur.impressions} (${pct(c.cur.impressions, c.prev.impressions) || '='})`, esc(c.note || '')]);

  const html = `<div style="font-family:system-ui,sans-serif;background:#f1f5f9;padding:24px;max-width:720px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:12px;padding:24px 28px;margin-bottom:18px;">
      <h1 style="color:#fff;margin:0;font-size:20px;">🧠 Análisis SEO semanal (IA)</h1>
      <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:13px;">aisecurity.es · ${cur.start} → ${cur.end} · SEO clásico &gt; GEO · read-only</p>
    </div>
    ${notes.length ? block('ℹ️ Notas de datos', li(notes)) : ''}
    ${aiBlock}
    ${block('📈 Tendencia semanal (Search Console)', tbl(['Semana', 'Clics', 'Impres.', 'CTR', 'Pos.'], trendRows))}
    ${block('🚀 Campañas (datos)', tbl(['Campaña', 'Clics (Δ)', 'Impres. (Δ)', 'Nota'], campRows))}
    ${block('🎯 CTR bajo = oportunidad', tbl(['Query', 'Impres.', 'CTR', 'Pos.'], lowRows))}
    ${block('🖱️ Clics de CTA (GA4)', tbl(['Botón / enlace', 'Página', 'Clics'], ctaRows))}
    ${block('🔎 Top queries', tbl(['Query', 'Clics', 'Impres.', 'CTR', 'Pos.'], qRows))}
    ${block('📄 Top páginas (GSC)', tbl(['Página', 'Clics', 'Impres.', 'CTR'], pRows))}
    ${block('👥 GA4', `<p style="font-size:13px;color:#334155;margin:0;">Sesiones ${ga4Cur.sessions ?? '-'} (${pct(ga4Cur.sessions, ga4Prev.sessions) || '='}) · Usuarios ${ga4Cur.users ?? '-'} · Páginas vistas ${ga4Cur.pageviews ?? '-'}</p>`)}
    <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:12px;">Generado automáticamente · no aplica cambios · campañas en scripts/seo-analyst/campaigns.json</p>
  </div>`;

  if (!env.RESEND_API_KEY) { console.log('Sin RESEND_API_KEY. AI:', JSON.stringify(ai).slice(0, 400)); return; }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'AI Security Analytics <info@aisecurity.es>', to: [EMAIL_TO], subject: `🧠 Análisis SEO semanal — ${cur.end}`, html }),
  });
  console.log('Email:', r.status, SITE ? `(GSC ${SITE})` : '(sin GSC)', 'IA:', ai.error ? 'ERROR ' + ai.error : 'OK');
}

main().catch(e => { console.error(e); process.exit(1); });

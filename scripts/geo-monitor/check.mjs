#!/usr/bin/env node
/**
 * geo-monitor — mide si la IA nos CITA para consultas de Wazuh.
 *
 * En la era AI Search la señal de visibilidad es la CITACIÓN, no la posición
 * (ver docs/seo/README.md). Este script lanza un set fijo de prompts (prompts.json)
 * contra los LLMs cuya API key esté configurada, detecta si aparece la marca en la
 * respuesta y guarda el histórico para ver la tendencia.
 *
 * Proveedores (se activan si existe su env key):
 *   - DEEPSEEK_API_KEY   → deepseek-chat        (https://api.deepseek.com)
 *   - OPENAI_API_KEY     → gpt-4o-mini          (https://api.openai.com)
 *   - PERPLEXITY_API_KEY → sonar                (https://api.perplexity.ai)
 *
 * IMPORTANTE: un LLM sin búsqueda web (p. ej. DeepSeek) refleja lo que "sabe" de
 * memoria, no lo que citaría con navegación. Es un baseline barato; el chequeo
 * fiable de ChatGPT/Perplexity/Google AI Mode se hace a mano (ver README.md).
 *
 * Uso:  node scripts/geo-monitor/check.mjs
 * Salida: history.json (histórico) + last-report.md (legible)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'prompts.json'), 'utf-8'));
const HISTORY = path.join(__dirname, 'history.json');
const REPORT = path.join(__dirname, 'last-report.md');

const PROVIDERS = [
  { id: 'deepseek',   env: 'DEEPSEEK_API_KEY',   url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
  { id: 'openai',     env: 'OPENAI_API_KEY',     url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  { id: 'perplexity', env: 'PERPLEXITY_API_KEY', url: 'https://api.perplexity.ai/chat/completions',  model: 'sonar' },
].filter(p => (process.env[p.env] || '').trim());

async function ask(provider, prompt) {
  const res = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env[provider.env].trim()}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`${provider.id} HTTP ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

// Frases de "no te conozco" — en prompts marcados el modelo repite el nombre de
// la marca (viene en la pregunta) solo para decir que no tiene datos. Ese eco NO
// es una cita real, así que lo marcamos como "disclaimed" y no cuenta.
const IGNORANCE = /(no tengo|no dispongo|no puedo (confirmar|proporcionar|verificar|dar)|no encontr|no hay información|no existe información|desconozco|no me consta|información específica sobre|not familiar|i (don'?t|do not) have|cannot (provide|confirm|verify)|no data|couldn'?t find|i'?m not aware|no specific information|no verifiable)/i;

// Detecta marca, si la respuesta la desconoce (eco vacío) y una posible recomendación.
function detect(answer, names) {
  const low = answer.toLowerCase();
  const hit = names.find(n => low.includes(n.toLowerCase()));
  if (!hit) return { mentioned: false, recommended: false, disclaimed: false, snippet: null };
  const idx = low.indexOf(hit.toLowerCase());
  const snippet = answer.slice(Math.max(0, idx - 90), idx + 90).replace(/\s+/g, ' ').trim();
  const disclaimed = IGNORANCE.test(answer);
  const recommended = !disclaimed && /(recomiend|recommend|mejor opción|best (option|choice)|top choice|ideal para|great option|opción sólida)/i.test(snippet);
  return { mentioned: true, recommended, disclaimed, snippet };
}

// Etiqueta de estado consistente (consola y report).
function statusLabel(r) {
  if (r.error) return `⚠️ ${r.error}`;
  if (r.recommended) return '⭐ recomendado';
  if (r.mentioned && r.disclaimed) return '🚫 no nos conoce';
  if (r.mentioned) return '✅ mencionado';
  return '— ausente';
}

async function main() {
  if (!PROVIDERS.length) {
    console.error('❌ Ningún proveedor configurado. Define DEEPSEEK_API_KEY / OPENAI_API_KEY / PERPLEXITY_API_KEY.');
    process.exit(1);
  }
  console.log(`🔎 geo-monitor — ${cfg.prompts.length} prompts × ${PROVIDERS.length} proveedor(es)\n`);

  const run = { date: new Date().toISOString(), results: [] };

  for (const provider of PROVIDERS) {
    for (const p of cfg.prompts) {
      let out;
      try {
        const answer = await ask(provider, p.text);
        out = { provider: provider.id, id: p.id, type: p.type, lang: p.lang, ...detect(answer, cfg.brand.names) };
      } catch (e) {
        out = { provider: provider.id, id: p.id, type: p.type, lang: p.lang, error: e.message };
      }
      run.results.push(out);
      console.log(`  [${provider.id}] ${p.id.padEnd(7)} ${statusLabel(out)}`);
    }
  }

  // Resumen de tasas de citación por proveedor.
  const summary = PROVIDERS.map(pr => {
    const rows = run.results.filter(r => r.provider === pr.id && !r.error);
    // "Mención real" = aparece Y no es un eco de desconocimiento.
    const mentioned = rows.filter(r => r.mentioned && !r.disclaimed).length;
    const recommended = rows.filter(r => r.recommended).length;
    // Descubrimiento = citas reales en prompts NO marcados (los que de verdad importan).
    const discovery = rows.filter(r => r.type !== 'branded' && r.mentioned && !r.disclaimed).length;
    const discoveryTotal = rows.filter(r => r.type !== 'branded').length;
    return { provider: pr.id, total: rows.length, mentioned, recommended, discovery, discoveryTotal };
  });
  run.summary = summary;

  const history = fs.existsSync(HISTORY) ? JSON.parse(fs.readFileSync(HISTORY, 'utf-8')) : { runs: [] };
  history.runs.push(run);
  if (history.runs.length > 52) history.runs = history.runs.slice(-52);
  fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2));

  const md = [
    `# GEO Monitor — citación de marca en IA`,
    `**Fecha:** ${new Date(run.date).toLocaleString('es-ES')}`,
    '',
    `> **Descubrimiento** = citas reales en prompts NO marcados (la métrica que importa).`,
    `> Los prompts marcados que solo repiten el nombre para decir que no nos conocen se marcan 🚫 y no cuentan.`,
    '',
    `## Tasa de citación por proveedor`,
    `| Proveedor | Descubrimiento | Menciones reales | Recomendaciones |`,
    `|-----------|----------------|------------------|-----------------|`,
    ...summary.map(s => `| ${s.provider} | ${s.discovery}/${s.discoveryTotal} | ${s.mentioned} | ${s.recommended} |`),
    '',
    `## Detalle`,
    `| Proveedor | Prompt | Tipo | Estado | Contexto |`,
    `|-----------|--------|------|--------|----------|`,
    ...run.results.map(r =>
      `| ${r.provider} | ${r.id} | ${r.type} | ${statusLabel(r)} | ${r.snippet ? '…' + r.snippet.replace(/\|/g, '\\|') + '…' : (r.error || '')} |`
    ),
  ].join('\n');
  fs.writeFileSync(REPORT, md);

  console.log('\n📊 Resumen:');
  summary.forEach(s => console.log(`  ${s.provider}: descubrimiento ${s.discovery}/${s.discoveryTotal} · ${s.mentioned} menciones reales · ${s.recommended} recomendaciones`));
  console.log(`\n✅ history.json y last-report.md actualizados`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
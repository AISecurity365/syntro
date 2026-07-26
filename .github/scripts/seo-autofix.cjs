#!/usr/bin/env node
'use strict';
/**
 * seo-autofix — analiza las páginas .astro modificadas, detecta fallos SEO/GEO,
 * los corrige con IA (DeepSeek) mediante reemplazos DIRIGIDOS (nunca reescribe el
 * archivo entero) y, SOLO si mejora algo, hace commit + push y envía un email.
 * Sin mejoras → ni commit ni email.
 */
const fs = require('fs');
const { execSync } = require('child_process');

const DEEPSEEK_KEY = (process.env.DEEPSEEK_API_KEY || '').trim();
const RESEND_KEY   = (process.env.RESEND_API_KEY || '').trim();
const EMAIL_TO     = (process.env.EMAIL_TO || 'julen.sistemas@gmail.com').trim();

const FILES = (process.env.CHANGED_FILES || '')
  .split('\n').map(s => s.trim()).filter(Boolean)
  .filter(f => f.endsWith('.astro') && !f.includes('/api/') && !f.includes('/_'));

const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Extraer title/description del source (const o prop) ──
function getStr(src, key) {
  let m = src.match(new RegExp('const\\s+' + key + '\\s*=\\s*"([^"]*)"'));
  if (m) return { value: m[1], find: `const ${key} = "${m[1]}"`, repl: v => `const ${key} = "${v}"` };
  m = src.match(new RegExp(key + '\\s*=\\s*"([^"]*)"'));
  if (m) return { value: m[1], find: `${key}="${m[1]}"`, repl: v => `${key}="${v}"` };
  return null;
}

function analyze(src, file) {
  const isEn = file.includes('/en/');
  const t = getStr(src, 'title');
  const d = getStr(src, 'description');
  const issues = [];
  if (t && (t.value.length < 40 || t.value.length > 70)) issues.push('title');
  if (d && (d.value.length < 120 || d.value.length > 165)) issues.push('desc');

  const hs = [...src.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map(m => ({ inner: m[2], text: stripTags(m[2]), plain: !/[<]/.test(m[2]) }))
    .filter(h => h.text);
  let badHeadings = [];
  if (!isEn && hs.length > 2) {
    const q = hs.filter(h => h.text.startsWith('¿')).length;
    if (q / hs.length < 0.6) {
      badHeadings = hs.filter(h => !h.text.startsWith('¿') && h.plain).slice(0, 8);
      if (badHeadings.length) issues.push('headings');
    }
  }
  return { isEn, t, d, hs, badHeadings, issues };
}

async function deepseek(messages) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({ model: 'deepseek-v4-flash', temperature: 0.4, messages }),
  });
  if (!res.ok) throw new Error('DeepSeek HTTP ' + res.status);
  const d = await res.json();
  let txt = d.choices?.[0]?.message?.content || '';
  txt = txt.replace(/```json|```/g, '').trim();
  const s = txt.indexOf('{'), e = txt.lastIndexOf('}');
  return JSON.parse(txt.slice(s, e + 1));
}

async function fixFile(file) {
  if (!fs.existsSync(file)) return null;
  let src = fs.readFileSync(file, 'utf8');
  const a = analyze(src, file);
  if (!a.issues.length) return null;

  const lang = a.isEn ? 'English' : 'español';
  const prompt = `Eres un editor SEO senior (idioma: ${lang}). Corrige SOLO lo que se pide. Devuelve EXCLUSIVAMENTE un JSON válido, sin texto extra.

PRIORIDAD (importante): las buenas prácticas **SEO clásicas** mandan (son las que dominan el mercado). Optimiza para clic real en Google (CTR): keyword principal al principio, título claro, atractivo y honesto (sin clickbait). Las buenas prácticas **GEO** (formato pregunta, lenguaje natural para IA) son SECUNDARIAS y **NUNCA** deben empeorar la keyword ni la claridad SEO. Ante duda, gana el SEO.

Reglas:
- "title": reescríbelo si mide <40 o >70 caracteres. Keyword principal al inicio + marca "AI Security" si ya estaba. 50-65 ideal, orientado a CTR. Si ya está bien, pon null.
- "description": reescríbela si mide <120 o >165 caracteres. 140-160 ideal, con la keyword y un gancho/CTA que suba el CTR. Si está bien, pon null.
- "headings": SOLO español. Convierte a pregunta (¿…?) **solo si sigue siendo natural y conserva la keyword**; si forzar la pregunta perjudica el SEO, NO lo incluyas (deja el titular como está). Devuelve [] si no se piden.
- No inventes datos. No cambies el idioma.

Datos actuales:
title (${a.t ? a.t.value.length : 0} car.): ${a.t ? a.t.value : '—'}
description (${a.d ? a.d.value.length : 0} car.): ${a.d ? a.d.value : '—'}
headings_a_convertir: ${JSON.stringify(a.badHeadings.map(h => h.text))}

Formato de salida:
{"title": null|"...", "description": null|"...", "headings": [{"from":"texto original","to":"¿pregunta?"}]}`;

  let out;
  try {
    out = await deepseek([{ role: 'user', content: prompt }]);
  } catch (e) { console.log(`  ⚠️ DeepSeek falló en ${file}: ${e.message}`); return null; }

  const changes = [];
  // Title
  if (a.issues.includes('title') && out.title && typeof out.title === 'string') {
    const nt = out.title.trim();
    if (nt.length >= 40 && nt.length <= 70 && a.t && src.includes(a.t.find)) {
      src = src.replace(a.t.find, a.t.repl(nt.replace(/"/g, "'")));
      changes.push({ k: 'Title', from: a.t.value, to: nt });
    }
  }
  // Description
  if (a.issues.includes('desc') && out.description && typeof out.description === 'string') {
    const nd = out.description.trim();
    if (nd.length >= 120 && nd.length <= 165 && a.d && src.includes(a.d.find)) {
      src = src.replace(a.d.find, a.d.repl(nd.replace(/"/g, "'")));
      changes.push({ k: 'Description', from: a.d.value, to: nd });
    }
  }
  // Headings (solo plano, reemplazo dirigido del texto interno)
  if (Array.isArray(out.headings)) {
    for (const h of out.headings) {
      if (!h || !h.from || !h.to || !h.to.startsWith('¿')) continue;
      const re = new RegExp('(<h([23])[^>]*>)\\s*' + esc(h.from) + '\\s*(</h\\2>)');
      if (re.test(src)) {
        src = src.replace(re, `$1${h.to}$3`);
        changes.push({ k: 'Heading', from: h.from, to: h.to });
      }
    }
  }

  if (!changes.length) return null;
  // Re-validar: que no haya empeorado nada obvio (longitudes ok)
  const after = analyze(src, file);
  if (after.issues.length >= a.issues.length && !changes.some(c => c.k === 'Heading')) return null;

  fs.writeFileSync(file, src, 'utf8');
  return { file, changes, before: a.issues.length, after: after.issues.length };
}

function emailHtml(results) {
  const rows = results.map(r => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;margin-bottom:14px;">
      <div style="font-family:monospace;font-size:13px;color:#4f46e5;margin-bottom:10px;">${r.file.replace('src/pages/', '/').replace(/\.astro$/, '')}</div>
      ${r.changes.map(c => `
        <div style="margin-bottom:10px;">
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">${c.k}</div>
          <div style="font-size:13px;color:#b91c1c;text-decoration:line-through;">${c.from}</div>
          <div style="font-size:13px;color:#15803d;font-weight:600;">${c.to}</div>
        </div>`).join('')}
    </div>`).join('');
  return `<div style="font-family:'Segoe UI',sans-serif;max-width:620px;margin:0 auto;background:#f4f6f9;padding:28px;">
    <h1 style="font-size:20px;color:#0f172a;margin:0 0 6px;">🤖 Auto-mejora SEO/GEO aplicada</h1>
    <p style="font-size:14px;color:#475569;margin:0 0 20px;">El bot detectó y corrigió mejoras en ${results.length} página(s). Cambios ya commiteados a <code>main</code>.</p>
    ${rows}
    <p style="font-size:12px;color:#94a3b8;margin-top:18px;">AI Security · SEO/GEO bot</p>
  </div>`;
}

async function sendEmail(results) {
  if (!RESEND_KEY) { console.log('  ⚠️ RESEND_API_KEY no configurada — sin email'); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'AI Security SEO Bot <info@aisecurity.es>',
      to: [EMAIL_TO],
      subject: `🤖 SEO/GEO: ${results.length} página(s) mejoradas automáticamente`,
      html: emailHtml(results),
    }),
  });
  console.log(`  📧 Email: HTTP ${res.status}`);
}

async function main() {
  if (!FILES.length) { console.log('Sin páginas .astro que analizar.'); return; }
  if (!DEEPSEEK_KEY) { console.log('⚠️ DEEPSEEK_API_KEY no configurada — no se puede auto-mejorar.'); return; }
  console.log(`Analizando ${FILES.length} página(s):\n${FILES.join('\n')}\n`);

  const results = [];
  for (const f of FILES) {
    try {
      const r = await fixFile(f);
      if (r) { console.log(`  ✅ Mejorada: ${f} (${r.changes.length} cambio/s)`); results.push(r); }
      else { console.log(`  ➖ Sin cambios: ${f}`); }
    } catch (e) { console.log(`  ⚠️ Error en ${f}: ${e.message}`); }
  }

  if (!results.length) { console.log('\nNada que mejorar. No se envía email ni se commitea.'); return; }

  // Commit + push
  try {
    execSync('git config user.name "AI Security SEO Bot"');
    execSync('git config user.email "info@aisecurity.es"');
    execSync('git add ' + results.map(r => `"${r.file}"`).join(' '));
    execSync('git commit -m "chore(seo-bot): auto-mejora SEO/GEO de ' + results.length + ' pagina(s) [skip ci]"');
    execSync('git push origin HEAD:main');
    console.log('\n🚀 Cambios commiteados y pusheados a main.');
  } catch (e) {
    console.log('⚠️ Error en git: ' + e.message);
  }

  await sendEmail(results);
}

main().catch(e => { console.error(e); process.exit(1); });

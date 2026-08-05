# Playbook — Blog aisecurity.es (Astro)

> Cómo se escribe y publica un post en el blog. Formato real del proyecto.
> Lo ejecuta el agente `blog-writer`. Ver también `geo-llm.md` y el `seo-specialist`.

---

## Público y objetivo

Decisores PyME ES que buscan en Google. Objetivo: **SEO/GEO + leads**. Pilares 1 y 2.

## Formato técnico (OBLIGATORIO seguirlo exacto)

Los posts son archivos `.astro` en `src/pages/blog/<slug>.astro` que usan `BlogLayout`:

```astro
---
import BlogLayout from "../../layouts/BlogLayout.astro";
---

<BlogLayout
  title="Título SEO (máx ~60 chars)"
  description="Meta description con propuesta de valor + CTA (máx ~155 chars)"
  publishDate="YYYY-MM-DD"
  author="AI Security"
  readTime="8 min"
  tags={["Tag1", "Tag2", "Inteligencia Artificial", "Casos de Uso"]}
  canonical="https://aisecurity.es/blog/<slug>">

<article>
<h1>Título con la keyword principal (puede ser pregunta)</h1>

<p>RESPUESTA DIRECTA en 2-3 frases (esto es lo que citan los LLM — regla GEO 1).</p>

<h2>¿Qué es / por qué importa…?</h2>
<p>…</p>

<h2>¿Cómo se hace…?</h2>
<!-- pasos, <pre><code class="language-xxx"> para código -->

<h2>¿Qué resultados reales da?</h2>
<!-- números concretos, caso real -->

<h2>¿Qué limitaciones tiene?</h2>
<!-- honestidad anti-hype -->

<h2>Preguntas frecuentes</h2>
<!-- + JSON-LD FAQPage -->

</article>
</BlogLayout>
```

## ⚠️ Regla automática del proyecto (CLAUDE.md)

Al crear el `.astro`, **en la misma operación** añadir el artículo al array `articles` en
`src/pages/blog/index.astro`. Es un único commit, no dos pasos. Objeto del array:

```js
{
  slug: "<slug>",
  title: "…",
  description: "…",
  publishDate: "YYYY-MM-DD",
  readTime: "8 min",
  tags: ["…"],
  category: "Inteligencia Artificial"   // o "Casos de Uso", "Wazuh", etc.
}
```

## SEO on-page (del seo-specialist)

- Title ≤ 60 chars, keyword principal al inicio.
- Description ≤ 155 chars, con CTA.
- Canonical siempre.
- Schema JSON-LD: `Article` + `FAQPage` (para las FAQ).
- Enlaces internos: a servicios relevantes (`/servicios/chatbot`, `/wazuh`, `/consultoria-ia`)
  y a otros posts del blog.

## GEO

Aplicar las 7 reglas de `geo-llm.md`. Imprescindibles: respuesta directa en el primer `<p>`,
H2 en pregunta, FAQ con JSON-LD, una limitación honesta.

## CTA (1 por post, al final)

Pilar 1 → `/presupuesto` o `/consultoria-ia`. Pilar 2 → `/wazuh` o `/curso-wazuh`.
Patrón usado en el proyecto: `/contacto-migracion?plan=X` pre-rellena el servicio.

## Versión EN

El post EN va en `src/pages/en/blog/<slug>.astro` usando **`BlogLayoutEn`** (no `BlogLayout`),
dentro de la estructura i18n `/en` (ver memoria `project_i18n_en`). Añadir a
`TRANSLATED_PATHS` y hreflang. No es traducción literal: adaptar ejemplos al mercado EN.

### Estándar visual EN (ago 2026) — igual que ES, mismo componente compartido

`BlogLayoutEn.astro` y `BlogLayout.astro` usan el **mismo diseño de bloques de código**:
cabecera tipo terminal con puntos + badge de lenguaje (detectado desde `language-xxx` en el
`<code>`, o heurística bash/powershell) + botón **"Copy"/"Copiar"** integrado (clases
`mc-pre` / `mc-header` / `mc-dots` / `mc-lang` / `mc-copy`). **Nunca** volver al patrón viejo
de un botón flotante "📋 Copy code" debajo del bloque — quedaba peor y ya no se usa en ningún
post. Al escribir código en un post, basta con `<pre><code class="language-bash">…</code></pre>`;
el layout añade la cabecera y el copiado automáticamente vía script — no hay que montarlo a mano.

### CTA de Wazuh en EN

Los posts de Wazuh en inglés usan `<WazuhEnCtaBlock />` (`src/components/blog/WazuhEnCtaBlock.astro`),
colocado **pronto** (justo tras el párrafo de respuesta directa, antes del primer `<h2>` — no al
final) para que tenga protagonismo. Enlaza a la waitlist del curso EN + a `/en/wazuh` (consultoría).
Además, sigue la regla 4bis de `docs/seo/README.md`: **1 enlace contextual en prosa** a `/en/wazuh`
en el punto de fricción del artículo (p. ej. "si aún no tienes Wazuh instalado…") — el curso no se
traduce, así que el contextual EN siempre apunta al servicio, nunca a un curso.

## Publicación

Commit + push a `main` → Vercel despliega. El hook Stop y el comportamiento automático del
proyecto ya hacen `git add -A` + commit + push. Tras el push de una página nueva, ejecutar
`node .github/scripts/check-page-quality.js` con `CHANGED_FILES`.

## Checklist antes de publicar
- [ ] `.astro` creado con formato `BlogLayout`.
- [ ] Añadido al array de `index.astro` (mismo commit).
- [ ] Respuesta directa en primer párrafo + H2 en pregunta + FAQ JSON-LD.
- [ ] 1 CTA al final, enlaces internos.
- [ ] Versión EN en `/en` con `BlogLayoutEn` + hreflang (si es de Wazuh: `<WazuhEnCtaBlock />` pronto + 1 contextual a `/en/wazuh`).
- [ ] `astro check` sin errores.

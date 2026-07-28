# Automatizaciones SEO — Scripts y GitHub Actions

Estado a **jul 2026**. Scripts en `scripts/seo-automation/` (+ `scripts/ga4-weekly-report.mjs` y `scripts/geo-monitor/`). Se ejecutan por GitHub Actions o a mano con Node.

---

## 🟢 Automatizaciones ACTIVAS

| Automatización | Workflow | Trigger | Qué hace | ¿Modifica el repo? |
|----------------|----------|---------|----------|--------------------|
| **Ping IndexNow** | `seo-ping.yml` | push a `main` (+ manual) | Notifica cambios a Bing/Yandex/Google (`5-ping-search-engines.js`). Espera al deploy de Vercel. | No, solo notifica |
| **Google Indexing API** | `google-indexing-on-push.yml` | push a `main` | Solicita indexación directa de URLs prioritarias a Google. | No |
| ~~**Auto-fix SEO/GEO con IA**~~ | `page-quality-check.yml` | **DESACTIVADO 28-jul-2026** → solo `workflow_dispatch` | Ver sección "Auto-fix desactivado" más abajo. Las reglas útiles pasaron al **checklist on-page a mano** de [README.md](README.md). | Ya no |
| **Monitor GEO (AI Search)** | `geo-monitor.yml` | día 1 de cada mes 07:00 UTC (+ manual) | Comprueba un set fijo de prompts Wazuh (ES+EN) en ChatGPT/Perplexity/Google AI Mode para ver si nos citan (`scripts/geo-monitor/check.mjs`). | Sí (guarda histórico) |
| **Analista SEO con IA** | `seo-ai-analyst.yml` | lunes 09:00 UTC (+ manual) | Reúne Search Console (núcleo) + GA4 (incluye **clics de CTA** por página) + el **contenido real de las páginas** (lee el repo del checkout: title/description/h1) y se lo pasa a **DeepSeek** (`v4-flash`) con el **contexto de negocio** (prioridad Wazuh/cursos, blogs como embudo). Devuelve un email **conciso**: conclusión + 2-4 comentarios clave + valoración de **Campañas** (`scripts/seo-ai-analyst.mjs`); debajo, una **vista rodante de las últimas 4 semanas** (S1→S4, GSC + sesiones GA4) + clics por semana de cada campaña, y el resto de tablas de datos. Las 4 semanas salen directas de GSC/GA4 (hay histórico desde la 1ª ejecución). Tiene **memoria semanal**: guarda su análisis en `scripts/seo-analyst/history.json` (commiteado por el workflow) y lee las 2 últimas semanas para no repetirse y detectar qué cambió. **Nunca aplica cambios**, solo informa. Campañas en `scripts/seo-analyst/campaigns.json`. | Sí (commit del histórico) |

---

## 🔴 Auto-fix desactivado (28-jul-2026)

`page-quality-check.yml` ya **no se dispara con push**: solo queda `workflow_dispatch`. Sus 4 commits del 28-jul fueron **revertidos**.

**Qué hacía mal:**
- Trataba **cualquier** `<h2>`/`<h3>` como titular de artículo, así que reescribía etiquetas de tarjeta de 2 palabras: "Servidor Linux" → "¿Cómo instalar Wazuh en servidor Linux?" dentro de una rejilla de `/curso-wazuh`.
- **Cuota ciega**: si menos del 60% de los headings eran preguntas, mandaba hasta 8 a convertir. No juzgaba caso por caso — empujaba al 60% pasara lo que pasara. De ahí la sensación de "siempre me lo cambia todo a preguntas": estaba programado para eso.
- Se cargaba la numeración de pasos (`<h3>1. Ping al servidor</h3>` → `¿Cómo hacer ping al servidor?`) y convertía afirmaciones en dudas ("Requisito previo: Conectividad con el servidor" → "¿Es necesaria la conectividad con el servidor?").
- **Los cambios de heading saltaban la revalidación entera** (`&& !changes.some(c => c.k === 'Heading')`): se commiteaban aunque no mejorase ninguna métrica. Era la puerta trasera por la que entraba todo.

**Qué hacía bien** (ahora en el checklist on-page a mano de [README.md](README.md)): longitudes de `title` (40-70) y `description` (120-165), keyword al principio y recorte de descriptions kilométricas. Le sobraban las exclamaciones de relleno tipo "¡Empieza ahora!".

El script `.github/scripts/seo-autofix.cjs` conserva los filtros que se le añadieron antes de apagarlo (solo headings sin atributos, fuera genéricos y de menos de 3 palabras, máximo 3 por página, revalidación sin vía de escape). **Antes de reactivar el trigger de push**: ejecutarlo varias veces en manual y revisar el diff a mano.

---

## 🔴 Automatizaciones DESACTIVADAS (June 2026 Spam Update)

Solo quedan en `workflow_dispatch` (manual). **Reactivar el cron únicamente con criterio editorial humano.**

| Script / Workflow | Por qué se desactivó |
|-------------------|----------------------|
| `1-update-dates.js` / `seo-update-dates.yml` — bump semanal de `modifiedDate` | **Frescura falsa** → señal penalizable. Subir fecha solo si el artículo cambia de verdad. |
| `3-ab-rotation.js` / `seo-ab-rotation.yml` — rotación A/B de títulos/meta (días 1 y 15) | **Scaled content abuse**. Además el sitio no tiene volumen para un test A/B estadístico. |
| `4-content-variations.js` — sinónimos/año en párrafos (era manual) | Mismo riesgo de contenido manipulativo a escala. |
| `ga4-weekly-report.yml` — informe semanal GA4+GSC de tablas planas (lunes 08:00) | **Reemplazado** por el analista IA (`seo-ai-analyst.yml`), que ya trae GA4 + GSC + análisis. Queda solo manual. |

---

## 🔌 Conexiones de datos

| Fuente | Cómo se conecta | Estado |
|--------|-----------------|--------|
| **Google Search Console** | Cuenta de servicio Google (Search Console API), solo lectura → informe semanal + **analista SEO IA** (núcleo: queries, CTR, posición) | ✅ Activa |
| **Google Analytics 4** | Cuenta de servicio Google (GA4 Data API) → informe semanal + analista IA | ✅ Activa |
| **Google Indexing API** | Cuenta de servicio `seo-automation@julensistemas.iam.gserviceaccount.com` | ✅ Activa (en push) |
| **IndexNow** (Bing/Yandex) | Clave en `public/` | ✅ Activa (en push) |
| **AI Search** (ChatGPT/Perplexity/Google AI Mode) | `scripts/geo-monitor/` con prompts fijos | ✅ Activa (mensual) |
| **Google Trends** | — | ❌ **Retirado** (jul 2026). Sin API oficial y Google bloquea IPs de CI. En su lugar, DeepSeek propone keywords/ideas a partir de las queries reales de GSC (más fiable). Para tendencia real haría falta API de pago (SerpAPI). |

> El informe *Generative AI* de GSC es **UI-only** (aún no en la API); sus impresiones van mezcladas en el total "web". Revisar a mano en la UI.

---

## 🛠️ Scripts (referencia)

En `scripts/seo-automation/`: `1-update-dates` · `2-google-indexing` · `3-ab-rotation` · `4-content-variations` · `5-ping-search-engines` · `6-search-console-report` · `7-fetch-and-save` / `7-fetch-monthly` / `7-weekly-seo-report` · `8-fetch-ga4` / `8-fetch-ga4-monthly` · `9-request-indexing` · `analyze-and-email` · `generate-email` · `send-email` · `run-all`.
Fuera de esa carpeta: `scripts/ga4-weekly-report.mjs`, `scripts/geo-monitor/check.mjs`, `scripts/index-new-blog-post.js`.

---

## ➕ Cómo cambiar o añadir automatizaciones

- **Nuevas URLs a indexar/pingear:** editar `URLS_TO_INDEX` en `2-google-indexing.js`, `9-request-indexing.js` y `5-ping-search-engines.js`.
- **Prompts del monitor GEO:** `scripts/geo-monitor/prompts.json`.
- **Cambiar horario/trigger:** editar el `cron` del workflow en `.github/workflows/`.
- **Nueva automatización recurrente:** crear script + workflow, y **actualizar este documento** (regla obligatoria).
- **Google Trends (si se decide añadir):** no hay API oficial estable; se suele usar una lib no oficial o export manual. Evaluar antes de invertir.

---

## 🔒 Ficheros sensibles (NO commitear — en `.gitignore`)

```
scripts/seo-automation/google-credentials.json   ← cuenta de servicio Google (rotar si se expone)
scripts/seo-automation/ab-state.json
scripts/seo-automation/ping-log.json
scripts/seo-automation/indexing-log.json
scripts/seo-automation/indexnow-key.txt
```
En CI, las credenciales llegan por **GitHub Secrets** (`GOOGLE_CREDENTIALS_JSON`, `RESEND_API_KEY`, `DEEPSEEK_API_KEY`, `EMAIL_TO`).

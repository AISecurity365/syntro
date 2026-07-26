# Automatizaciones SEO — Scripts y GitHub Actions

Estado a **jul 2026**. Scripts en `scripts/seo-automation/` (+ `scripts/ga4-weekly-report.mjs` y `scripts/geo-monitor/`). Se ejecutan por GitHub Actions o a mano con Node.

---

## 🟢 Automatizaciones ACTIVAS

| Automatización | Workflow | Trigger | Qué hace | ¿Modifica el repo? |
|----------------|----------|---------|----------|--------------------|
| **Ping IndexNow** | `seo-ping.yml` | push a `main` (+ manual) | Notifica cambios a Bing/Yandex/Google (`5-ping-search-engines.js`). Espera al deploy de Vercel. | No, solo notifica |
| **Google Indexing API** | `google-indexing-on-push.yml` | push a `main` | Solicita indexación directa de URLs prioritarias a Google. | No |
| **Auto-fix SEO/GEO con IA** | `page-quality-check.yml` | push a `main` | Analiza páginas cambiadas, detecta fallos SEO/GEO y los **corrige con DeepSeek** (cambios quirúrgicos). Commit `[skip ci]` + email **solo si mejora** (`.github/scripts/seo-autofix.cjs`). | Sí (auto-commit) |
| **Informe semanal GA4 + GSC** | `ga4-weekly-report.yml` | lunes 08:00 UTC (+ manual) | Descarga métricas de Google Analytics 4 + Search Console y envía email con tendencia (`scripts/ga4-weekly-report.mjs`). Solo lectura. | No |
| **Monitor GEO (AI Search)** | `geo-monitor.yml` | día 1 de cada mes 07:00 UTC (+ manual) | Comprueba un set fijo de prompts Wazuh (ES+EN) en ChatGPT/Perplexity/Google AI Mode para ver si nos citan (`scripts/geo-monitor/check.mjs`). | Sí (guarda histórico) |

---

## 🔴 Automatizaciones DESACTIVADAS (June 2026 Spam Update)

Solo quedan en `workflow_dispatch` (manual). **Reactivar el cron únicamente con criterio editorial humano.**

| Script / Workflow | Por qué se desactivó |
|-------------------|----------------------|
| `1-update-dates.js` / `seo-update-dates.yml` — bump semanal de `modifiedDate` | **Frescura falsa** → señal penalizable. Subir fecha solo si el artículo cambia de verdad. |
| `3-ab-rotation.js` / `seo-ab-rotation.yml` — rotación A/B de títulos/meta (días 1 y 15) | **Scaled content abuse**. Además el sitio no tiene volumen para un test A/B estadístico. |
| `4-content-variations.js` — sinónimos/año en párrafos (era manual) | Mismo riesgo de contenido manipulativo a escala. |

---

## 🔌 Conexiones de datos

| Fuente | Cómo se conecta | Estado |
|--------|-----------------|--------|
| **Google Search Console** | Cuenta de servicio Google (Search Console API), solo lectura → informe semanal | ✅ Activa |
| **Google Analytics 4** | Cuenta de servicio Google (GA4 Data API) → informe semanal | ✅ Activa |
| **Google Indexing API** | Cuenta de servicio `seo-automation@julensistemas.iam.gserviceaccount.com` | ✅ Activa (en push) |
| **IndexNow** (Bing/Yandex) | Clave en `public/` | ✅ Activa (en push) |
| **AI Search** (ChatGPT/Perplexity/Google AI Mode) | `scripts/geo-monitor/` con prompts fijos | ✅ Activa (mensual) |
| **Google Trends** | — | ❌ **No conectado.** Posible mejora: research automático de keywords/estacionalidad Wazuh. |

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

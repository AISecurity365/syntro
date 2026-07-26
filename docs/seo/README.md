# Documentación SEO — aisecurity.es

> Índice de toda la estrategia SEO del proyecto. Leer este archivo antes de trabajar en cualquier tarea relacionada con posicionamiento.

---

## Archivos en esta carpeta

| Archivo | Contenido |
|---------|-----------|
| [geo-posicionamiento.md](geo-posicionamiento.md) | Estrategia SEO geográfico (soporte técnico remoto). **Foco SECUNDARIO** ahora — la prioridad es Wazuh + IA |
| [automatizaciones.md](automatizaciones.md) | Scripts de automatización SEO: qué hacen, cómo usarlos, dónde se ejecutan |
| [plan-atencion-llamadas-cv.md](plan-atencion-llamadas-cv.md) | Plan de motor de captación para Atención de Llamadas IA (Comunidad Valenciana) |
| [ga4-data.md](ga4-data.md) | Snapshot de datos GA4 (lo regenera el script semanal) |
| [search-console-data.md](search-console-data.md) | Snapshot de datos Search Console (lo regenera el script semanal) |

---

## Contexto rápido del proyecto

**Sitio:** aisecurity.es — servicios de IA para PyMEs + ciberseguridad (Wazuh/ENS)  
**Propietario:** Julián, administrador de sistemas, 1 persona  
**Estado del dominio:** En producción en Vercel, dominio aisecurity.es activo

### Prioridad SEO (jul 2026)

1. **Wazuh** (`/wazuh`) — objetivo: ser *la* referencia de Wazuh/ENS en España/LATAM. Keywords: "implementar Wazuh España", "Wazuh ENS cumplimiento", "SIEM open source pymes". Canal YouTube → web.
2. **Cursos Wazuh** (`/curso-wazuh`, `/curso-wazuh-avanzado`) — "curso Wazuh", "curso Wazuh para empresas / equipo de TI".
3. **Servicios de IA** (`/servicios/*`) — "chatbot para empresas España", "automatización procesos pymes", "gestor documental IA".
4. **El resto** — soporte técnico geo (`/soporte-tecnico/[ciudad]`), desarrollo web. **Secundario/histórico**; la estrategia geo está en [geo-posicionamiento.md](geo-posicionamiento.md) pero ya no es el foco.

---

## Estado actual (jul 2026)

### Automatizaciones ACTIVAS (GitHub Actions)
Detalle completo en [automatizaciones.md](automatizaciones.md).
- **Cada push a main:** ping IndexNow (`seo-ping.yml`) + solicitud a Google Indexing API (`google-indexing-on-push.yml`) + **auto-fix SEO/GEO con IA** (`page-quality-check.yml`, corrige y avisa por email solo si mejora).
- **Cada lunes:** informe GA4 + Search Console por email (`ga4-weekly-report.yml`, solo lectura).
- **Mensual (día 1):** monitor GEO — comprueba si nos citan en ChatGPT/Perplexity/Google AI Mode (`geo-monitor.yml`).

### Crons DESACTIVADOS — riesgo June 2026 Spam Update
Solo `workflow_dispatch` (manual). Reactivar únicamente con criterio editorial humano:
- ~~bump de `modifiedDate` semanal (`seo-update-dates.yml`, script 1)~~ → *frescura falsa*.
- ~~rotación A/B de títulos/meta días 1 y 15 (`seo-ab-rotation.yml`, script 3)~~ → *scaled content abuse*.

### Conexiones de datos
- **Search Console** y **Google Analytics 4**: vía cuenta de servicio Google (informe semanal). Solo lectura.
- **Google Trends**: ❌ no conectado aún (posible mejora futura para research de keywords).

---

## Decisiones de diseño importantes

1. **Páginas geo son 100% remotas** — el servicio se presta en remoto desde Benicarlò pero las páginas apuntan a ciudades con volumen de búsqueda. Cada página debe mencionar explícitamente que es servicio remoto.

2. **No duplicar contenido** — cada página geo tiene al menos un párrafo único sobre esa ciudad/región. El resto puede ser igual.

3. **Schema JSON-LD en todas las páginas de servicio** — tipo `LocalBusiness` o `Service` según corresponda.

4. **Blog de concienciación = embudo hacia test de empleados** — los artículos de phishing/contraseñas apuntan a `/servicios/test-concienciacion-empleados`.

5. **Wazuh = canal YouTube → web** — los vídeos del canal (~500 subs) llevan tráfico a `/wazuh` y `/curso-wazuh`.

---

## Era AI Search — políticas y fundamento (jul 2026)

Resumen de las políticas GEO del proyecto (versión corta en `CLAUDE.md`).

1. **Autoridad de marca > autoridad tópica.** En AI Search la señal de visibilidad ya no es la posición, es la **citación**. Google recomienda dejar de "influir en bots" e invertir en perspectiva propia + que fuentes externas mencionen la marca ligada a un tema. Para nosotros: ser *la* referencia de Wazuh en España/LATAM. → [Think with Google](https://business.google.com/us/think/search-and-video/ai-search-era-brand-authority-strategy/), [Search Engine Land](https://searchengineland.com/brand-authority-ai-search-476324).

2. **June 2026 Spam Update.** Ataca contenido de bajo valor a escala, frescura falsa, cloaking y contenido manipulativo (NO link spam). Por eso se **desactivaron** los crons de rotación A/B y bump de fechas. → [SEJ](https://www.searchenginejournal.com/google-begins-rolling-out-the-june-2026-spam-update/580424/).

3. **No `llms.txt` ni markdown paralelo.** Google lo desaconseja (doble trabajo, errores silenciosos) y el estudio de Ahrefs (137k dominios) concluye que es "largely decoration": 97% nunca reciben peticiones. Invertir en HTML + schema. → [SEJ](https://www.searchenginejournal.com/google-cautions-against-markdown-versions-of-websites-for-ai-seo/580235/), [Ahrefs](https://ahrefs.com/blog/llmstxt-study/).

4. **Medición AI Search.** El informe *Generative AI* de GSC (lanzado 3-jun-2026) es **UI-only**; aún no está en la Search Console API, así que el fetch semanal no puede traerlo (las impresiones de AI Overviews ya van mezcladas en el total "web"). Revisar el informe manualmente en la UI de GSC. Extender `scripts/seo-automation/7-fetch-and-save.js` cuando la API exponga el tipo `aiMode`/`aiOverview`. → [Google Search Central](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports).

5. **Monitor de prompts Wazuh.** Set fijo de prompts (ES+EN) para comprobar periódicamente si nos citan en ChatGPT/Perplexity/Google AI Mode. Basado en la [AI Search Prompt Library de Aleyda Solis](https://www.aleydasolis.com/en/ai-search/ai-search-prompt-library/). → `scripts/geo-monitor/`.

6. **SEO testing formal: aún no.** La metodología de tests por grupos de páginas exige 50-100+ páginas similares y 1.000+ visitas/día; el sitio no tiene ese volumen todavía. La rotación A/B manual es heurística, no test estadístico. → [Women in Tech SEO](https://www.womenintechseo.com/knowledge/seo-testing-for-traffic-growth/).

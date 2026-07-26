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

### Dos áreas de negocio con estrategias SEO distintas

**1. Servicios de IA** (chatbot, automatización, gestor documental, etc.)
- Keywords: "chatbot para empresas España", "automatización procesos pymes"
- Páginas: `/servicios/chatbot`, `/servicios/automatizacion`, etc.
- Sin estrategia geo activa aún

**2. Ciberseguridad / Soporte Técnico** ← **FOCO PRINCIPAL SEO AHORA**
- Keywords: "soporte técnico empresas [ciudad]", "Wazuh implementación", "ENS ciberseguridad"
- Estrategia geo activa: páginas `/soporte-tecnico/[ciudad]`
- Blog de concienciación ya creado (5 artículos publicados)
- Ver [geo-posicionamiento.md](geo-posicionamiento.md)

---

## Estado actual (abril 2026)

### Páginas geo creadas
- `/soporte-tecnico/benicarlo` — primera página geo de prueba (creada)
- Pendientes: Madrid, Barcelona, Valencia, Sevilla, Bilbao...

### Blog artículos publicados
- `/blog/ciberseguridad-basica-empleados-guia-completa`
- `/blog/detectar-phishing-outlook-microsoft-guia-empleados`
- `/blog/detectar-phishing-gmail-guia-empleados`
- `/blog/tu-contrasena-mayuscula-numeros-hackeable`
- `/blog/contrasenas-seguras-empleados-guia-completa`
- `/blog/pc-empresa-lento-causas-y-soluciones`
- `/blog/backup-automatico-pymes-guia-completa`
- `/blog/configurar-correo-corporativo-outlook-movil`

### Automatizaciones activas (GitHub Actions)
- **Cada push a main:** ping a Google/Bing/Yandex con IndexNow (script 5)
- **Cada lunes:** informe GA4/GSC por email (solo lectura, no muta contenido)
- **Manual/programado:** indexación directa via Google Indexing API (script 2)

### Crons DESACTIVADOS (jul 2026) — riesgo spam update
Se dejaron solo en `workflow_dispatch` (manual). Reactivar únicamente con criterio editorial humano:
- ~~**Cada lunes:** bump de `modifiedDate` (script 1 / `seo-update-dates.yml`)~~ → *frescura falsa*, señal penalizable.
- ~~**Días 1 y 15:** rotación A/B de títulos/meta (script 3 / `seo-ab-rotation.yml`)~~ → *scaled content abuse*.

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

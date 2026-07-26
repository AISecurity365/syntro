CLAUDE.md — AI Security (aisecurity.es)

## ⚙️ Principios de trabajo

**Pensar antes de codificar.** Declarar suposiciones en voz alta. Si la petición es ambigua, preguntar. Si existe un enfoque más simple, decirlo. Parar cuando algo no está claro — nombrar qué es lo que no está claro, no elegir una interpretación arbitraria y ejecutar.

**Simplicidad primero.** Escribir el mínimo código que resuelva el problema. Sin abstracciones especulativas. Sin flexibilidad que nadie ha pedido. El test: ¿diría un senior que esto está sobrediseñado?

**Cambios quirúrgicos.** Tocar solo lo que la tarea requiere. No mejorar código adyacente. No refactorizar lo que no está roto. Cada línea cambiada debe trazarse directamente a la petición.

**Ejecución orientada al objetivo.** Convertir instrucciones vagas en objetivos verificables antes de escribir una línea. "Arregla el diseño" → identificar qué elemento se mueve/rompe y por qué, luego aplicar el mínimo cambio.

---

## 📂 Documentación de referencia

Este archivo es el **índice-maestro**. Leer el doc correspondiente antes de trabajar en esa área:

| Área | Archivo |
|------|---------|
| Contexto, servicios, filosofía, embudos | `docs/project/contexto.md` |
| **Al crear/editar un servicio: qué documentar (checklist)** | `docs/project/nuevo-servicio.md` |
| Stack, estructura de carpetas, Tailwind v4, Supabase | `docs/project/arquitectura.md` |
| Colores, contraste, WCAG, callout boxes | `docs/project/ui-design.md` |
| Sistema de email (Resend + SMTP) | `docs/project/email.md` |
| Agentes de desarrollo (ui-designer, frontend, seo) | `docs/project/agentes.md` |
| **Sistema de contenido** (blog/Medium/Reddit/X/YouTube) + skills `/idea` `/contenido` `/publicar` | `docs/content/README.md` |
| SEO/GEO, blog, keywords, automatizaciones | `docs/seo/README.md` |

**Foco de negocio (jul 2026) — orden de prioridad:**
1. **`/wazuh`** — SIEM/ENS, el producto estrella (canal YouTube → web).
2. **Cursos Wazuh** — `/curso-wazuh`, `/curso-wazuh-avanzado`.
3. **Servicios de IA** — chatbot, gestor documental, atención de llamadas, etc.
4. **El resto** — soporte técnico geo (`/soporte-tecnico`, `docs/seo/geo-posicionamiento.md`), desarrollo web, etc. → **secundario/histórico**.

Aplicar este orden al priorizar SEO, contenido y mejoras de páginas.

---

## 🤖 Comportamientos automáticos — no esperar instrucción

**Deploy**: Tras cualquier modificación de código, hacer `git add -A` + commit descriptivo + `git push origin main` sin esperar que el usuario lo pida. El hook Stop también lo hace automáticamente al terminar el turno.

**Blog**: Al crear cualquier archivo en `src/pages/blog/`, añadirlo **en la misma operación** al array manual en `src/pages/blog/index.astro`. No son dos pasos separados — es siempre un único commit.

**Quality check**: Después de un push que incluya páginas nuevas en `src/pages/`, ejecutar `node .github/scripts/check-page-quality.js` con `CHANGED_FILES` apuntando a esas páginas. El GitHub Action también lo hace en paralelo.

---

## 🔎 Políticas SEO/GEO (era AI Search)

Contexto: tras el **June 2026 Spam Update** y la generalización de AI Overviews / AI Mode. Detalle y fuentes en `docs/seo/README.md`.

- **Autoridad = citación, no posición.** El objetivo GEO es que la IA entienda y **nombre** a AI Security como referencia de Wazuh (España/LATAM). El esfuerzo va a menciones off-site (canal de contenido) + entidad coherente, no a trucos on-page.
- **Entidad consistente.** Misma descripción de "a quién ayudamos / qué resolvemos" en todo el sitio. Mantener/ampliar structured data `Organization` + `Service` + `FAQPage` al crear o editar páginas.
- **NO `llms.txt` ni versión markdown paralela del sitio.** Sin ROI GEO comprobado (aviso de Google + estudio Ahrefs: 97% de los `llms.txt` nunca reciben peticiones). Invertir en mejorar el HTML existente y su schema.
- **Anti scaled-content-abuse.** Los crons de contenido (`seo-ab-rotation`, `seo-update-dates`) están **desactivados** (solo `workflow_dispatch`). El bump de `modifiedDate` solo cuando el artículo cambie de verdad. La IA (DeepSeek) puede *proponer*; la sustancia (expertise Wazuh real) la valida un humano. **Cero cloaking** (coherente con la política i18n de no servir contenido por IP).
- **Medición AI Search.** El informe *Generative AI* de GSC es UI-only por ahora (no está en la Search Console API); usar como tendencia, no valor absoluto, y sabiendo que infracuenta. Monitorizar además un set fijo de prompts Wazuh (ES+EN) en ChatGPT/Perplexity/Google AI Mode → `scripts/geo-monitor/`.

---

## 🛠️ Comandos

```bash
pnpm dev        # localhost:4321
pnpm build      # ./dist/
pnpm preview    # preview del build
astro check     # type checking
```

---

## 🔍 Verificación visual

Siempre usar **Playwright MCP** (`mcp__playwright__browser_*`) para confirmar cambios UI antes de dar la tarea por terminada. Nunca asumir cómo queda algo sin screenshot.

---

## 🚀 Deployment

Push a `main` → Vercel despliega automáticamente → aisecurity.es en minutos.

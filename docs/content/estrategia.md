# Estrategia de contenido — AI Security

> Cómo decidimos QUÉ decir, A QUIÉN y CON QUÉ VOZ. Leer junto a `README.md` y `geo-llm.md`.

---

## Los 4 pilares en detalle

### Pilar 1 — IA general para empresas (PRINCIPAL)

**Tesis:** la mayoría del contenido de IA es ruido. Nosotros enseñamos uso **real**.

Sub-temas:
- Caso de uso real X resuelto con IA → problema, solución, **números** (horas/€ ahorrados), límites.
- "Esto NO lo hace bien la IA todavía" (honestidad que genera confianza).
- Antes/después de un proceso concreto de PyME (atención cliente, documentos, reporting...).
- Comparativas prácticas (¿chatbot vs. persona? ¿cuándo merece la pena?).

Ángulos que SIEMPRE funcionan: número concreto en el título, caso sectorial específico,
desmontar una creencia popular ("no, la IA no va a sustituir a tu equipo de ventas, pero sí…").

### Pilar 2 — IA + ciberseguridad / Wazuh

IA aplicada a defensa: threat hunting con IA, triage de alertas, Wazuh + LLM (MCP).
Enlaza a `/wazuh`, `/curso-wazuh`. Reutiliza el conocimiento del `seo-specialist`.

### Pilar 3 — Técnico: MCPs, agentes, Claude

Para público dev/técnico. Construir cosas de verdad: MCP servers, agentes, Claude Code,
prompting que funciona. Mostrar código y resultados, no teoría. Aquí Reddit (r/ClaudeAI,
r/LocalLLaMA) y YouTube tienen mucho recorrido.

### Pilar 4 — Conceptual

El más diferenciador. Cómo **entender** la IA para usarla bien:
- La idea central del usuario: *la IA ya es muy potente; la diferencia está entre lo que nos
  está aportando hoy y lo que puede llegar a aportar*. Cerrar esa brecha es el contenido.
- Modelos mentales para no caer en el hype ni en el escepticismo perezoso.
- Qué cambia de verdad en el trabajo y la vida en los próximos años, con los pies en el suelo.

---

## Público objetivo por plataforma

| Plataforma | Quién está ahí | Qué quiere | Pilares idóneos |
|------------|----------------|-----------|-----------------|
| **Blog** (aisecurity.es) | Decisores PyME ES que buscan en Google | Resolver un problema concreto, evaluar proveedor | 1, 2 |
| **Medium** | Profesionales/tech, internacional (EN) | Long-form de calidad, ideas | 1, 3, 4 |
| **Reddit** | Comunidades técnicas y de negocio | Valor real, cero marketing | 3, 4 (1 con cuidado) |
| **Twitter/X** | Tech, builders, early adopters | Insights rápidos, hilos accionables | 3, 4 |
| **YouTube** | Mixto: PyME + técnicos | Ver el "cómo" en pantalla | 1, 2, 3 |

## Voz de marca AI Security

- **Experta pero clara**: explica sin tecnicismos gratuitos; cuando usa un término, lo aterriza.
- **Honesta**: dice lo que la IA NO puede hacer. Es el sello de la casa.
- **Concreta**: números, ejemplos, pasos. Nada de adjetivos vacíos.
- **Sin hype**: prohibido "revolucionario", "disruptivo", "cambia las reglas del juego".
- **Cercana, no coleguita**: trato profesional, sin forzar jerga de redes.

Checklist de voz (todo "sí"):
- [ ] ¿Tiene al menos un dato/número/ejemplo concreto?
- [ ] ¿Dice alguna limitación o matiz honesto?
- [ ] ¿Se entiende sin ser experto?
- [ ] ¿Sobreviviría al filtro "esto no es genérico"?


## CTAs por objetivo (suaves, no agresivos)

- **Leads**: "Si quieres ver cómo aplicar esto en tu empresa: aisecurity.es/presupuesto".
- **Autoridad**: "Escribo sobre IA aplicada sin humo — sígueme para más".
- **SEO/GEO**: enlaces internos contextuales + FAQ estructurada (ver `geo-llm.md`).

Regla: **1 CTA por pieza**, al final, no interrumpe el valor. En Reddit, casi nunca CTA
directo (ver `playbook-reddit.md`).

## El pack multiplataforma (qué produce `/contenido`)

Una idea genera, en **ES y EN**:
1. **Blog** — post `.astro` listo para commit (formato proyecto).
2. **Medium** — versión long-form con canonical al blog.
3. **Reddit** — post adaptado a 1-2 subreddits concretos, sin tono comercial.
4. **Twitter/X** — hilo (8-15 tweets) con hook.
5. **YouTube** — pack guionizado completo (guion + metadatos).

Cada pieza la genera su agente especializado leyendo su `playbook-*.md`.
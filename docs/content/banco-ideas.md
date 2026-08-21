# Banco de ideas — contenido AI Security

> Aquí se dejan títulos e ideas a desarrollar. La skill `/idea` añade y refina entradas aquí;
> `/contenido` las pasa a producción; `/publicar` las marca como publicadas.

**Estados:** 💡 cruda · 🔧 refinando · ✅ lista para producir · 🚀 publicada

**Pilares:** P1 IA empresas · P2 IA+seguridad/Wazuh · P3 técnico (MCP/agentes/Claude) · P4 conceptual

---

## En curso / pendientes

| Estado | Idea / título de trabajo | Pilar | Plataformas objetivo | Notas / ángulo |
|--------|--------------------------|-------|----------------------|----------------|
| 🔧 | Wazuh vs Splunk: ¿cuál cumple mejor el ENS? | **SEO puro — fuera del sistema de pilares** | Blog en producción; Medium posible tras revisar el blog; Twitter sin decidir | Slug `/blog/wazuh-vs-splunk-ens`. Keyword research ya hecho (volumen bajo, intención alta — lead cualificado + señal GEO). Ángulo: ni Splunk ni Wazuh traen mapeo ENS de fábrica; ese trabajo de integración es el diferenciador de AI Security. Splunk primero (QRadar quedaría para 2ª pieza, ángulo sector público). Incluye sección secundaria de coste real en euros (precios propios + Splunk, este último a verificar con research). Borrador en `blog-writer` — el usuario lo revisa él mismo antes de decidir si lo publica y si se reutiliza en Medium/X. |
| 🔧 | Serie "medidas ENS explicadas": op.mon.1, op.exp.8, op.exp.3 (3 posts) | **SEO puro — fuera del sistema de pilares** | Blog únicamente | Reclamo suave de contenido de valor para gente implementando el ENS en fase real, no venta agresiva. Cada post: título = código+nombre exacto de la medida, qué exige (con niveles básico/medio/alto y refuerzos R1-R5), qué evidencia aporta Wazuh, alternativas honestas a Wazuh (Suricata/Snort/Defender, Graylog/ELK/Splunk, OpenSCAP/Ansible/Qualys según medida), CTA suave a `/consultoria-ens`. Códigos verificados de forma independiente en 3 fuentes (ver `reference_ens_codigos_verificados` en memoria). De paso se corrigió un error real en `consultoria-ens.astro` (op.acc.5/op.exp.8 cruzados). Slugs: `op-mon-1-deteccion-intrusion-ens`, `op-exp-8-registro-actividad-ens`, `op-exp-3-gestion-configuracion-segura-ens`. |
| 💡 | _(ejemplo)_ Las 5 automatizaciones de IA que de verdad ahorran horas en una PyME | P1 | Blog, Medium, X, YT | Con números reales; desmontar el hype |

<!-- Añadir filas arriba. Mantener el ejemplo como plantilla o borrarlo cuando haya ideas reales. -->

## Publicadas (archivo)

| Fecha | Título | Pilar | Dónde se publicó | Enlaces |
|-------|--------|-------|------------------|---------|
| — | — | — | — | — |

---

## Cómo se usa este archivo

1. **`/idea <tema>`** — abre o retoma una entrada, la refinamos juntos, y al cerrar queda en
   estado 🔧 o ✅ con el ángulo afinado.
2. **`/contenido <idea>`** — produce el pack; la entrada pasa a "en producción".
3. **`/publicar <idea>`** — al publicar, se mueve a la tabla de "Publicadas" con enlaces.

## Notas de priorización

- Priorizar P1 (IA empresas) por volumen de leads, intercalando P3/P4 para autoridad.
- Cada idea debería pasar el filtro anti-hype (`README.md`): ¿aporta algo que el contenido
  genérico de internet no da?
- Idealmente cada idea reutilizable en ≥3 plataformas (eficiencia del pack).

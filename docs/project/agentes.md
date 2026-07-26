# Agentes Especializados

## Cuándo usar cada agente

| Tarea | Agente (`subagent_type`) |
|-------|--------------------------|
| Diseño visual, colores, contraste, layout | `ui-designer` |
| Componentes frontend, accesibilidad, rendimiento | `frontend-developer` |
| SEO, GEO, keywords, Schema.org, meta tags | `seo-specialist` |
| Tareas generales no especializadas | `claude` (por defecto) |
| Contenido (blog, Medium, Reddit, X, YouTube) | Ver `docs/content/README.md` (agentes `blog-writer`, `medium-writer`, `content-strategist`, etc.) |

**Regla**: usar agente especializado cuando el dominio importa. Para cambios simples (typo, un atributo) usar las herramientas directamente sin agente.

---

## ui-designer

Para: mejoras visuales, sistemas de color, jerarquía visual, animaciones, responsive.

```
Agent({ subagent_type: "ui-designer", prompt: "..." })
```

---

## frontend-developer

Para: componentes React/Astro, optimización de bundle, accesibilidad WCAG, arquitectura frontend.

```
Agent({ subagent_type: "frontend-developer", prompt: "..." })
```

---

## seo-specialist

Para: meta tags, structured data, Core Web Vitals, SEO local, GEO (IA search optimization), auditorías.

```
Agent({ subagent_type: "seo-specialist", prompt: "..." })
```

Ver también: `docs/seo/README.md` para la estrategia SEO/GEO completa del proyecto.

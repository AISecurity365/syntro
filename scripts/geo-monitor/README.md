# GEO Monitor — ¿nos cita la IA para Wazuh?

En la era AI Search la señal de visibilidad es la **citación**, no la posición
(ver `docs/seo/README.md` → "Era AI Search"). Este monitor mide si aparecemos
cuando alguien pregunta a una IA por Wazuh gestionado / partner / SOC.

Basado en la [AI Search Prompt Library de Aleyda Solis](https://www.aleydasolis.com/en/ai-search/ai-search-prompt-library/):
prompts **no-marcados** (descubrimiento), **marcados** (evaluación) y **comparativos**, en ES y EN.

## Archivos
- `prompts.json` — el set fijo de prompts. Editar aquí para añadir/quitar consultas.
- `check.mjs` — lanza los prompts contra los LLMs con API key configurada y guarda el histórico.
- `history.json` — histórico de ejecuciones (para ver la tendencia).
- `last-report.md` — última tanda en formato legible.

## Uso automatizable
```bash
# Activa los proveedores cuya key esté en el entorno:
#   DEEPSEEK_API_KEY (ya existe) · OPENAI_API_KEY · PERPLEXITY_API_KEY
node scripts/geo-monitor/check.mjs
```

> ⚠️ Un LLM **sin búsqueda web** (DeepSeek) responde de memoria, no de lo que
> citaría navegando. Sirve como baseline barato y para ver si el modelo ya nos
> "conoce". Para la señal real de AI Search, usa Perplexity (`sonar`, con búsqueda)
> o el chequeo manual de abajo.

## Chequeo manual (el más fiable) — mensual
Pega cada prompt no-marcado de `prompts.json` en **ChatGPT (con búsqueda)**,
**Perplexity** y **Google AI Mode** y anota:
1. ¿Aparece "AI Security" / aisecurity.es? (sí/no)
2. ¿Nos **recomienda** o solo nos menciona de pasada?
3. ¿Qué **competidores** cita por delante? (comparar con `competitorsWatch`)
4. ¿Qué **fuentes** enlaza? → ahí es donde hay que ganar menciones off-site.

El objetivo de las acciones de brand authority (canal de contenido) es mover
"ausente" → "mencionado" → "recomendado" en los prompts no-marcados.
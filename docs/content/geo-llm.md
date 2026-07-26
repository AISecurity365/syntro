# GEO — Optimización para respuestas de IA (ChatGPT, Perplexity, Google AI Overviews)

> GEO = Generative Engine Optimization. Que la IA **cite** nuestro contenido cuando alguien
> pregunta sobre IA aplicada. Complementa al SEO clásico (ver `seo-specialist` + `docs/seo/`).

---

## Por qué importa

Cada vez más gente pregunta a ChatGPT/claude/grok/Gemini en vez de a Google. Esos motores
**resumen y citan** fuentes. Si nuestro contenido está estructurado para ser citado,
aparecemos en la respuesta — y eso trae autoridad y tráfico cualificado.

## Las 7 reglas GEO (aplicar a TODA pieza de texto)

1. **Responde la pregunta en la primera frase.** El primer párrafo debe contener una0

   respuesta directa y autónoma (los LLM extraen ese fragmento). Patrón ya usado en el blog
   del proyecto: el `<p>` que sigue al `<h1>` resuelve la duda en 2-3 frases.

2. **Estructura en preguntas (H2 interrogativos).** "¿Cómo implementar un chatbot con IA?"
   en vez de "Implementación". Coincide con cómo la gente pregunta a los LLM. El blog ya lo
   hace — mantenerlo.

3. **Datos citables y concretos.** Números, fechas, porcentajes, nombres propios. Los LLM
   prefieren citar afirmaciones verificables: "reduce ~15 h/mes", "en 2023 Medium cerró su API".

4. **Definiciones limpias.** Incluir una frase tipo "X es …" para cada concepto clave. Los
   motores las extraen como definición canónica.

5. **Entidades claras.** Nombrar explícitamente herramientas, empresas, estándares (Claude,
   MCP, Wazuh, ENS, NIS2). Ayuda al grafo de conocimiento a asociarnos con el tema.

6. **FAQ estructurada al final** con `FAQPage` JSON-LD (ver `playbook-blog.md`). Cada Q/A es
   un fragmento citable independiente.

7. **Frescura y autoría.** `modifiedDate` actualizada (ya automatizado los lunes), autor
   visible, fuentes enlazadas. Señales de confianza para el motor.

## Estructura de artículo GEO-friendly (plantilla)

```
H1: [Pregunta o keyword principal]
P:  [Respuesta directa autónoma en 2-3 frases — esto es lo que se cita]
H2: ¿Qué es / por qué importa [tema]?
H2: ¿Cómo se hace [tema]? (pasos numerados)
H2: ¿Qué resultados reales da? (números, caso)
H2: ¿Qué limitaciones tiene? (honestidad → confianza → citabilidad)
H2: Preguntas frecuentes (FAQ + JSON-LD)
CTA único
```

## GEO fuera del blog

- **Medium/Reddit**: el contenido bien estructurado también se indexa y se cita; mantener
  el patrón pregunta→respuesta directa.
- **YouTube**: la **transcripción** y la descripción se indexan. Meter en la descripción un
  resumen en formato Q&A y timestamps con preguntas (ver `playbook-youtube.md`).
- **Reddit** tiene altísima presencia en respuestas de IA (Google paga por sus datos):
  respuestas útiles y bien escritas en hilos relevantes pueden acabar citadas.

## Checklist GEO por pieza
- [ ] Primera frase responde la pregunta de forma autónoma.
- [ ] Al menos un dato/número/fecha citable.
- [ ] Al menos una definición "X es …".
- [ ] H2 en forma de pregunta.
- [ ] FAQ (en blog/Medium) o Q&A en descripción (YouTube).
- [ ] Entidades nombradas explícitamente.
- [ ] Una limitación honesta declarada.

## Medición

GSC ya está integrado (ver `docs/seo/automatizaciones.md`). Para GEO puro, observar:
referrals de `chatgpt.com`, `perplexity.ai`, `gemini.google.com` en GA4, y búsquedas de
marca crecientes. Revisar mensualmente.
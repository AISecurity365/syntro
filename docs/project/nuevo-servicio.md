# Checklist — Crear/editar un servicio o página

> Objetivo: que el sitio y el **contexto** (estos docs + el bot + la web) queden siempre
> coherentes. Seguir esta lista **en la misma tarea** en que se crea el servicio, no después.
> Es la fuente de por qué `docs/project/contexto.md` no debe quedarse desactualizado.

## Al crear un SERVICIO nuevo (`src/pages/servicios/…`)

1. **Página** en `src/pages/servicios/<slug>.astro`
   - Patrón oscuro (nunca fondo claro) — ver `docs/project/ui-design.md`.
   - `title` 40-70 car., meta desc 120-165 car., H2/H3 en formato pregunta (`¿…?`).
   - Structured data **`Service` + `FAQPage`** (+ `Organization` coherente). Ver políticas GEO en `CLAUDE.md`.
   - CTA a `/presupuesto?plan=<slug>` (o por nivel: `<slug>-basico|medio|avanzado`).

2. **Contexto** → añadir el servicio a la tabla de `docs/project/contexto.md`.

3. **Navegación** → añadirlo en `src/components/global/Navigation.astro` (y mega-menú / `NavigationEn.astro` si aplica). Si es curso, añadir a `/cursos`.

4. **Presupuesto** → añadir el/los `plan=` al mapa `planNames` de
   `src/components/meeting/ContactMigrationForm.astro` (para que se muestre el nombre legible).

5. **Bot de texto** → añadir el servicio al `SYSTEM_PROMPT` de `src/pages/api/chat.ts`
   (URL, qué hace, resultado medible). Es el "cerebro" de la IA de DeepSeek en la web.

6. **Calidad** → pasar `node .github/scripts/check-page-quality.js` con `CHANGED_FILES`
   apuntando a la página nueva. (El GitHub Action y el auto-fix SEO también corren solos.)

7. **i18n** → replicar en `/en`, `/fr`, `/nl` y registrar en `TRANSLATED_PATHS` + hreflang.
   (Se puede diferir, pero anotarlo. Cero cloaking; el curso no se traduce.)

8. **Deploy** → `git add -A` + commit descriptivo + `git push origin main` (comportamiento
   automático; el hook Stop también lo hace).

## Al crear una PÁGINA que no es servicio (curso, landing, ciudad…)
- Cursos → alta en `/cursos` + dropdown del header. Blog → alta en el array de `src/pages/blog/index.astro` (mismo commit).
- Rutas dinámicas en SSR → resolver con `Astro.params` + `find`, **nunca** `getStaticPaths`+props (da 500). Ver memoria del proyecto.

## Regla de oro
Si tras la tarea **`contexto.md` ya no describe la web real**, la tarea no está terminada.
Documentar es parte del cambio, no un extra.

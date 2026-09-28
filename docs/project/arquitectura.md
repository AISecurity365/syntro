# Arquitectura Técnica

## Stack

| Tecnología | Versión | Notas |
|-----------|---------|-------|
| Astro | 5.x | SSR mode + Vercel adapter |
| Tailwind CSS | v4 (Alpha) | Sin config file — solo `src/styles/global.css` |
| pnpm | 10.x | Gestor de paquetes obligatorio |
| TypeScript | — | `tsconfig.json` habilitado |
| Resend | — | Email formulario reunión |
| Nodemailer | — | Email inscripción cursos vía SMTP |

## Estructura de Directorios

```
src/
├── assets/images/        — Imágenes estáticas
├── components/
│   ├── ai-services/      — ServiceCard, ServicesSection
│   ├── global/           — Navigation, Footer, Mascot
│   ├── landing/          — Hero, AIHeroFloating, Features
│   └── meeting/          — MeetingRequest, formularios
├── layouts/
│   ├── BaseLayout.astro   — Layout principal (GTM, GA4, tracking)
│   ├── BlogLayout.astro   — Layout artículos blog
│   └── WazuhLayout.astro  — Layout páginas Wazuh
├── pages/
│   ├── api/               — send-meeting-request.ts, inscripcion-curso-wazuh.ts
│   ├── blog/              — Artículos .astro
│   ├── servicios/         — Páginas de servicio con demos
│   └── *.astro            — Páginas raíz
└── styles/global.css      — Tailwind v4 + custom theme
```

## Tailwind CSS v4 — Diferencias Clave

- **Sin `tailwind.config.js`** — todo en `src/styles/global.css` dentro de `@theme {}`
- Colores custom: `accent-*` (azul marca) y `base-*` (grises)
- Si una clase Tailwind no funciona, verificar que el color esté definido en `@theme`
- Para forzar estilos problemáticos: usar `style=""` inline

## Deployment

- **Plataforma**: Vercel — deploy automático en push a `main`
- **Dominio**: aisecurity.es
- **Build**: `pnpm build` → `./dist/`
- **Variables de entorno en Vercel**: `RESEND_API_KEY`, `SMTP_HOST/PORT/USER/PASSWORD`, `DEEPSEEK_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`

## Supabase

Acceso directo via MCP (`mcp__supabase__*`) o REST con `SUPABASE_SERVICE_ROLE_KEY` del `.env`.

- **URL**: `https://sgvavsireozksiqjlewh.supabase.co`
- Tablas: `course_users`, `user_progress`, `comments` (ON DELETE CASCADE desde `auth.users`)

## Chat / IA

### Autodiagnóstico AI Act / RGPD (septiembre 2026)

El borrador `/blog/cumple-mi-empresa-ley-ia-test` usa `AIComplianceQuiz.astro` y reglas deterministas en `src/lib/ai-compliance.mjs`. Evalúa una herramienta, plan y finalidad cada vez; las respuestas permanecen en memoria del navegador y el resumen se descarga localmente. No enviar respuestas a analítica ni a APIs.

Nunca presentar una suscripción o casillas marcadas como acreditación de cumplimiento. Separar AI Act y RGPD, mantener las salidas de revisión especializada para usos sensibles y revisar las fuentes oficiales cuando cambien contratos o normativa. Pruebas: `node --test scripts/tests/ai-compliance.test.mjs`. La publicación se controla desde `src/lib/blog-drafts.mjs`.

- **API**: DeepSeek via `/api/chat` (endpoint propio)
- **Bot flotante**: `src/components/global/Mascot.astro` — contextual por página
- **Hero chat**: `src/components/landing/AIHeroFloating.astro`

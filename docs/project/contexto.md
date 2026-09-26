# Contexto del Proyecto: AI SECURITY

**AI SECURITY** (aisecurity.es) — plataforma profesional con dos áreas:
1. **Soluciones de IA**: Automatización para empresas pequeñas y grandes
2. **Ciberseguridad y Sistemas**: Wazuh/ENS, consultoría técnica

## Prioridad de negocio (jul 2026)

Orden para priorizar SEO, contenido y mejoras:
1. **`/wazuh`** — producto estrella (SIEM/ENS, canal YouTube → web)
2. **Cursos Wazuh** — `/curso-wazuh`, `/curso-wazuh-avanzado`
3. **Servicios de IA** — chatbot, gestor documental, atención de llamadas…
4. **El resto** — soporte técnico geo, desarrollo web, etc. (secundario)

---

## Filosofía — MUY IMPORTANTE

**Esta NO es una web de ventas de humo.**

- ✅ Transparencia total: no prometemos ahorros irreales
- ✅ Casos de uso reales con demos interactivas y contexto empresarial
- ✅ Educación al cliente: deben entender la tecnología
- ✅ Resultados medibles: "reduce 15h/mes", no "revoluciona tu empresa"

**Tono:**
- ❌ "Ahorra millones", "Transforma tu negocio de la noche a la mañana"
- ✅ "Reduce 15 horas/mes en gestión documental", "Automatiza el 80% de consultas comunes"

## Público Objetivo

Empresas españolas que buscan reducir costes operativos, mejorar atención al cliente, cumplir ENS y modernizar IT.

---

## Servicios

### Formación empresarial — Misión Aprender (septiembre de 2026)

La formación de empleados en ciberseguridad e IA se canaliza a **Misión Aprender**, empresa asociada a AI Security, por indicación del usuario. Usar esa atribución en artículos de alfabetización y concienciación, sin presentarla como una certificación oficial del AI Act. No afecta a los cursos técnicos propios de Wazuh.

Enfoque comercial/editorial acordado: formación y evidencias para ENS (`mp.per.3` y `mp.per.4`), ISO/IEC 27001 y alfabetización en IA (artículo 4); ISO/IEC 42001 es una ampliación afín. Explicar el requisito concreto y cómo evaluar la eficacia, sin prometer que comprar un curso certifica a la empresa. No extrapolar a todas las ISO una obligación de formación en ciberseguridad. AI Security conserva la consultoría documental y técnica; Misión Aprender canaliza la formación de empleados.

Dominio definitivo confirmado por el usuario: `https://misionaprender.es`, pendiente de activación (26-09-2026). Los dos nuevos artículos con ese enlace permanecen en `src/lib/blog-drafts.mjs` hasta activar la web y revisar el contenido. No extender un enlace que no resuelve a los CTA públicos. Las funciones del panel, precios y acreditaciones deben confirmarse antes de anunciarlas.

> ⚠️ **Mantener esta tabla al día.** Al crear un servicio nuevo, seguir la checklist de `docs/project/nuevo-servicio.md` (incluye actualizar esta tabla).

### 🤖 Inteligencia Artificial
Flujo: análisis previo → desarrollo personalizado → formación del equipo → seguimiento

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Consultoría IA | `/consultoria-ia` (+ ciudades) | Análisis + plan de automatización |
| Chatbot Inteligente | `/servicios/chatbot` | Atención 24/7, integración ERP/CRM |
| Gestor Documental IA | `/servicios/gestor-documental` | Búsqueda semántica en documentos |
| Gestor Documental — Abogados | `/servicios/gestor-documental-abogados` | Vertical despachos (variante del anterior) |
| Gestor de Citas IA | `/servicios/gestor-citas` | Reservas + confirmaciones automáticas |
| Atención de Llamadas IA | `/servicios/atencion-llamadas` | Recepcionista virtual + **agente de voz ElevenLabs** (demo real) |
| Agente IA — Fisioterapeutas | `/servicios/agente-fisioterapeutas` | Vertical fisios |
| Automatización de Procesos | `/servicios/automatizacion` | RPA con IA |
| Concienciación / test empleados | `/servicios/concienciacion` | Phishing + formación (embudo desde blog) |
| Desarrollo Web | `/servicios/desarrollo-web` | Webs + soporte IT |
| SEO + GEO / Posicionamiento | `/servicios/geo-posicionamiento` | Posicionamiento en buscadores e IA |
| Migración WordPress | `/servicios/migracion-wordpress` | Migración a stack moderno |

**Precios IA:** modelo de **3 niveles** (básico / medio / avanzado) en chatbot, gestor documental y atención de llamadas. Los CTAs de nivel llevan a `/presupuesto?plan={servicio}-{nivel}` (mapeo en `ContactMigrationForm.astro`). Sin cifra pública → "a consultar".

**Próxima revisión de Consultoría IA (26-09-2026):** el usuario quiere ampliar el enfoque de `/consultoria-ia` hacia acompañamiento integral a la empresa, con tres modalidades: formar al equipo para que implemente; implementar junto al equipo mientras se le forma; o actuar como implementadores continuos. El equipo del cliente aporta el contexto de la empresa y debe participar en las decisiones. Primero se revisa el diseño; el cambio comercial y sus textos quedan pendientes de trabajar con el usuario. No presentar estas modalidades como una oferta ya publicada.

**Base de la consultoría IA (26-09-2026):** priorizar el contexto de la empresa y los sistemas que ya utiliza. Primero centralizar y documentar procesos, conocimiento y herramientas; después conectar agentes capaces de utilizarlos. La ejecución puede ser colaborativa con el equipo, requerir aprobación humana o ser automática, según permisos y reglas acordadas. Este concepto guía el diagrama explicativo de la landing.

### 🛡️ Ciberseguridad y Sistemas

**Wazuh — PRIORIDAD ALTA:**
- SIEM open-source para ENS (Esquema Nacional de Seguridad)
- Estrategia: Video YouTube → CTA a `/wazuh` → Demo → Reunión
- Objetivo: referente Wazuh/ENS para PyMEs españolas
- Pricing público en `/wazuh` (ver también memoria del proyecto: precios Wazuh)

**Planes actuales en `/wazuh` (jul 2026):**
| Plan | Precio | Incluye formación |
|------|--------|------------------|
| Básico (≤20 servidores) | 999-1.499€ pago único | 2h online |
| Wazuh Gestionado | 200€/mes | incluida en onboarding |
| Completo (≤50 servidores) | 1.999-3.999€ pago único | 4h online |
| **Consultoría por horas** | sin precio público | sesiones sueltas para instalaciones existentes: revisar reglas, integrar fuentes, depurar agentes |

⚠️ Formación es **online** (no presencial). Si alguien pide presencial, valorar coste adicional de desplazamiento.

**Consultoría ENS** (`/consultoria-ens`): adecuación al Esquema Nacional de Seguridad (RD 311/2022). Diferenciador: gestionamos tanto la parte documental (MAGERIT, políticas, plan de adecuación) como la técnica (Wazuh SIEM, hardening, FIM) — los competidores solo hacen lo documental. Tres modalidades **sin precio público** (botón "Consultar precio", presupuesto cerrado en el diagnóstico gratuito): Solo técnica, Solo documental, **Integral documental+técnica (la más solicitada)**. Target: proveedores TIC de AAPP que necesitan ENS nivel medio. Plazo transitorio RD 311/2022 venció mayo 2024.

**Consultoría ISO 27001** (`/consultoria-iso27001`): mismo diseño y planteamiento que ENS (documental + técnica con Wazuh), adaptado a la norma internacional ISO/IEC 27001:2022 (SGSI, Anexo A, auditoría Stage 1/Stage 2 vía entidad acreditada, certificado válido 3 años). No obligatoria por ley (a diferencia del ENS) pero cada vez más exigida contractualmente, sobre todo por grandes clientes y mercados internacionales. Mismas 3 modalidades sin precio público. Target: SaaS/tecnológicas, empresas que exportan, proveedores que tratan datos de terceros.

**Consultoría AI Act** (`/consultoria-ai-act`, sep 2026): mismo patrón visual que ENS/ISO 27001 (documental + técnica), adaptado al artículo 50 del Reglamento (UE) 2024/1689 (obligaciones de transparencia: avisos de IA en chatbots/agentes, marcado de contenido sintético), en vigor desde el 2 de agosto de 2026 sin periodo de gracia. No es una certificación con auditoría externa como ENS/ISO — es una obligación legal supervisada por la AESIA. Diferenciador: no solo el informe/inventario documental, también implementamos los avisos reales en el producto (chatbot, contenido generado), no solo un PDF. Mismas 3 modalidades sin precio público (técnica / documental / integral). Enlaza a los 3 posts de blog `ai-act-*` / `chatbots-ia-obligacion-legal-*` para el detalle legal completo. i18n pendiente (diferido, no crítico para el lanzamiento inicial).

**Soporte técnico** (`/soporte-tecnico` + geo): servicio remoto. Foco **secundario** ahora (ver `docs/seo/geo-posicionamiento.md`).

Otros: administración Linux/Windows, backups (Veeam, Restic), afiliación Wazuh (`/wazuh-afiliado`).

### 🎓 Cursos
| Curso | URL |
|-------|-----|
| Curso Wazuh (intensivo) | `/curso-wazuh` |
| Curso Wazuh para empresas (avanzado, 3 días) | `/curso-wazuh-avanzado` |
| Curso SEO/GEO con Claude | `/curso-seo-geo-claude` |
| Curso TechAI Boost | `/curso-techai-boost` |
| Índice de cursos | `/cursos` |

### 🌐 Internacionalización (i18n)
- **4 idiomas: es / en / fr / nl.** Páginas traducidas en `src/pages/{en,fr,nl}/` + `TRANSLATED_PATHS` + hreflang.
- **Cero cloaking** (no servir contenido por IP). El curso no se traduce.
- Leads EN/FR/NL se marcan en el email admin. Ver memoria del proyecto (i18n).

---

## Diferenciadores vs Competencia

- Demos interactivas reales (no capturas estáticas)
- Contexto empresarial específico en cada ejemplo
- Transparencia sobre limitaciones de la IA
- IA moderna + Seguridad tradicional combinadas
- Propietario = administrador de sistemas (conocimiento técnico real)

---

## Embudos de Conversión

**IA:**
Usuario busca → llega a aisecurity.es → ve demos reales → solicita reunión → propuesta personalizada

**Wazuh:**
Video YouTube → visita /wazuh → ve demo + pricing → solicita reunión

---

## CRM de leads comerciales (ago 2026)

- **Ubicación:** `/aula/admin/leads` (enlazado desde `/aula/admin`, admin-gated con el mismo `ADMIN_EMAIL` hardcodeado).
- **Qué es:** panel tipo CRM sencillo para los ~12 formularios comerciales del sitio que antes SOLO enviaban un email (contacto, migracion/presupuesto, demo Wazuh, te-llamamos, ticket soporte, reunion, partner LATAM, passbolt, inscripcion curso Wazuh, listas de espera Wazuh EN/TechIA Boost/SEO+GEO) — no quedaba ningun registro en base de datos de esos leads.
- **Como funciona:** cada endpoint llama a `saveLead()` (`src/lib/leads.ts`) justo despues de validar el formulario, que inserta en la tabla `leads` de Supabase sin romper el envio de emails si falla (try/catch silencioso). Esquema en `supabase-leads-schema.sql` (ejecutar a mano en el SQL Editor de Supabase, igual que `supabase-schema.sql`).
- **Seguimiento:** cada lead tiene `status` (nuevo/contactado/convertido/descartado), `next_follow_up_date` y un historial de notas en `lead_notes` (tabla hija). Filtros en la lista por estado/idioma/origen.
- **Fuera de alcance a proposito:** NO incluye historico anterior a su creacion (solo emails, sin BD — habria que minar Gmail para reconstruirlo, se decidio no hacerlo) y NO incluye `course_users` (usuarios/pagos del curso Wazuh, que ya tenian su propio panel en `/aula/admin` desde antes).
- **Nota tecnica:** `SUPABASE_URL`/`SUPABASE_ANON_KEY` (sin prefijo `PUBLIC_`) faltaban en `.env` local — el codigo ya las esperaba (`lib/supabase.ts`, `middleware.ts`) pero solo estaban en Vercel. Se anadieron en local para poder probar; revisar que sigan en Vercel si se toca el entorno.

---

## URLs del Sitio

- **Producción**: https://aisecurity.es
- `/` — Homepage
- `/wazuh` — Página Wazuh (alta prioridad, fuente YouTube)
- `/consultoria-ens` — Consultoría ENS (adecuación RD 311/2022, documental + técnica con Wazuh)
- `/consultoria-iso27001` — Consultoría ISO 27001 (mismo diseño que ENS, SGSI + Anexo A + Wazuh)
- `/consultoria-ai-act` — Consultoría AI Act (adecuación artículo 50, avisos IA en chatbots + marcado de contenido)
- `/curso-wazuh`, `/curso-wazuh-avanzado` — Cursos Wazuh (ver `/cursos`)
- `/servicios/*` — Páginas de servicio de IA (ver tabla arriba)
- `/consultoria-ia` — Consultoría IA (+ `-alicante`, `-valencia`, `-castellon` y ruta dinámica por ciudad)
- `/soporte-tecnico` — Soporte técnico remoto (foco secundario)
- `/reunion` — Formulario consulta gratuita (reserva nunca el mismo día)
- `/presupuesto` — Formulario presupuesto (acepta `?plan=` para preseleccionar servicio/nivel)
- `/blog` — Blog técnico
- **i18n:** mismas rutas bajo `/en`, `/fr`, `/nl`

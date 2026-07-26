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

## URLs del Sitio

- **Producción**: https://aisecurity.es
- `/` — Homepage
- `/wazuh` — Página Wazuh (alta prioridad, fuente YouTube)
- `/curso-wazuh`, `/curso-wazuh-avanzado` — Cursos Wazuh (ver `/cursos`)
- `/servicios/*` — Páginas de servicio de IA (ver tabla arriba)
- `/consultoria-ia` — Consultoría IA (+ `-alicante`, `-valencia`, `-castellon` y ruta dinámica por ciudad)
- `/soporte-tecnico` — Soporte técnico remoto (foco secundario)
- `/reunion` — Formulario consulta gratuita (reserva nunca el mismo día)
- `/presupuesto` — Formulario presupuesto (acepta `?plan=` para preseleccionar servicio/nivel)
- `/blog` — Blog técnico
- **i18n:** mismas rutas bajo `/en`, `/fr`, `/nl`

# Sistema de Email

## 1. Formulario de Reunión — Resend

**Ruta**: `/reunion`
**Componente**: `src/components/meeting/MeetingRequest.astro`
**API**: `src/pages/api/send-meeting-request.ts`
**Destino**: `julen.sistemas@gmail.com`

```env
RESEND_API_KEY=re_...
```

Campos: nombre + (email o teléfono) obligatorios. Empresa, servicio, tamaño, mensaje, presupuesto opcionales.

---

## 2. Inscripción Cursos — SMTP (EmailRelay)

**Ruta**: `/curso-wazuh`
**API**: `src/pages/api/inscripcion-curso-wazuh.ts`
**From**: `info@aisecurity.es`

```env
SMTP_HOST=smtp1.s.ipzmarketing.com
SMTP_PORT=587
SMTP_USER=rbaknxqyoxkj
SMTP_PASSWORD=cpexfT8y5EjXw2ez
SMTP_FROM_EMAIL=info@aisecurity.es
SMTP_FROM_NAME=AI Security
```

Envía dos emails: confirmación al usuario (con instrucciones de pago) + notificación admin.

---

## Vercel — Variables de Entorno

Vercel Dashboard → Project → Settings → Environment Variables. Redeploy tras añadir vars.

---

## 3. Informes Automáticos — Resend

Los scripts de SEO/GA4 también usan Resend:
- `RESEND_API_KEY` en GitHub Secrets
- From: `info@aisecurity.es`
- To: `julen.sistemas@gmail.com` / `info@aisecurity.es`


## 4. Ideas de automatización — Consultoría IA

Formulario integrado en `/consultoria-ia`: `ConsultoriaIdeaForm.astro`. Solicita solo correo e idea (10–5000 caracteres), sin redirección. Usa `/api/send-contact` con `plan: consultoria-ia`; envía a `info@aisecurity.es` con reply-to del visitante y guarda el lead con el plan y origen del formulario. Comprueba el error de Resend antes de confirmar éxito. El cliente limita la espera a 15 segundos y conserva los campos si no puede confirmar el envío.


## Agenda de reuniones (28-sep-2026)

`src/lib/meeting-schedule.ts` define una oferta estable por fecha (YYYY-MM-DD), compartida por los calendarios ES/EN y la validación del servidor. Los fines de semana están cerrados, junto con algunos días laborables dispersos determinados de forma estable por fecha. La mayoría de días laborables tienen cuatro franjas: dos por la mañana (09/11 o 10/12) y dos por la tarde (15/17 o 16/18). Un día cerrado no admite reservas. Google Calendar filtra las franjas ocupadas al seleccionar el día; los días habilitados indican agenda abierta, no disponibilidad ya verificada. Los formularios envían la fecha local sin conversión UTC para evitar cambiar de día.


### Google Meet e invitaciones con Gmail personal

Soporte preparado, pendiente de autorizar la cuenta del propietario y configurar OAuth en Vercel. La cuenta de servicio mantiene el comportamiento anterior mientras `GOOGLE_OAUTH_REFRESH_TOKEN` esté vacío. No afirmar que Meet está activo hasta comprobar una reserva autorizada.

Para activarlo: habilitar Calendar API en Google Cloud, configurar una aplicación OAuth externa y crear un cliente web. Autorizar la cuenta Gmail organizadora con acceso offline al scope `https://www.googleapis.com/auth/calendar.events` y obtener un refresh token (se puede usar OAuth Playground con credenciales propias y su URI de retorno registrada). Configurar `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` y `GOOGLE_OAUTH_REFRESH_TOKEN` en Vercel y redesplegar. No compartir tokens por chat ni guardarlos en Git. Una app externa en modo Testing expira el refresh token a los siete días para este scope: completar la configuración de producción de OAuth antes de usar reservas reales.

Con OAuth, disponibilidad y reservas usan el calendario principal del Gmail autorizado. El evento incluye al cliente como invitado, solicita Google Meet y envía notificaciones nativas con `sendUpdates: all`. El organizador tiene la cita en su calendario y recibe también el correo de confirmación en su Gmail; se conserva la notificación a info@aisecurity.es. Las horas del evento se interpretan en Europe/Madrid incluso si Vercel corre en UTC. Meet puede tardar en generarse: se consulta el mismo evento hasta tres veces, sin duplicarlo; si sigue pendiente, la invitación de Google es la referencia para el enlace. Validar creación de Meet y recepción en ambas cuentas tras autorizar.

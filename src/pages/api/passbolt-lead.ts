import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email no válido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await saveLead({ source: 'passbolt', email });

    // Enviar notificación por email a info@aisecurity.es
    const resendApiKey = import.meta.env.RESEND_API_KEY;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: 'AI Security <info@aisecurity.es>',
        to: 'info@aisecurity.es',
        subject: '🔐 Nuevo lead Passbolt - Solicitud de implementación',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
              .email-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 15px 0; }
              .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">🔐 Nueva solicitud de Passbolt</h2>
              </div>
              <div class="content">
                <p>Un usuario ha solicitado ayuda para implementar <strong>Passbolt</strong> en su empresa desde el curso de contraseñas seguras.</p>

                <div class="email-box">
                  <strong>Email:</strong> ${email}
                </div>

                <p><strong>Origen:</strong> Curso "Contraseñas Seguras para Empleados"</p>
                <p><strong>Interés:</strong> Implementación de Passbolt (gestor de contraseñas)</p>

                <p style="margin-top: 20px;"><strong>Próximos pasos sugeridos:</strong></p>
                <ul>
                  <li>Contactar en menos de 24h</li>
                  <li>Preguntar tamaño del equipo y necesidades</li>
                  <li>Ofrecer demo o llamada consultiva</li>
                </ul>

                <div class="footer">
                  <p>Este lead fue generado automáticamente desde aisecurity.es</p>
                  <p>Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Nuevo lead Passbolt - Solicitud de implementación

Email: ${email}

Origen: Curso "Contraseñas Seguras para Empleados"
Interés: Implementación de Passbolt (gestor de contraseñas)

Próximos pasos:
- Contactar en menos de 24h
- Preguntar tamaño del equipo y necesidades
- Ofrecer demo o llamada consultiva

---
Generado desde aisecurity.es
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
        `
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Solicitud recibida correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error procesando lead Passbolt:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

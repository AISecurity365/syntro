import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email invalido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await saveLead({ source: 'inscripcion-curso-wazuh', email });

    // Email HTML elegante para el usuario
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f6f9;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header with gradient -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Inscripcion Confirmada
                      </h1>
                      <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">
                        Curso Practico de Wazuh
                      </p>
                    </td>
                  </tr>

                  <!-- Content Card -->
                  <tr>
                    <td style="padding: 0 20px 20px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #2d3748; font-size: 16px; line-height: 1.6;">
                              Gracias por inscribirte al curso de Wazuh. Has dado el primer paso para convertirte en un experto en monitorizacion de seguridad.
                            </p>

                            <!-- Details Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%); border-radius: 8px; margin: 24px 0; border-left: 4px solid #667eea;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h2 style="margin: 0 0 16px; color: #1a202c; font-size: 18px; font-weight: 600;">
                                    Detalles del Curso
                                  </h2>
                                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                      <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">
                                        <strong style="color: #2d3748;">Disponible desde:</strong> 23 Febrero 2026
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">
                                        <strong style="color: #2d3748;">Modalidad:</strong> Plataforma online con acceso permanente
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">
                                        <strong style="color: #2d3748;">Incluye:</strong> Videos, recursos, soporte directo del formador
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">
                                        <strong style="color: #2d3748;">Precio:</strong> 50 euros (acceso permanente)
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- Next Steps -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                <strong style="color: #78350f;">Proximo paso:</strong> Te enviaremos las instrucciones de pago por email en breve.
                              </p>
                            </div>

                            <p style="margin: 24px 0 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                              Si tienes alguna pregunta, no dudes en contactarnos.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background: rgba(255,255,255,0.05);">
                      <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px;">
                        <strong>AI Security</strong>
                      </p>
                      <p style="margin: 0; font-size: 13px;">
                        <a href="mailto:info@aisecurity.es" style="color: #ffffff; text-decoration: none;">info@aisecurity.es</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const userTextFallback = `Inscripcion Curso Wazuh

Gracias por inscribirte.

Detalles:
- Disponible desde: 23 Febrero 2026
- Modalidad: Plataforma online con acceso permanente
- Incluye: Videos, recursos, soporte directo del formador
- Precio: 50 euros (acceso permanente)

Te enviaremos los detalles de pago.

Contacto: info@aisecurity.es
`;

    // Enviar confirmación al usuario
    const userEmailResult = await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: email,
      subject: 'Inscripcion Curso Wazuh - Confirmacion',
      html: userEmailHtml,
      text: userTextFallback,
    });

    if (userEmailResult.error) {
      console.error('Error enviando email al usuario:', userEmailResult.error);
    }

    // Email HTML para admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 12px 12px 0 0;">
                      <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                        Nueva Inscripcion al Curso
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px; background-color: #f1f5f9; border-radius: 8px;">
                            <p style="margin: 0; color: #334155; font-size: 15px;">
                              <strong style="color: #1e293b;">Email:</strong> ${email}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                              <strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const adminTextFallback = `Nueva inscripcion al curso

Email: ${email}
Fecha: ${new Date().toLocaleString('es-ES')}
`;

    const adminEmailResult = await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      replyTo: email,
      subject: 'Nueva inscripcion curso Wazuh',
      html: adminEmailHtml,
      text: adminTextFallback,
    });

    if (adminEmailResult.error) {
      console.error('Error enviando email al admin:', adminEmailResult.error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Inscripcion confirmada'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar inscripcion' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

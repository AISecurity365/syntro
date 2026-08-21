import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    const nombre = data.get('nombre')?.toString();
    const email = data.get('email')?.toString();
    const telefono = data.get('telefono')?.toString();
    const empresa = data.get('empresa')?.toString();
    const tipo = data.get('tipo')?.toString();
    const descripcion = data.get('descripcion')?.toString();
    const anydesk = data.get('anydesk')?.toString();

    // Validación básica
    if (!nombre || !email || !tipo || !descripcion) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos obligatorios deben estar completos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mapeo de tipos de incidencia
    const tiposMap: Record<string, string> = {
      'pc-lento': '💻 PC lento o no arranca',
      'virus': '🦠 Virus o malware',
      'email': '📧 Problemas con email',
      'red': '🌐 Problemas de red/WiFi',
      'impresora': '🖨️ Impresora no funciona',
      'software': '🔧 Instalación de software',
      'backup': '💾 Copias de seguridad',
      'otro': '❓ Otro problema',
    };

    const tipoTexto = tiposMap[tipo] || tipo;

    // Guardar en el CRM de leads (no bloquea el envio de emails si falla)
    await saveLead({
      source: 'ticket-soporte',
      name: nombre,
      company: empresa,
      email,
      phone: telefono,
      message: descripcion,
      extra: { tipo: tipoTexto, anydesk },
    });

    // Email HTML para el usuario (confirmación)
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
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: rgba(255,255,255,0.1);">
                      <div style="font-size: 48px; margin-bottom: 16px;">🎫</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Ticket de Soporte Recibido</h1>
                      <p style="margin: 10px 0 0; color: #d1fae5; font-size: 16px;">Primera hora de soporte GRATIS</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 20px 20px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px;">
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #2d3748; font-size: 16px; line-height: 1.6;">
                              Hola <strong>${nombre}</strong>, hemos recibido tu ticket de soporte correctamente.
                            </p>
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f0fdf4; border-radius: 8px; margin: 24px 0; border-left: 4px solid #10b981;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h2 style="margin: 0 0 16px; color: #1a202c; font-size: 18px; font-weight: 600;">Resumen del ticket</h2>
                                  <p style="margin: 0 0 8px; color: #4a5568; font-size: 15px;"><strong style="color: #2d3748;">Tipo:</strong> ${tipoTexto}</p>
                                  <p style="margin: 0; color: #4a5568; font-size: 15px;"><strong style="color: #2d3748;">Descripcion:</strong><br><span style="font-style: italic;">"${descripcion.substring(0, 200)}${descripcion.length > 200 ? '...' : ''}"</span></p>
                                </td>
                              </tr>
                            </table>
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                              <p style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 600;">Proximos pasos:</p>
                              <ol style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                                <li>Si aun no lo has hecho, <a href="https://anydesk.com/es/downloads/windows" style="color: #0284c7; text-decoration: underline;">descarga AnyDesk</a></li>
                                <li>Te contactaremos en menos de 2 horas</li>
                                <li>Nos conectamos y resolvemos tu problema</li>
                              </ol>
                            </div>
                            <p style="margin: 24px 0 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                              Horario de atencion: <strong>08:00-14:00</strong> y <strong>16:00-19:00</strong> (Lunes a Viernes)
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background: rgba(255,255,255,0.05);">
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

    const userTextFallback = `Ticket de Soporte Recibido - AI Security

Hola ${nombre}, hemos recibido tu ticket de soporte correctamente.

RESUMEN DEL TICKET:
- Tipo: ${tipoTexto}
- Descripcion: ${descripcion}

PROXIMOS PASOS:
1. Si aun no lo has hecho, descarga AnyDesk: https://anydesk.com/es/downloads/windows
2. Te contactaremos en menos de 2 horas
3. Nos conectamos y resolvemos tu problema

Horario de atencion: 08:00-14:00 y 16:00-19:00 (Lunes a Viernes)

---
AI Security - info@aisecurity.es
`;

    // Email HTML para admin (notificación)
    const adminEmailHtml = `
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
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 16px 16px 0 0;">
                      <div style="font-size: 48px; margin-bottom: 16px;">🚨</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        NUEVO TICKET DE SOPORTE
                      </h1>
                      <p style="margin: 12px 0 0; color: #fecaca; font-size: 15px;">
                        Primera hora GRATIS - Requiere atencion
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <!-- Priority Banner -->
                      <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; text-align: center;">
                        <p style="margin: 0; color: #dc2626; font-weight: 600; font-size: 14px;">
                          ⏰ Tiempo de respuesta objetivo: &lt; 2 horas
                        </p>
                      </div>

                      <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                        Informacion del Cliente
                      </h2>

                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Nombre:</strong> ${nombre}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Email:</strong>
                              <a href="mailto:${email}" style="color: #0284c7;">${email}</a>
                            </p>
                          </td>
                        </tr>
                        ${telefono ? `
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Teléfono:</strong>
                              <a href="tel:${telefono}" style="color: #0284c7; font-weight: 600; font-size: 16px;">${telefono}</a>
                            </p>
                          </td>
                        </tr>
                        ` : ''}
                        ${empresa ? `
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Empresa:</strong> ${empresa}
                            </p>
                          </td>
                        </tr>
                        ` : ''}
                        ${anydesk ? `
                        <tr>
                          <td style="padding: 12px; background-color: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0; color: #1e40af; font-size: 14px;">
                              <strong>AnyDesk ID:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${anydesk}</code>
                            </p>
                          </td>
                        </tr>
                        ` : `
                        <tr>
                          <td style="padding: 12px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                              <strong>AnyDesk:</strong> No proporcionado - Guiar al cliente durante la llamada
                            </p>
                          </td>
                        </tr>
                        `}
                      </table>

                      <h2 style="margin: 24px 0 20px; color: #0f172a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                        Detalles de la Incidencia
                      </h2>

                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 8px; border-left: 4px solid #ef4444;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Tipo de incidencia:</strong> ${tipoTexto}
                            </p>
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Descripcion:</strong>
                            </p>
                            <div style="margin-top: 8px; padding: 12px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                              <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${descripcion}</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Quick Actions -->
                      <div style="margin-top: 24px; text-align: center;">
                        <a href="mailto:${email}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 8px;">
                          ✉️ Responder al cliente
                        </a>
                        <a href="mailto:${email}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          ✉️ Enviar email
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">
                        Ticket enviado desde aisecurity.es/abrir-ticket - ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
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

    const adminTextFallback = `NUEVO TICKET DE SOPORTE - AI Security

⏰ Tiempo de respuesta objetivo: < 2 horas

INFORMACION DEL CLIENTE:
- Nombre: ${nombre}
- Email: ${email}
${telefono ? `- Teléfono: ${telefono}\n` : ''}- Empresa: ${empresa || 'No especificada'}
- AnyDesk ID: ${anydesk || 'No proporcionado'}

DETALLES DE LA INCIDENCIA:
- Tipo: ${tipoTexto}
- Descripcion: ${descripcion}

---
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
`;

    // Enviar confirmación al usuario
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: email,
      subject: '🎫 Ticket de soporte recibido - AI Security',
      html: userEmailHtml,
      text: userTextFallback,
    });

    // Enviar notificación al admin
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      replyTo: email,
      subject: `🚨 NUEVO TICKET: ${tipoTexto} - ${nombre}${empresa ? ` (${empresa})` : ''}`,
      html: adminEmailHtml,
      text: adminTextFallback,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ticket enviado correctamente',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error procesando ticket:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar el ticket' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

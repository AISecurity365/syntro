import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const nombre = data.nombre;
    const pais = data.pais;
    const email = data.email;
    const telefono = data.telefono; // WhatsApp
    const perfil = data.perfil;     // LinkedIn / web
    const experiencia = data.experiencia;
    const mensaje = data.mensaje;

    // Validación básica: sin nombre, país y contacto no hay candidatura útil
    if (!nombre || !pais || !email || !telefono) {
      return new Response(
        JSON.stringify({ error: 'Nombre, país, email y WhatsApp son obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Guardar en el CRM de leads (no bloquea el envio de emails si falla)
    await saveLead({
      source: 'partner',
      name: nombre,
      email,
      phone: telefono,
      message: mensaje,
      extra: { pais, perfil, experiencia },
    });

    // ─── Email de confirmación al partner ───
    const partnerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f9;">
          <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f6f9;">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.1);overflow:hidden;">
                  <tr>
                    <td style="padding:40px 40px 30px;text-align:center;background:rgba(255,255,255,0.1);">
                      <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:700;">Candidatura recibida</h1>
                      <p style="margin:10px 0 0;color:#dbeafe;font-size:16px;">Programa de Partners Wazuh · Latinoamérica</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 20px;">
                      <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:12px;">
                        <tr>
                          <td style="padding:40px;">
                            <p style="margin:0 0 24px;color:#2d3748;font-size:16px;line-height:1.6;">
                              Hola ${nombre}, gracias por tu interés en representar Wazuh en ${pais}. Hemos recibido tu candidatura.
                            </p>
                            <div style="background-color:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;padding:16px;margin:24px 0;">
                              <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.6;">
                                <strong>Próximo paso:</strong> revisaremos tu perfil y te escribiremos en 24-48 h para hacer una videollamada, resolver dudas y explicarte cómo trabajamos codo con codo (tú prescribes, nosotros implementamos).
                              </p>
                            </div>
                            <p style="margin:24px 0 0;color:#4a5568;font-size:14px;line-height:1.6;">
                              Cualquier duda, responde a este correo.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 40px;text-align:center;background:rgba(255,255,255,0.05);">
                      <p style="margin:0 0 8px;color:#ffffff;font-size:14px;"><strong>AI Security</strong></p>
                      <p style="margin:0;font-size:13px;">
                        <a href="mailto:info@aisecurity.es" style="color:#ffffff;text-decoration:none;">info@aisecurity.es</a>
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

    const partnerTextFallback = `Candidatura recibida - Programa de Partners Wazuh (Latinoamérica)

Hola ${nombre}, gracias por tu interés en representar Wazuh en ${pais}.

Próximo paso: revisaremos tu perfil y te escribiremos en 24-48 h para una videollamada.

Contacto: info@aisecurity.es
`;

    // ─── Email de notificación al admin ───
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f9;">
          <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f6f9;">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding:40px 40px 30px;text-align:center;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);border-radius:16px 16px 0 0;">
                      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">🤝 Nuevo Partner LATAM</h1>
                      <p style="margin:12px 0 0;">
                        <span style="display:inline-block;padding:5px 14px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:999px;color:#ffffff;font-size:13px;font-weight:700;">
                          🌎 ${pais}
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 20px;color:#0f172a;font-size:18px;font-weight:600;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">Datos del candidato</h2>
                      <table role="presentation" style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:12px 0;"><p style="margin:0;color:#475569;font-size:14px;"><strong style="color:#1e293b;">Nombre:</strong> ${nombre}</p></td></tr>
                        <tr><td style="padding:12px 0;"><p style="margin:0;color:#475569;font-size:14px;"><strong style="color:#1e293b;">País:</strong> ${pais}</p></td></tr>
                        <tr><td style="padding:12px 0;"><p style="margin:0;color:#475569;font-size:14px;"><strong style="color:#1e293b;">Email:</strong> ${email}</p></td></tr>
                        <tr><td style="padding:12px 0;"><p style="margin:0;color:#475569;font-size:14px;"><strong style="color:#1e293b;">WhatsApp / Teléfono:</strong> ${telefono}</p></td></tr>
                        ${perfil ? `<tr><td style="padding:12px 0;"><p style="margin:0;color:#475569;font-size:14px;"><strong style="color:#1e293b;">LinkedIn / Web:</strong><br><a href="${perfil}" style="color:#2563eb;text-decoration:none;word-break:break-all;">${perfil}</a></p></td></tr>` : ''}
                      </table>
                      ${experiencia ? `
                      <div style="margin-top:24px;padding:20px;background-color:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;">
                        <p style="margin:0 0 8px;color:#1e40af;font-weight:600;font-size:14px;">Experiencia en ciberseguridad / red de contactos:</p>
                        <p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.6;">${experiencia}</p>
                      </div>` : ''}
                      ${mensaje ? `
                      <div style="margin-top:16px;padding:20px;background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;">
                        <p style="margin:0 0 8px;color:#713f12;font-weight:600;font-size:14px;">Mensaje adicional:</p>
                        <p style="margin:0;color:#854d0e;font-size:14px;line-height:1.6;">${mensaje}</p>
                      </div>` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px;text-align:center;background-color:#f8fafc;border-radius:0 0 16px 16px;">
                      <p style="margin:0;color:#64748b;font-size:12px;">
                        Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
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

    const adminTextFallback = `🤝 Nuevo Partner LATAM — ${pais}

Nombre: ${nombre}
País: ${pais}
Email: ${email}
WhatsApp/Teléfono: ${telefono}
${perfil ? `LinkedIn/Web: ${perfil}` : ''}
${experiencia ? `Experiencia: ${experiencia}` : ''}
${mensaje ? `Mensaje: ${mensaje}` : ''}

Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
`;

    // Confirmación al partner
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: email,
      subject: 'Candidatura recibida — Programa de Partners Wazuh',
      html: partnerEmailHtml,
      text: partnerTextFallback,
    });

    // Notificación al admin
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'julen.sistemas@gmail.com',
      replyTo: email,
      subject: `🤝 [PARTNER LATAM] ${nombre} — ${pais}`,
      html: adminEmailHtml,
      text: adminTextFallback,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Candidatura enviada correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error procesando candidatura de partner:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la candidatura' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
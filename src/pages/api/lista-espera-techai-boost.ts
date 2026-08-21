import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await saveLead({ source: 'lista-espera-techai-boost', email });

    const userEmailHtml = `
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
                <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:linear-gradient(135deg,#065f46 0%,#059669 100%);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.1);overflow:hidden;">
                  <tr>
                    <td style="padding:40px 40px 30px;text-align:center;background:rgba(255,255,255,0.1);">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">¡Estás en la lista!</h1>
                      <p style="margin:10px 0 0;color:#d1fae5;font-size:16px;">TechIA Boost — Curso para sysadmins</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 20px;">
                      <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:12px;">
                        <tr>
                          <td style="padding:40px;">
                            <p style="margin:0 0 20px;color:#2d3748;font-size:16px;line-height:1.6;">
                              Gracias por apuntarte a la lista de espera del curso <strong>TechIA Boost</strong>. Te avisaremos en cuanto abran las inscripciones.
                            </p>
                            <table role="presentation" style="width:100%;border-collapse:collapse;background:#f0fdf4;border-radius:8px;margin:20px 0;border-left:4px solid #059669;">
                              <tr>
                                <td style="padding:20px;">
                                  <h2 style="margin:0 0 12px;color:#1a202c;font-size:17px;font-weight:600;">Lo que vas a aprender</h2>
                                  <ul style="margin:0;padding-left:20px;color:#4a5568;font-size:14px;line-height:1.8;">
                                    <li>Claude para diagnosticar errores, generar scripts y documentar</li>
                                    <li>Whisperflow: dictar incidencias y comandos por voz</li>
                                    <li>Atajos y expansores de texto para IT</li>
                                    <li>Scripts bash/PowerShell generados con IA</li>
                                    <li>Gestión de incidencias de servidores con IA</li>
                                  </ul>
                                </td>
                              </tr>
                            </table>
                            <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin:20px 0;">
                              <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
                                <strong>Fecha estimada:</strong> 7 de Julio de 2026 · 90 minutos · 30€
                              </p>
                            </div>
                            <p style="margin:20px 0 0;color:#4a5568;font-size:13px;">¿Tienes alguna pregunta? Escríbenos a <a href="mailto:info@aisecurity.es" style="color:#059669;">info@aisecurity.es</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:25px 40px;text-align:center;background:rgba(255,255,255,0.05);">
                      <p style="margin:0;color:#ffffff;font-size:13px;"><strong>AI Security</strong> · <a href="mailto:info@aisecurity.es" style="color:#d1fae5;text-decoration:none;">info@aisecurity.es</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family:'Segoe UI',sans-serif;background:#f8fafc;padding:40px 20px;">
          <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
            <div style="background:linear-gradient(135deg,#065f46,#059669);border-radius:8px;padding:20px 24px;margin-bottom:24px;">
              <h2 style="margin:0;color:#fff;font-size:20px;">Nueva inscripción — TechIA Boost</h2>
            </div>
            <p style="color:#334155;font-size:15px;"><strong>Email:</strong> ${email}</p>
            <p style="color:#64748b;font-size:13px;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: email,
      subject: '¡Estás en la lista de espera! — TechIA Boost',
      html: userEmailHtml,
      text: `¡Estás en la lista de espera de TechIA Boost!\n\nFecha: 7 de Julio 2026 · 90 min · 30€\nTe avisaremos cuando abran inscripciones.\n\ninfo@aisecurity.es`,
    });

    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      replyTo: email,
      subject: 'Nueva lista de espera — TechIA Boost',
      html: adminEmailHtml,
      text: `Nueva inscripción lista de espera TechIA Boost\nEmail: ${email}\nFecha: ${new Date().toLocaleString('es-ES')}`,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Apuntado a la lista de espera' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

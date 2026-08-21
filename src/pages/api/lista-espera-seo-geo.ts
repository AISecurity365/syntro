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

    await saveLead({ source: 'lista-espera-seo-geo', email });

    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f9;">
          <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f6f9;">
            <tr><td align="center" style="padding:40px 20px;">
              <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:linear-gradient(135deg,#92400e 0%,#f59e0b 100%);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.1);overflow:hidden;">
                <tr>
                  <td style="padding:40px 40px 30px;text-align:center;background:rgba(255,255,255,0.1);">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">¡Estás en la lista!</h1>
                    <p style="margin:10px 0 0;color:#fef3c7;font-size:16px;">SEO + GEO con Claude — Posiciónate en Google y en IAs</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 20px 20px;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:12px;">
                      <tr>
                        <td style="padding:40px;">
                          <p style="margin:0 0 20px;color:#2d3748;font-size:16px;line-height:1.6;">
                            Gracias por apuntarte. Te avisaremos en cuanto abran las inscripciones del curso <strong>SEO + GEO con Claude</strong>.
                          </p>
                          <table role="presentation" style="width:100%;border-collapse:collapse;background:#fffbeb;border-radius:8px;margin:20px 0;border-left:4px solid #f59e0b;">
                            <tr><td style="padding:20px;">
                              <h2 style="margin:0 0 12px;color:#1a202c;font-size:17px;font-weight:600;">Lo que vas a aprender</h2>
                              <ul style="margin:0;padding-left:20px;color:#4a5568;font-size:14px;line-height:1.8;">
                                <li>Investigación de keywords con Claude: prompts exactos</li>
                                <li>GEO: aparecer en ChatGPT, Perplexity y Gemini</li>
                                <li>Crear contenido que posiciona en Google y en IAs</li>
                                <li>Schema markup y structured data generados con Claude</li>
                                <li>Auditorías SEO automáticas con IA</li>
                              </ul>
                            </td></tr>
                          </table>
                          <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin:20px 0;">
                            <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
                              <strong>Fecha estimada:</strong> 26 de Julio de 2026 · 50€ · Acceso permanente
                            </p>
                          </div>
                          <p style="margin:20px 0 0;color:#4a5568;font-size:13px;">¿Tienes alguna pregunta? <a href="mailto:info@aisecurity.es" style="color:#d97706;">info@aisecurity.es</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px 40px;text-align:center;background:rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#ffffff;font-size:13px;"><strong>AI Security</strong> · <a href="mailto:info@aisecurity.es" style="color:#fef3c7;text-decoration:none;">info@aisecurity.es</a></p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family:'Segoe UI',sans-serif;background:#f8fafc;padding:40px 20px;">
          <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
            <div style="background:linear-gradient(135deg,#92400e,#f59e0b);border-radius:8px;padding:20px 24px;margin-bottom:24px;">
              <h2 style="margin:0;color:#fff;font-size:20px;">Nueva inscripción — SEO + GEO con Claude</h2>
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
      subject: '¡Estás en la lista de espera! — SEO + GEO con Claude',
      html: userEmailHtml,
      text: `¡Estás en la lista de espera de SEO + GEO con Claude!\n\nFecha: 26 de Julio 2026 · 50€ · Acceso permanente\nTe avisaremos cuando abran inscripciones.\n\ninfo@aisecurity.es`,
    });

    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      replyTo: email,
      subject: 'Nueva lista de espera — SEO + GEO con Claude',
      html: adminEmailHtml,
      text: `Nueva inscripción lista de espera SEO + GEO con Claude\nEmail: ${email}\nFecha: ${new Date().toLocaleString('es-ES')}`,
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
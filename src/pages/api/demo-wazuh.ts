import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const email = data.get('email')?.toString().trim();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Introduce un email válido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await saveLead({ source: 'demo-wazuh', email });

    const fecha = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      reply_to: email,
      subject: `🛡️ Demo Wazuh solicitada: ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f4f6f9;">
            <table role="presentation" style="width:100%;background:#f4f6f9;">
              <tr><td align="center" style="padding:40px 20px;">
                <table role="presentation" style="max-width:500px;width:100%;background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.1);overflow:hidden;">
                  <tr>
                    <td style="padding:32px 40px 24px;background:linear-gradient(135deg,#6366f1 0%,#3b82f6 100%);text-align:center;">
                      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">🛡️ Demo de Wazuh solicitada</h1>
                      <p style="margin:8px 0 0;color:#dbeafe;font-size:14px;">Alguien quiere ver una demo funcional</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px;">
                      <table role="presentation" style="width:100%;background:#eef2ff;border-radius:8px;border-left:4px solid #6366f1;">
                        <tr><td style="padding:20px;">
                          <p style="margin:0 0 12px;color:#1e3a5f;font-size:14px;"><strong>Email:</strong> <span style="font-size:18px;font-weight:700;">${email}</span></p>
                          <p style="margin:0;color:#1e3a5f;font-size:14px;"><strong>Fecha:</strong> ${fecha}</p>
                        </td></tr>
                      </table>
                      <p style="margin:24px 0 0;color:#64748b;font-size:13px;text-align:center;">
                        Solicitud de demo recibida desde /wazuh — contactar para mostrar los usos de Wazuh.
                      </p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
      text: `Demo de Wazuh solicitada\n\nEmail: ${email}\nFecha: ${fecha}`,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'No se pudo enviar. Inténtalo de nuevo o escríbenos a info@aisecurity.es' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, nombre, mensaje } = data;

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'El email es obligatorio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email no válido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Guardar en el CRM de leads (no bloquea el envío de emails si falla)
    await saveLead({
      source: 'contacto',
      name: nombre,
      email,
      message: mensaje,
    });

    // Notificación al admin
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      replyTo: email,
      subject: `Nuevo contacto — ${nombre || email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h2 style="color: #60a5fa; margin: 0 0 24px;">Nuevo mensaje de contacto</h2>
          <p><strong>Email:</strong> ${email}</p>
          ${nombre ? `<p><strong>Nombre:</strong> ${nombre}</p>` : ''}
          ${mensaje ? `<p><strong>Mensaje:</strong></p><p style="background:#1e293b;padding:16px;border-radius:8px;border-left:3px solid #3b82f6;">${mensaje}</p>` : ''}
          <p style="color:#64748b;font-size:12px;margin-top:32px;">Enviado desde aisecurity.es — ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en contacto:', error);
    return new Response(
      JSON.stringify({ error: 'Error al enviar el mensaje' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = typeof data?.email === 'string' ? data.email.trim() : '';
    const nombre = typeof data?.nombre === 'string' ? data.nombre.trim() : '';
    const mensaje = typeof data?.mensaje === 'string' ? data.mensaje.trim() : '';
    const isIdea = data?.plan === 'consultoria-ia';
    if (data?.website) return Response.json({ success: true });

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'El email es obligatorio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return new Response(
        JSON.stringify({ error: 'Email no válido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (nombre.length > 200 || mensaje.length > 5000 || (isIdea && mensaje.length < 10)) {
      return Response.json({ error: 'Escribe tu idea entre 10 y 5000 caracteres.' }, { status: 400 });
    }
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
    const safeEmail = escapeHtml(email);
    const safeName = escapeHtml(nombre);
    const safeMessage = escapeHtml(mensaje).replace(/\n/g, '<br>');

    // Guardar en el CRM de leads (no bloquea el envío de emails si falla)
    await saveLead({
      source: 'contacto',
      name: nombre,
      email,
      message: mensaje,
      ...(isIdea ? { plan: 'consultoria-ia', extra: { page: '/consultoria-ia', form: 'idea' } } : {}),
    });

    // Notificación al admin
    const { error } = await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      replyTo: email,
      subject: isIdea ? `Idea de automatización — ${email}` : `Nuevo contacto — ${nombre || email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h2 style="color: #60a5fa; margin: 0 0 24px;">${isIdea ? 'Idea de automatización · Consultoría IA' : 'Nuevo mensaje de contacto'}</h2>
          <p><strong>Email:</strong> ${safeEmail}</p>
          ${nombre ? `<p><strong>Nombre:</strong> ${safeName}</p>` : ''}
          ${mensaje ? `<p><strong>Mensaje:</strong></p><p style="background:#1e293b;padding:16px;border-radius:8px;border-left:3px solid #3b82f6;">${safeMessage}</p>` : ''}
          <p style="color:#64748b;font-size:12px;margin-top:32px;">Enviado desde aisecurity.es — ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
        </div>
      `,
    });

    if (error) return Response.json({ error: 'Error al enviar el mensaje' }, { status: 502 });

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

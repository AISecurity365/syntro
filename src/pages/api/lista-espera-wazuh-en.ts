import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const source = typeof body.source === 'string' ? body.source.slice(0, 200) : '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'A valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await saveLead({ source: 'lista-espera-wazuh-en', lang: 'en', email, extra: { source } });

    const fecha = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

    // Aviso al admin (en español)
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      reply_to: email,
      subject: `🛡️ Lista de espera curso Wazuh (EN): ${email}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 28px;color:#fff;">
            <h1 style="margin:0;font-size:20px;">🛡️ Nuevo registro · Curso Wazuh (EN)</h1>
          </div>
          <div style="padding:24px 28px;color:#1e293b;font-size:14px;">
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
            <p style="margin:0 0 8px;"><strong>Origen:</strong> ${source || 'blog EN'}</p>
            <p style="margin:0;"><strong>Fecha:</strong> ${fecha}</p>
          </div>
        </div>
      `,
      text: `Lista de espera curso Wazuh (EN)\nEmail: ${email}\nOrigen: ${source}\nFecha: ${fecha}`,
    });

    // Confirmación al usuario (en inglés)
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: email,
      subject: "You're on the list — Wazuh course (English)",
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 32px;text-align:center;color:#fff;">
            <div style="font-size:34px;">🛡️</div>
            <h1 style="margin:8px 0 0;font-size:24px;">You're on the waitlist!</h1>
            <p style="margin:8px 0 0;color:#ddd6fe;font-size:15px;">Wazuh course · English edition</p>
          </div>
          <div style="padding:32px;color:#334155;font-size:15px;line-height:1.7;">
            <p style="margin:0 0 16px;">Thanks for your interest in the <strong>Wazuh course in English</strong>. It launches in about <strong>40 days</strong> and we'll email you the moment it opens.</p>
            <p style="margin:0 0 16px;">You'll learn Wazuh hands-on: from install to custom rules and threat hunting in real environments.</p>
            <p style="margin:24px 0 0;color:#64748b;font-size:13px;">Meanwhile, if you'd like us to deploy Wazuh in your company, just reply to this email.</p>
            <p style="margin:18px 0 0;color:#94a3b8;font-size:12px;">— AI Security · aisecurity.es</p>
          </div>
        </div>
      `,
      text: "You're on the waitlist for the Wazuh course (English). It launches in ~40 days and we'll email you when it opens. — AI Security",
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again or email info@aisecurity.es' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
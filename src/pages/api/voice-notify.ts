import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Aviso simple: alguien ha pulsado el botón de "hablar por voz" en la web.
// Se llama desde el cliente (sendBeacon) cuando el visitante elige la opción de voz.
export const POST: APIRoute = async ({ request }) => {
  try {
    let page = "";
    try {
      const b = await request.json();
      page = (b && typeof b.page === "string") ? b.page : "";
    } catch (_) {}

    const fecha = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

    await resend.emails.send({
      from: "AI Security <info@aisecurity.es>",
      to: "julen.sistemas@gmail.com",
      subject: "🎙️ Alguien quiere hablar por voz",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4f46e5,#2563eb);padding:22px 24px;border-radius:8px 8px 0 0;">
            <h2 style="color:white;margin:0;font-size:1.15rem;">🎙️ Alguien quiere hablar por voz</h2>
          </div>
          <div style="background:#f8fafc;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;color:#1e293b;">
            <p style="margin:0 0 10px;">Un visitante acaba de pulsar el botón de <strong>llamada de voz</strong> en la web.</p>
            <p style="margin:0 0 4px;"><strong>Fecha:</strong> ${fecha}</p>
            ${page ? `<p style="margin:0 0 4px;"><strong>Página:</strong> ${page}</p>` : ""}
            <p style="margin:14px 0 0;color:#64748b;font-size:0.85rem;">Si la conversación llegó a producirse, la verás en tu panel de ElevenLabs → Conversational AI.</p>
          </div>
        </div>
      `,
      text: `Alguien quiere hablar por voz.\nFecha: ${fecha}${page ? `\nPágina: ${page}` : ""}\n\nDetalle en ElevenLabs → Conversational AI.`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error en voice-notify:", e);
    return new Response("error", { status: 500 });
  }
};
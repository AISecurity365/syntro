import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

export const prerender = false;

// Webhook post-llamada de ElevenLabs Conversational AI.
// Se configura en el panel de ElevenLabs (Conversational AI → Settings → Webhooks
// → Post-call transcription) apuntando a:  https://aisecurity.es/api/elevenlabs-webhook
// Al terminar una llamada, ElevenLabs hace POST aquí y nosotros te avisamos por
// correo de que ha habido una llamada (el detalle lo revisas en ElevenLabs).
//
// Seguridad (opcional): copia el "Webhook secret" de ElevenLabs y guárdalo en
// Vercel como ELEVENLABS_WEBHOOK_SECRET. Si está, verificamos la firma HMAC.

function fmtDuration(secs: number | null): string {
  if (secs == null || isNaN(secs)) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const raw = await request.text();

    // ── Verificación de firma (si hay secreto configurado) ──
    const secret = import.meta.env.ELEVENLABS_WEBHOOK_SECRET;
    if (secret) {
      const sigHeader = request.headers.get("elevenlabs-signature") || "";
      const parts: Record<string, string> = {};
      sigHeader.split(",").forEach((p) => {
        const [k, v] = p.split("=");
        if (k && v) parts[k.trim()] = v.trim();
      });
      const t = parts["t"];
      const v0 = parts["v0"];
      if (!t || !v0) return new Response("bad signature", { status: 401 });
      const expected = crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
      const a = Buffer.from(v0);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return new Response("invalid signature", { status: 401 });
      }
    }

    const body = JSON.parse(raw);

    // Solo nos interesa la transcripción post-llamada
    if (body.type && body.type !== "post_call_transcription") {
      return new Response(null, { status: 204 });
    }

    const data = body.data || body;
    const transcript: any[] = Array.isArray(data.transcript) ? data.transcript : [];
    const durationSecs: number | null =
      data.metadata?.call_duration_secs ?? data.metadata?.call_duration ?? null;
    const conversationId: string = data.conversation_id || "";
    const startUnix: number | null = data.metadata?.start_time_unix_secs ?? null;

    // Si no hubo ninguna intervención, no avisamos (widget abierto sin hablar)
    const hasContent = transcript.some((m) => (m.message ?? m.text ?? "").toString().trim());
    if (!hasContent) {
      return new Response(null, { status: 204 });
    }

    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: parseInt(import.meta.env.SMTP_PORT),
      secure: false,
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASSWORD,
      },
    });

    const fecha = startUnix
      ? new Date(startUnix * 1000).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
      : new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#4f46e5,#2563eb);padding:22px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:white;margin:0;font-size:1.15rem;">🎙️ Ha habido una llamada de voz</h2>
        </div>
        <div style="background:#f8fafc;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;color:#1e293b;">
          <p style="margin:0 0 10px;">Alguien acaba de hablar con la IA de voz en la web.</p>
          <p style="margin:0 0 4px;"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin:0 0 4px;"><strong>Duración:</strong> ${fmtDuration(durationSecs)}</p>
          ${conversationId ? `<p style="margin:0 0 12px;"><strong>ID conversación:</strong> ${conversationId}</p>` : ""}
          <p style="margin:14px 0 0;color:#64748b;font-size:0.85rem;">Puedes ver la transcripción completa en tu panel de ElevenLabs → Conversational AI.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"AI Security Web" <${import.meta.env.SMTP_FROM_EMAIL}>`,
      to: "info@aisecurity.es",
      subject: `🎙️ Nueva llamada de voz en la web (${fmtDuration(durationSecs)})`,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error en elevenlabs-webhook:", e);
    return new Response("error", { status: 500 });
  }
};

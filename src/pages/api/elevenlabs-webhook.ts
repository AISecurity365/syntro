import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

export const prerender = false;

// Webhook post-llamada de ElevenLabs Conversational AI.
// Se configura en el panel de ElevenLabs (Conversational AI → Settings → Webhooks
// → Post-call transcription) apuntando a:  https://aisecurity.es/api/elevenlabs-webhook
// Al terminar una llamada, ElevenLabs hace POST aquí con la transcripción y el
// resumen, y nosotros te lo reenviamos por correo (igual que el chat).
//
// Seguridad (opcional pero recomendada): copia el "Webhook secret" que te da
// ElevenLabs y guárdalo en Vercel como ELEVENLABS_WEBHOOK_SECRET. Si está puesto,
// verificamos la firma HMAC; si no, aceptamos igualmente para facilitar el arranque.

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
    const summary: string = data.analysis?.transcript_summary || "";
    const durationSecs: number | null =
      data.metadata?.call_duration_secs ?? data.metadata?.call_duration ?? null;
    const conversationId: string = data.conversation_id || "";
    const startUnix: number | null = data.metadata?.start_time_unix_secs ?? null;

    // Normaliza cada turno (ElevenLabs usa role "agent"/"user" y campo "message")
    const turns = transcript
      .map((m) => ({
        role: m.role === "user" ? "user" : "agent",
        text: (m.message ?? m.text ?? "").toString().trim(),
      }))
      .filter((m) => m.text.length > 0);

    // Si el usuario no dijo nada, no molestamos con correo
    const userTurns = turns.filter((m) => m.role === "user");
    if (userTurns.length === 0) {
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

    const lines = turns
      .map(
        (m) => `<tr>
          <td style="padding:6px 10px;font-weight:bold;color:${m.role === "user" ? "#2563eb" : "#16a34a"};white-space:nowrap;vertical-align:top;">
            ${m.role === "user" ? "👤 Cliente" : "🎙️ IA"}
          </td>
          <td style="padding:6px 10px;color:#1e293b;">${m.text}</td>
        </tr>`
      )
      .join("");

    const fecha = startUnix
      ? new Date(startUnix * 1000).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
      : new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#4f46e5,#2563eb);padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:white;margin:0;font-size:1.1rem;">🎙️ Llamada de voz con la IA</h2>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:0.85rem;">
            Duración: ${fmtDuration(durationSecs)} · ${fecha}
          </p>
        </div>
        <div style="background:#f8fafc;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;">
          ${
            summary
              ? `<div style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:6px;padding:12px 14px;margin-bottom:16px;">
                   <p style="margin:0 0 4px;font-weight:bold;color:#3730a3;font-size:0.85rem;">Resumen</p>
                   <p style="margin:0;color:#1e293b;font-size:0.9rem;line-height:1.5;">${summary}</p>
                 </div>`
              : ""
          }
          <table style="width:100%;border-collapse:collapse;">${lines}</table>
          ${
            conversationId
              ? `<p style="margin:16px 0 0;color:#94a3b8;font-size:0.75rem;">ID conversación: ${conversationId}</p>`
              : ""
          }
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"AI Security Web" <${import.meta.env.SMTP_FROM_EMAIL}>`,
      to: "info@aisecurity.es",
      subject: `🎙️ Llamada de voz — ${userTurns.length} intervención${userTurns.length > 1 ? "es" : ""} del cliente`,
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

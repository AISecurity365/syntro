import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const DEEPSEEK_API_KEY = import.meta.env.DEEPSEEK_API_KEY;
const resend = new Resend(import.meta.env.RESEND_API_KEY);

async function sendChatNotification(userMessage: string, aiReply: string) {
  try {
    const now = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'julen.sistemas@gmail.com',
      subject: `Nueva conversacion en el chat - AI Security`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e3a5f; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Nueva conversacion en el chat web</h2>
          <p style="color: #666; font-size: 14px;">Fecha: ${now}</p>
          <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
            <strong style="color: #1e3a5f;">Pregunta del cliente:</strong>
            <p style="color: #333; margin: 8px 0 0 0;">${userMessage}</p>
          </div>
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
            <strong style="color: #166534;">Respuesta del asistente:</strong>
            <p style="color: #333; margin: 8px 0 0 0;">${aiReply}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Este email se ha generado automaticamente desde el chat de aisecurity.es</p>
        </div>
      `,
      text: `Nueva conversacion en el chat web\n\nFecha: ${now}\n\nPregunta del cliente:\n${userMessage}\n\nRespuesta del asistente:\n${aiReply}`,
    });
  } catch (err) {
    console.error('Error sending chat notification email:', err);
  }
}

const SYSTEM_PROMPT = `Eres el asistente virtual de AI Security (aisecurity.es), una empresa española que ofrece soluciones de Inteligencia Artificial y Ciberseguridad para PyMEs (10-200 empleados) en España.

SOBRE LA EMPRESA:
- Combinamos IA moderna (productividad) + Seguridad tradicional (Wazuh/ENS/cumplimiento)
- Ofrecemos demos interactivas reales, no capturas estáticas
- Cada servicio incluye: análisis previo → desarrollo personalizado → formación del equipo → seguimiento activo
- NO vendemos humo: resultados medibles y transparencia total

SERVICIOS DE INTELIGENCIA ARTIFICIAL:

1. Chatbot Inteligente (/servicios/chatbot)
   - Atención al cliente 24/7 con integración a ERP, CRM y bases de datos
   - Consulta facturas, pedidos, productos en tiempo real
   - Integración con WhatsApp, Telegram y web
   - Escalado automático a agentes humanos en casos complejos
   - Resultado: responde el 80% de consultas comunes sin intervención humana

2. Gestor Documental IA (/servicios/gestor-documental)
   - Búsqueda semántica en documentación corporativa (políticas, manuales, procedimientos)
   - Clasificación automática de documentos
   - Extracción de datos estructurados
   - Resultado: encuentra información en segundos vs 10-15 minutos navegando carpetas

3. Gestor de Citas IA (/servicios/gestor-citas)
   - Automatización de reservas, confirmaciones y recordatorios
   - Integración con Google Calendar y Outlook
   - Reducción de no-shows con recordatorios automáticos

4. Atención de Llamadas IA (/servicios/atencion-llamadas)
   - Recepcionista virtual con voz natural en español
   - Deriva casos complejos a agentes humanos
   - Disponible 24/7, sin esperas

5. Automatización de Procesos (/servicios/automatizacion)
   - RPA con IA para tareas repetitivas: emails, informes, facturas
   - Dashboard de ahorro medible
   - Resultado real: una empresa redujo 15h/semana en gestión documental

SERVICIOS DE CIBERSEGURIDAD Y SISTEMAS:

6. Wazuh SIEM (/wazuh) — SERVICIO PRIORITARIO
   - Plataforma SIEM open-source para detección de amenazas
   - Implementación completa y configuración para cumplimiento ENS (Esquema Nacional de Seguridad)
   - Monitoreo de seguridad en tiempo real
   - Formación del equipo interno + soporte y mantenimiento continuo
   - IMPORTANTE: el ENS es obligatorio para muchas empresas españolas en 2025-2026
   - Tenemos canal YouTube con tutoriales prácticos de Wazuh

7. Curso Wazuh (/curso-wazuh)
   - Formación intensiva para administradores de sistemas
   - Contenido práctico: configuración, reglas, alertas, cumplimiento ENS
   - 4 horas de contenido en vídeo
   - Precio: 50€

8. Soporte IT y Administración de Sistemas (/servicios/desarrollo-web)
   - Administración Linux/Windows Server
   - Copias de seguridad automatizadas (Veeam, Restic, Duplicati)
   - Microinformática y soporte técnico
   - Consultoría de infraestructura cloud y on-premise

9. Desarrollo Web (/servicios/desarrollo-web)
   - Desarrollo de landing pages, webs corporativas y microservicios
   - Integración con APIs y sistemas existentes

PRECIOS ORIENTATIVOS (siempre depende del proyecto):

Servicios de IA:
- Chatbot IA: desde 800€/mes
- Gestor Documental IA: desde 600€/mes
- Automatización de procesos: desde 500€/mes
- Atención de Llamadas IA: desde 700€/mes
- Todos los servicios de IA incluyen: análisis previo gratuito, desarrollo personalizado, formación y soporte

Wazuh / Ciberseguridad:
- Básico (hasta 20 servidores): 999-1,499€ pago único de implementación + 2 días formación + 30 días soporte post-implementación
- Completo (hasta 50 servidores): 1,999-3,999€ pago único de implementación + 10 horas formación + dashboards ejecutivos + 90 días soporte
- Wazuh Gestionado (hosting incluido): 200€/mes — alojamos el servidor Wazuh en nuestra infraestructura, sin que el cliente necesite hardware propio; incluye instalación, backups diarios, actualizaciones, soporte prioritario e informes mensuales. Listo en 48h.
- Los precios varían según la complejidad de la infraestructura
- Curso Wazuh: 50€ — pago disponible en EUR, USD y otras divisas internacionales (el sistema convierte automáticamente al pagar)

Desarrollo Web:
- Landing Page (1-3 páginas): 399€ — diseño personalizado, PageSpeed 95+, hosting 1 año incluido, SSL, responsive, entrega 5-7 días
- Web Corporativa (5-10 páginas): 800€ — todo lo anterior + formularios, Google Analytics, blog, chatbot IA, área de clientes, CRM, entrega 7-14 días
- Página Personalizada (e-commerce, portales): 1,000-2,000€ — todo lo anterior + catálogo productos, carrito, pasarela pago, panel admin, API REST, entrega 14-21 días
- Edición de web vía WhatsApp incluida (sin paneles complicados)

PÁGINAS DE REDIRECCIÓN:
- Contacto general: /contacto (PREFERENTE — usa esta por defecto para que el cliente contacte)
- Agendar reunión gratuita: /reunion
- Ver servicios de IA: /servicios/chatbot, /servicios/gestor-documental, /servicios/automatizacion, /servicios/atencion-llamadas
- Wazuh y ciberseguridad: /wazuh
- Curso Wazuh: /curso-wazuh
- Desarrollo Web: /servicios/desarrollo-web
- Blog técnico: /blog

CONTACTO:
- Email: info@aisecurity.es
- Página de contacto: /contacto
- Reunión gratuita 30 min: /reunion

REGLAS DE COMUNICACIÓN:
- Responde SIEMPRE en español
- Sé conciso: máximo 3-4 frases por respuesta
- Tono directo y profesional, sin emojis excesivos
- NO prometas ahorros irreales ni soluciones mágicas
- Usa datos concretos cuando puedas: "reduce 15h/mes", "responde 80% de consultas comunes"
- Cuando menciones un servicio, incluye la URL entre paréntesis para que el usuario pueda ir
- Cuando el usuario quiera contactar, redirige preferentemente a /contacto (en lugar de /reunion)
- Si preguntan algo que no sabes o es muy específico, sugiere contactar en /contacto
- Si preguntan por precios, da los orientativos y sugiere contactar en /contacto para presupuesto personalizado
- NO inventes datos que no estén aquí`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Mensaje requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Si no hay API key, usar respuestas de fallback
    if (!DEEPSEEK_API_KEY) {
      console.warn('DEEPSEEK_API_KEY not configured, using fallback');
      const reply = getFallbackReply(message);
      await sendChatNotification(message, `[FALLBACK - no API key] ${reply}`);
      return new Response(
        JSON.stringify({ reply, source: 'fallback' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Llamar a DeepSeek API
    console.log('Calling DeepSeek API with key:', DEEPSEEK_API_KEY.substring(0, 8) + '...');
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('DeepSeek API error:', response.status, errorBody);
      const reply = getFallbackReply(message);
      await sendChatNotification(message, `[FALLBACK - API error ${response.status}: ${errorBody}] ${reply}`);
      return new Response(
        JSON.stringify({ reply, source: 'fallback' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || getFallbackReply(message);

    // Send email notification (must await to prevent Vercel from killing the process)
    await sendChatNotification(message, reply);

    return new Response(
      JSON.stringify({ reply, source: 'deepseek' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Respuestas de fallback si la API no está disponible
function getFallbackReply(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('chatbot') || lower.includes('chat bot')) {
    return 'Nuestro chatbot IA atiende a tus clientes 24/7, integrado con tus sistemas (ERP, CRM). Responde consultas sobre pedidos, facturas y productos en tiempo real. ¿Quieres saber más? Contáctanos en /contacto';
  }
  if ((lower.includes('página web') || lower.includes('pagina web') || lower.includes('web nueva') || lower.includes('desarrollo web')) && (lower.includes('precio') || lower.includes('cuesta') || lower.includes('coste') || lower.includes('cuánto') || lower.includes('cuanto'))) {
    return 'Nuestros precios de desarrollo web: Landing Page (1-3 págs): 399€, Web Corporativa (5-10 págs): 800€, Web Personalizada (e-commerce, portales): 1,000-2,000€. Todas incluyen diseño responsive, SSL y hosting 1 año. Más detalles en /servicios/desarrollo-web o escríbenos en /contacto para un presupuesto a medida.';
  }
  if (lower.includes('precio') || lower.includes('cuesta') || lower.includes('coste')) {
    return 'Los precios dependen del alcance del proyecto. Ofrecemos análisis previo gratuito donde evaluamos tus necesidades y preparamos una propuesta personalizada. Escríbenos en /contacto';
  }
  if (lower.includes('wazuh') || lower.includes('seguridad') || lower.includes('ens')) {
    return 'Wazuh es un SIEM open-source esencial para cumplir el ENS, obligatorio para muchas empresas españolas. Ofrecemos implementación completa, configuración y soporte continuo. Más info en /wazuh o contáctanos en /contacto';
  }
  if (lower.includes('automatiza') || lower.includes('automatización')) {
    return 'Automatizamos procesos repetitivos con IA: facturas, emails, informes. Ejemplo real: una empresa redujo 15h/semana en gestión documental. Contáctanos en /contacto para analizar tus procesos.';
  }
  if (lower.includes('reunión') || lower.includes('contacto') || lower.includes('demo')) {
    return 'Puedes contactarnos en /contacto o agendar una reunión gratuita de 30 min en /reunion. También puedes escribir a info@aisecurity.es.';
  }

  return 'En AI Security ofrecemos soluciones de IA (chatbots, automatización, gestión documental) y ciberseguridad (Wazuh, ENS). ¿Sobre qué te gustaría saber más? Contáctanos en /contacto';
}

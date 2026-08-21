import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  let lang: 'en' | 'es' = 'es';
  try {
    const data = await request.json();

    const nombre = data.nombre;
    const empresa = data.empresa;
    const email = data.email;
    const telefono = data.telefono;
    const wordpress_url = data.wordpress_url;
    const mensaje = data.mensaje;
    const plan = data.plan;
    lang = data.lang === 'en' ? 'en' : 'es';

    // Strings localizados de error para el usuario final
    const errBasic = lang === 'en' ? 'Name and phone are required' : 'Nombre y teléfono son obligatorios';

    // Validación básica
    if (!nombre || !telefono) {
      return new Response(
        JSON.stringify({ error: errBasic }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Guardar en el CRM de leads (no bloquea el envio de emails si falla)
    await saveLead({
      source: 'migracion',
      lang,
      name: nombre,
      company: empresa,
      email,
      phone: telefono,
      message: mensaje,
      plan,
      extra: { wordpress_url },
    });

    // Mapeo de planes y servicios
    const planesMap: Record<string, string> = {
      // Migración WordPress
      'landing': 'Landing Page (450€)',
      'corporativa': 'Web Corporativa (800€)',
      'personalizada': 'Página Personalizada (1,000€ - 2,000€)',

      // Wazuh / Ciberseguridad
      'wazuh-implementacion': 'Implementación Wazuh',
      'wazuh-basico': 'Wazuh Básico',
      'wazuh-empresarial': 'Wazuh Empresarial',
      'wazuh-avanzado': 'Wazuh Avanzado',
      'wazuh-consultoria': 'Consultoría Wazuh',
      'wazuh-soporte': 'Soporte Wazuh',

      // Otros servicios
      'consultoria-ia': 'Consultoría IA',
      'desarrollo-web': 'Desarrollo Web',
      'automatizacion': 'Automatización de Procesos'
    };

    const noEspecificado = lang === 'en' ? 'Not specified' : 'No especificado';
    const planTexto = plan ? planesMap[plan] || plan : noEspecificado;

    // Strings localizados para el usuario final (cliente)
    const T = lang === 'en'
      ? {
          requestReceived: 'Request Received',
          headerSubtitle: 'WordPress to Astro migration',
          greeting: `Hi ${nombre}, thank you for your interest in ${planTexto}. We've received your request successfully.`,
          selectedPlan: 'Selected plan',
          nextStepLabel: 'Next step:',
          nextStepBody: "We'll get in touch with you within the next 24-48 hours to analyze your site and provide you with a detailed quote.",
          anyQuestions: "If you have any questions, don't hesitate to contact us.",
          textGreeting: `Hi ${nombre}, thank you for your interest in ${planTexto}.`,
          textNextStep: "Next step: We'll get in touch with you within the next 24-48 hours to provide you with more information and a detailed quote.",
          servicePlan: 'Service/Plan',
          subject: 'Migration request received - AI Security',
          successMessage: 'Request sent successfully',
        }
      : {
          requestReceived: 'Solicitud Recibida',
          headerSubtitle: 'Migracion de WordPress a Astro',
          greeting: `Hola ${nombre}, gracias por tu interés en ${planTexto}. Hemos recibido tu solicitud correctamente.`,
          selectedPlan: 'Plan Seleccionado',
          nextStepLabel: 'Proximo paso:',
          nextStepBody: 'Nos pondremos en contacto contigo en las proximas 24-48 horas para analizar tu sitio y proporcionarte un presupuesto detallado.',
          anyQuestions: 'Si tienes alguna pregunta, no dudes en contactarnos.',
          textGreeting: `Hola ${nombre}, gracias por tu interés en ${planTexto}.`,
          textNextStep: 'Proximo paso: Nos pondremos en contacto contigo en las proximas 24-48 horas para proporcionarte más información y un presupuesto detallado.',
          servicePlan: 'Servicio/Plan',
          subject: 'Solicitud de migracion recibida - AI Security',
          successMessage: 'Solicitud enviada correctamente',
        };

    // Email HTML para el usuario (confirmación)
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f6f9;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${T.requestReceived}
                      </h1>
                      <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">
                        ${T.headerSubtitle}
                      </p>
                    </td>
                  </tr>

                  <!-- Content Card -->
                  <tr>
                    <td style="padding: 0 20px 20px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0 0 24px; color: #2d3748; font-size: 16px; line-height: 1.6;">
                              ${T.greeting}
                            </p>

                            <!-- Plan Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 8px; margin: 24px 0; border-left: 4px solid #8b5cf6;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h2 style="margin: 0 0 16px; color: #1a202c; font-size: 18px; font-weight: 600;">
                                    ${T.selectedPlan}
                                  </h2>
                                  <p style="margin: 0; color: #581c87; font-size: 18px; font-weight: 700;">
                                    ${planTexto}
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <!-- Next Steps -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                <strong style="color: #78350f;">${T.nextStepLabel}</strong> ${T.nextStepBody}
                              </p>
                            </div>

                            <p style="margin: 24px 0 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                              ${T.anyQuestions}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background: rgba(255,255,255,0.05);">
                      <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px;">
                        <strong>AI Security</strong>
                      </p>
                      <p style="margin: 0; font-size: 13px;">
                        <a href="mailto:info@aisecurity.es" style="color: #ffffff; text-decoration: none;">info@aisecurity.es</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const userTextFallback = `${T.requestReceived} - AI Security

${T.textGreeting}

${T.servicePlan}: ${planTexto}

${T.textNextStep}

${lang === 'en' ? 'Contact' : 'Contacto'}: info@aisecurity.es
`;

    // Email HTML para admin (notificación)
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f6f9;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px 16px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        Nueva Solicitud de Proyecto
                      </h1>
                      ${lang === 'en' ? `
                      <p style="margin: 12px 0 0;">
                        <span style="display: inline-block; padding: 5px 14px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 999px; color: #ffffff; font-size: 13px; font-weight: 700;">
                          🌐 Lead desde la web en INGLÉS (/en)
                        </span>
                      </p>
                      ` : ''}
                      <p style="margin: 12px 0 0; color: #ede9fe; font-size: 15px;">
                        Solicitud de información sobre ${planTexto}
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <!-- Plan Box -->
                      <div style="padding: 20px; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 24px;">
                        <p style="margin: 0; color: #6b21a8; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          Plan Seleccionado
                        </p>
                        <p style="margin: 8px 0 0; color: #581c87; font-size: 18px; font-weight: 700;">
                          ${planTexto}
                        </p>
                      </div>

                      <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                        Informacion de Contacto
                      </h2>

                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Nombre:</strong> ${nombre}
                            </p>
                          </td>
                        </tr>
                        ${empresa ? `
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Empresa:</strong> ${empresa}
                            </p>
                          </td>
                        </tr>
                        ` : ''}
                        ${email ? `
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Email:</strong> ${email}
                            </p>
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Telefono:</strong> ${telefono}
                            </p>
                          </td>
                        </tr>
                        ${wordpress_url ? `
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">URL WordPress:</strong><br>
                              <a href="${wordpress_url}" style="color: #8b5cf6; text-decoration: none; word-break: break-all;">${wordpress_url}</a>
                            </p>
                          </td>
                        </tr>
                        ` : ''}
                      </table>

                      ${mensaje ? `
                      <div style="margin-top: 24px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                        <p style="margin: 0 0 8px; color: #713f12; font-weight: 600; font-size: 14px;">Mensaje adicional:</p>
                        <p style="margin: 0; color: #854d0e; font-size: 14px; line-height: 1.6;">${mensaje}</p>
                      </div>
                      ` : ''}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">
                        Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const adminTextFallback = `Nueva Solicitud de Proyecto

Servicio/Plan: ${planTexto}

Nombre: ${nombre}
${empresa ? `Empresa: ${empresa}` : ''}
${email ? `Email: ${email}` : ''}
Telefono: ${telefono}
${wordpress_url ? `URL WordPress: ${wordpress_url}` : ''}
${mensaje ? `Mensaje: ${mensaje}` : ''}

Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
    `;

    // Enviar confirmación al usuario (solo si tiene email)
    if (email) {
      await resend.emails.send({
        from: 'AI Security <info@aisecurity.es>',
        to: email,
        subject: T.subject,
        html: userEmailHtml,
        text: userTextFallback,
      });
    }

    // Enviar notificación al admin
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'julen.sistemas@gmail.com',
      replyTo: email || undefined,
      subject: `${lang === 'en' ? '🌐 [EN] ' : ''}Nueva solicitud proyecto: ${planTexto}`,
      html: adminEmailHtml,
      text: adminTextFallback,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: T.successMessage
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error procesando solicitud:', error);
    return new Response(
      JSON.stringify({ error: lang === 'en' ? 'There was an error processing the request' : 'Error al procesar la solicitud' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

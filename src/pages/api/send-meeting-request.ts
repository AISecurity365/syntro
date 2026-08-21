import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { saveLead } from '../../lib/leads';
import { createCalendarEvent, isValidTimeSlot, formatDate } from '../../lib/google-calendar';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  let lang: 'en' | 'es' = 'es';
  try {
    const data = await request.formData();

    lang = data.get('lang')?.toString() === 'en' ? 'en' : 'es';
    const nombre = data.get('nombre')?.toString();
    const empresa = data.get('empresa')?.toString();
    const email = data.get('email')?.toString();
    const telefono = data.get('telefono')?.toString();
    const servicios = data.get('servicios')?.toString();
    const empleados = data.get('empleados')?.toString();
    const mensaje = data.get('mensaje')?.toString();
    const presupuesto = data.get('presupuesto')?.toString();
    const selectedDate = data.get('selectedDate')?.toString();
    const selectedTime = data.get('selectedTime')?.toString();

    // Validación básica: solo email es obligatorio
    if (!email) {
      return new Response(
        JSON.stringify({ error: lang === 'en' ? 'Email is required' : 'El email es obligatorio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate date and time if provided
    if (selectedDate && selectedTime) {
      if (!isValidTimeSlot(selectedTime)) {
        return new Response(
          JSON.stringify({ error: lang === 'en' ? 'Selected time slot is not valid' : 'Horario seleccionado no válido' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // No se permite reservar el mismo día (ni días pasados): mínimo mañana
      const hoyMadrid = new Date(new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Madrid' }));
      const minFecha = new Date(hoyMadrid);
      minFecha.setDate(minFecha.getDate() + 1);
      const fechaElegida = new Date(selectedDate + 'T00:00:00');
      if (isNaN(fechaElegida.getTime()) || fechaElegida < minFecha) {
        return new Response(
          JSON.stringify({ error: lang === 'en' ? 'You can only book from tomorrow onwards. Please choose another day.' : 'Solo puedes reservar a partir de mañana. Elige otro día.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Mapeo de servicios para mejor presentación
    const serviciosMap: Record<string, string> = {
      'chatbot': 'Chatbot Inteligente',
      'gestor-documental': 'Gestor Documental IA',
      'gestor-citas': 'Gestor de Citas IA',
      'atencion-llamadas': 'Atención de Llamadas IA',
      'automatizacion': 'Automatización de Procesos',
      'consultoria': 'Consultoría Personalizada',
      'multiple': 'Múltiples servicios'
    };

    const empleadosMap: Record<string, string> = {
      '1-10': '1-10 empleados',
      '11-50': '11-50 empleados',
      '51-200': '51-200 empleados',
      '201-500': '201-500 empleados',
      '500+': 'Más de 500 empleados'
    };

    const presupuestoMap: Record<string, string> = {
      '5k-15k': '€5,000 - €15,000',
      '15k-50k': '€15,000 - €50,000',
      '50k-100k': '€50,000 - €100,000',
      '100k+': 'Más de €100,000',
      'no-sure': 'No estoy seguro'
    };

    // Construir el contenido del email
    const servicioTexto = servicios ? serviciosMap[servicios] || servicios : 'No especificado';
    const empleadosTexto = empleados ? empleadosMap[empleados] || empleados : 'No especificado';
    const presupuestoTexto = presupuesto ? presupuestoMap[presupuesto] || presupuesto : 'No especificado';

    // Strings localizados para el usuario final (cliente). El email al admin queda en español.
    const T = lang === 'en'
      ? {
          requestReceived: 'Request Received',
          subtitleScheduled: 'Your meeting has been scheduled',
          subtitlePending: "We'll get in touch with you soon",
          greeting: `Hi${nombre ? ` ${nombre}` : ''}, thank you for getting in touch. We've received your request successfully.`,
          meetingDetails: 'Meeting Details',
          dateLabel: 'Date',
          timeLabel: 'Time',
          joinMeeting: 'Join the meeting',
          nextStepLabel: 'Next step:',
          nextStepBody: "We'll get in touch with you within the next 24-48 hours to schedule a meeting.",
          anyQuestions: "If you have any questions, don't hesitate to contact us.",
          textDetails: 'Meeting details:',
          textLink: 'Link',
          textContactLabel: 'Contact',
          subjectScheduled: 'Meeting scheduled - AI Security',
          subjectPending: 'Request received - AI Security',
          successScheduled: 'Meeting scheduled successfully',
          successPending: 'Request sent successfully',
        }
      : {
          requestReceived: 'Solicitud Recibida',
          subtitleScheduled: 'Tu reunion ha sido agendada',
          subtitlePending: 'Nos pondremos en contacto contigo pronto',
          greeting: `Hola ${nombre}, gracias por tu interes en nuestros servicios de ${servicioTexto}. Hemos recibido tu solicitud correctamente.`,
          meetingDetails: 'Detalles de la Reunion',
          dateLabel: 'Fecha',
          timeLabel: 'Hora',
          joinMeeting: 'Unirse a la reunion',
          nextStepLabel: 'Proximo paso:',
          nextStepBody: 'Nos pondremos en contacto contigo en las proximas 24-48 horas para agendar una reunion.',
          anyQuestions: 'Si tienes alguna pregunta, no dudes en contactarnos.',
          textDetails: 'Detalles de la reunion:',
          textLink: 'Enlace',
          textContactLabel: 'Contacto',
          subjectScheduled: 'Reunion agendada - AI Security',
          subjectPending: 'Solicitud recibida - AI Security',
          successScheduled: 'Reunión agendada correctamente',
          successPending: 'Solicitud enviada correctamente',
        };

    // Create Google Calendar event if date and time are selected
    let calendarEvent: { eventId: string; meetLink?: string } | null = null;
    let meetingDate: Date | null = null;

    if (selectedDate && selectedTime) {
      try {
        meetingDate = new Date(selectedDate);
        calendarEvent = await createCalendarEvent({
          name: nombre,
          email: email,
          phone: telefono,
          company: empresa,
          date: meetingDate,
          timeSlot: selectedTime,
          message: mensaje,
        });
      } catch (calendarError) {
        console.error('Error creating calendar event:', calendarError);
        // Continue without calendar event - don't fail the whole request
      }
    }

    // Guardar en el CRM de leads (no bloquea el envio de emails si falla)
    await saveLead({
      source: 'reunion',
      lang,
      name: nombre,
      company: empresa,
      email,
      phone: telefono,
      message: mensaje,
      extra: {
        servicios: servicioTexto,
        empleados: empleadosTexto,
        presupuesto: presupuestoTexto,
        selectedDate,
        selectedTime,
        meetLink: calendarEvent?.meetLink,
      },
    });

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
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${T.requestReceived}
                      </h1>
                      <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">
                        ${calendarEvent ? T.subtitleScheduled : T.subtitlePending}
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

                            ${calendarEvent ? `
                            <!-- Meeting Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; margin: 24px 0; border-left: 4px solid #0ea5e9;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h2 style="margin: 0 0 16px; color: #1a202c; font-size: 18px; font-weight: 600;">
                                    ${T.meetingDetails}
                                  </h2>
                                  <p style="margin: 0 0 8px; color: #4a5568; font-size: 15px;">
                                    <strong style="color: #2d3748;">${T.dateLabel}:</strong> ${formatDate(meetingDate!)}
                                  </p>
                                  <p style="margin: 0; color: #4a5568; font-size: 15px;">
                                    <strong style="color: #2d3748;">${T.timeLabel}:</strong> ${selectedTime}h
                                  </p>
                                  ${calendarEvent.meetLink ? `
                                  <div style="margin-top: 16px;">
                                    <a href="${calendarEvent.meetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                      ${T.joinMeeting}
                                    </a>
                                  </div>
                                  ` : ''}
                                </td>
                              </tr>
                            </table>
                            ` : `
                            <!-- Pending Contact -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                <strong style="color: #78350f;">${T.nextStepLabel}</strong> ${T.nextStepBody}
                              </p>
                            </div>
                            `}

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

${T.greeting}

${calendarEvent ? `${T.textDetails}
${T.dateLabel}: ${formatDate(meetingDate!)}
${T.timeLabel}: ${selectedTime}h
${calendarEvent.meetLink ? `${T.textLink}: ${calendarEvent.meetLink}` : ''}` : T.nextStepBody}

${T.textContactLabel}: info@aisecurity.es
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
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 16px 16px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        Nueva Solicitud de Consulta
                      </h1>
                      ${lang === 'en' ? `
                      <p style="margin: 12px 0 0;">
                        <span style="display: inline-block; padding: 5px 14px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 999px; color: #ffffff; font-size: 13px; font-weight: 700;">
                          🌐 Lead desde la web en INGLÉS (/en)
                        </span>
                      </p>
                      ` : ''}
                      ${calendarEvent ? `
                      <p style="margin: 12px 0 0; color: #e0f2fe; font-size: 15px;">
                        Reunion agendada: ${formatDate(meetingDate!)} a las ${selectedTime}h
                      </p>
                      ${calendarEvent.meetLink ? `
                      <a href="${calendarEvent.meetLink}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background-color: #ffffff; color: #0284c7; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                        Unirse a la reunion
                      </a>
                      ` : ''}
                      ` : `
                      <p style="margin: 12px 0 0; padding: 12px; background-color: rgba(254, 243, 199, 0.3); border-left: 3px solid #fbbf24; border-radius: 4px; color: #fef3c7; font-size: 14px;">
                        Accion requerida: Contactar para agendar reunion
                      </p>
                      `}
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                        Informacion del Cliente
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
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Email:</strong> ${email || 'No proporcionado'}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Telefono:</strong> ${telefono || 'No proporcionado'}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <h2 style="margin: 24px 0 20px; color: #0f172a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                        Detalles del Proyecto
                      </h2>

                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; border-left: 4px solid #0ea5e9; padding: 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Servicio de interes:</strong> ${servicioTexto}
                            </p>
                            <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Tamano de empresa:</strong> ${empleadosTexto}
                            </p>
                            <p style="margin: 0; color: #475569; font-size: 14px;">
                              <strong style="color: #1e293b;">Presupuesto estimado:</strong> ${presupuestoTexto}
                            </p>
                          </td>
                        </tr>
                      </table>

                      ${mensaje ? `
                      <div style="margin-top: 24px; padding: 20px; background-color: #fefce8; border-left: 4px solid #eab308; border-radius: 8px;">
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
                        Enviado desde aisecurity.es - ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
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

    const adminTextFallback = `Nueva Solicitud de Consulta

Nombre: ${nombre}
Empresa: ${empresa || 'No especificada'}
Email: ${email || 'No proporcionado'}
Telefono: ${telefono || 'No proporcionado'}
Servicio de interes: ${servicioTexto}
Tamano de empresa: ${empleadosTexto}
Presupuesto estimado: ${presupuestoTexto}

${calendarEvent ? `Reunion agendada: ${formatDate(meetingDate!)} a las ${selectedTime}h
${calendarEvent.meetLink ? `Enlace: ${calendarEvent.meetLink}` : ''}` : ''}

${mensaje ? `Mensaje: ${mensaje}` : ''}

---
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
`;

    // Enviar confirmación al usuario (solo si tiene email)
    if (email) {
      await resend.emails.send({
        from: 'AI Security <info@aisecurity.es>',
        to: email,
        subject: calendarEvent ? T.subjectScheduled : T.subjectPending,
        html: userEmailHtml,
        text: userTextFallback,
      });
    }

    // Enviar notificación al admin
    await resend.emails.send({
      from: 'AI Security <info@aisecurity.es>',
      to: 'info@aisecurity.es',
      replyTo: email || undefined,
      subject: `${lang === 'en' ? '🌐 [EN] ' : ''}Nueva solicitud de consulta - ${nombre || email}${empresa ? ` (${empresa})` : ''}`,
      html: adminEmailHtml,
      text: adminTextFallback,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: calendarEvent ? T.successScheduled : T.successPending,
        calendarEventId: calendarEvent?.eventId,
        meetLink: calendarEvent?.meetLink
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
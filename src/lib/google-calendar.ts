import { google } from 'googleapis';
import { randomUUID } from 'node:crypto';
import { meetingSlots } from './meeting-schedule';

/**
 * Google Calendar Service Account Configuration
 *
 * Required environment variables:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 * - GOOGLE_PRIVATE_KEY: Service account private key
 * - GOOGLE_CALENDAR_ID: Target calendar ID (usually your email)
 */

// Configuration
const TIMEZONE = 'Europe/Madrid';
const MEETING_DURATION_MINUTES = 120; // 2 horas (120 minutos)

// Available time slots (24-hour format)
const AVAILABLE_SLOTS = [
  { start: '10:00', end: '12:00' }, // 2 horas
  { start: '12:00', end: '14:00' }, // 2 horas
  { start: '15:00', end: '17:00' }, // 2 horas
  { start: '19:00', end: '21:00' }, // 2 horas
];

/**
 * Initialize Google Calendar client with Service Account
 */
function usesPersonalCalendar(): boolean {
  return Boolean(import.meta.env.GOOGLE_OAUTH_REFRESH_TOKEN);
}

function getCalendarId(): string | undefined {
  return usesPersonalCalendar() ? 'primary' : import.meta.env.GOOGLE_CALENDAR_ID;
}

function getCalendarClient() {
  if (usesPersonalCalendar()) {
    const clientId = import.meta.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = import.meta.env.GOOGLE_OAUTH_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Missing Google OAuth client configuration');
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: import.meta.env.GOOGLE_OAUTH_REFRESH_TOKEN });
    return google.calendar({ version: 'v3', auth });
  }
  const serviceAccountEmail = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log('[Google Calendar] Service Account Email:', serviceAccountEmail);
  console.log('[Google Calendar] Private Key exists:', !!privateKey);

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google Calendar credentials in environment variables');
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

// Interpret a wall-clock time in Madrid regardless of the server's timezone.
function madridTime(dateKey: string, time: string): Date {
  const wallTime = Date.parse(`${dateKey}T${time}:00Z`);
  let instant = wallTime;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  for (let i = 0; i < 2; i++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p => [p.type, p.value]));
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    instant += wallTime - represented;
  }
  return new Date(instant);
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(date: Date): Promise<string[]> {
  const dateKey = date.toISOString().slice(0, 10);
  const scheduledSlots = meetingSlots(dateKey);
  if (!scheduledSlots.length) return [];
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  console.log('[Google Calendar] Calendar ID:', calendarId);

  if (!calendarId) {
    throw new Error('Missing GOOGLE_CALENDAR_ID environment variable');
  }

  const startOfDay = madridTime(dateKey, '00:00');
  const nextDay = new Date(dateKey + 'T12:00:00Z');
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const endOfDay = madridTime(nextDay.toISOString().slice(0, 10), '00:00');

  try {
    // Get all events for the day
    const response = await calendar.events.list({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      timeZone: TIMEZONE,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    // Check which slots are available
    const availableSlots: string[] = [];

    for (const start of scheduledSlots) {
      const slot = { start, end: `${String(Number(start.slice(0, 2)) + 2).padStart(2, '0')}:00` };
      const slotStart = madridTime(dateKey, slot.start);
      const slotEnd = madridTime(dateKey, slot.end);

      // Check if slot overlaps with any existing event
      const isOccupied = events.some(event => {
        if (event.status === 'cancelled' || event.transparency === 'transparent') return false;
        const start = event.start?.dateTime || event.start?.date;
        const end = event.end?.dateTime || event.end?.date;
        if (!start || !end) return false;
        const eventStart = event.start?.dateTime ? new Date(start) : madridTime(start, '00:00');
        const eventEnd = event.end?.dateTime ? new Date(end) : madridTime(end, '00:00');

        return (
          (slotStart >= eventStart && slotStart < eventEnd) ||
          (slotEnd > eventStart && slotEnd <= eventEnd) ||
          (slotStart <= eventStart && slotEnd >= eventEnd)
        );
      });

      if (!isOccupied) {
        availableSlots.push(slot.start);
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    throw new Error('Failed to check calendar availability');
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  date: Date;
  timeSlot: string; // Format: "HH:MM"
  message?: string;
}): Promise<{ eventId: string; meetLink?: string; organizerEmail?: string }> {
  console.log('[Google Calendar] Creating event for:', data.name, 'on', data.date, 'at', data.timeSlot);

  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  console.log('[Google Calendar] Using Calendar ID:', calendarId);

  if (!calendarId) {
    throw new Error('Missing GOOGLE_CALENDAR_ID environment variable');
  }

  // Parse time slot
  const [hours, minutes] = data.timeSlot.split(':').map(Number);
  const startTime = new Date(data.date);
  startTime.setUTCHours(hours, minutes, 0, 0);

  const endTime = new Date(startTime);
  endTime.setUTCMinutes(endTime.getUTCMinutes() + MEETING_DURATION_MINUTES);

  // Build event description
  const descriptionParts = [
    `Reunión solicitada por: ${data.name}`,
    data.email ? `Email: ${data.email}` : '',
    data.phone ? `Teléfono: ${data.phone}` : '',
    data.company ? `Empresa: ${data.company}` : '',
    data.message ? `\nMensaje:\n${data.message}` : '',
  ].filter(Boolean);

  try {
    console.log('[Google Calendar] Inserting event with data:', {
      calendarId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      summary: `Reunión: ${data.name}${data.company ? ` - ${data.company}` : ''}`,
    });

    let event = await calendar.events.insert({
      calendarId,
      ...(usesPersonalCalendar() ? { conferenceDataVersion: 1, sendUpdates: 'all' } : {}),
      requestBody: {
        summary: `Reunión: ${data.name}${data.company ? ` - ${data.company}` : ''}`,
        description: descriptionParts.join('\n'),
        start: {
          dateTime: startTime.toISOString().slice(0, 19),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endTime.toISOString().slice(0, 19),
          timeZone: TIMEZONE,
        },
        ...(usesPersonalCalendar() ? {
          attendees: data.email ? [{ email: data.email, displayName: data.name }] : [],
          conferenceData: {
            createRequest: {
              requestId: randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        } : {}),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      },
    });

    // Meet provisioning is asynchronous. Never recreate an already inserted event.
    if (usesPersonalCalendar() && event.data.id) {
      for (let attempt = 0; attempt < 3 && event.data.conferenceData?.createRequest?.status?.statusCode === 'pending'; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          event = await calendar.events.get({ calendarId, eventId: event.data.id! });
        } catch {
          break; // Google still delivers the invitation; keep the existing event.
        }
      }
    }

    console.log('[Google Calendar] Event created successfully!', {
      eventId: event.data.id,
      meetLink: event.data.hangoutLink,
    });

    return {
      eventId: event.data.id!,
      meetLink: event.data.hangoutLink || event.data.conferenceData?.entryPoints?.find(entry => entry.entryPointType === 'video')?.uri || undefined,
      organizerEmail: usesPersonalCalendar() ? event.data.organizer?.email || undefined : undefined,
    };
  } catch (error) {
    console.error('[Google Calendar] ERROR creating event:', error);
    if (error instanceof Error) {
      console.error('[Google Calendar] Error message:', error.message);
      console.error('[Google Calendar] Error stack:', error.stack);
    }
    throw new Error('Failed to create calendar event');
  }
}

/**
 * Get next N available dates (including weekends)
 */
export function getNextAvailableDates(days: number = 30): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow

  while (dates.length < days) {
    // Include all days (weekends enabled)
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: TIMEZONE,
  }).format(date);
}

/**
 * Validate if a time slot is in the available slots
 */
export function isValidTimeSlot(timeSlot: string, dateKey?: string): boolean {
  return dateKey ? meetingSlots(dateKey).includes(timeSlot) : AVAILABLE_SLOTS.some(slot => slot.start === timeSlot);
}

import { google } from 'googleapis';
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
function getCalendarClient() {
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

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(date: Date): Promise<string[]> {
  const dateKey = date.toISOString().slice(0, 10);
  const scheduledSlots = meetingSlots(dateKey);
  if (!scheduledSlots.length) return [];
  const calendar = getCalendarClient();
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;

  console.log('[Google Calendar] Calendar ID:', calendarId);

  if (!calendarId) {
    throw new Error('Missing GOOGLE_CALENDAR_ID environment variable');
  }

  // Set time to start of day in Madrid timezone
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Set time to end of day
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

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
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const [endHour, endMinute] = slot.end.split(':').map(Number);
      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      // Check if slot overlaps with any existing event
      const isOccupied = events.some(event => {
        if (!event.start?.dateTime || !event.end?.dateTime) return false;

        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

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
}): Promise<{ eventId: string; meetLink?: string }> {
  console.log('[Google Calendar] Creating event for:', data.name, 'on', data.date, 'at', data.timeSlot);

  const calendar = getCalendarClient();
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;

  console.log('[Google Calendar] Using Calendar ID:', calendarId);

  if (!calendarId) {
    throw new Error('Missing GOOGLE_CALENDAR_ID environment variable');
  }

  // Parse time slot
  const [hours, minutes] = data.timeSlot.split(':').map(Number);
  const startTime = new Date(data.date);
  startTime.setHours(hours, minutes, 0, 0);

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + MEETING_DURATION_MINUTES);

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

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Reunión: ${data.name}${data.company ? ` - ${data.company}` : ''}`,
        description: descriptionParts.join('\n'),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: TIMEZONE,
        },
        // Note: Google Meet auto-generation removed due to Service Account limitations
        // Service Accounts cannot create Google Meet conferences without Domain-Wide Delegation
        // The calendar owner can manually add a Meet link from Google Calendar after the event is created
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      },
    });

    console.log('[Google Calendar] Event created successfully!', {
      eventId: event.data.id,
      meetLink: event.data.hangoutLink,
    });

    return {
      eventId: event.data.id!,
      meetLink: event.data.hangoutLink,
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

import type { APIRoute } from 'astro';
import { getAvailableSlots } from '../../lib/google-calendar';

/**
 * API Route: Check available time slots for a specific date
 *
 * Method: POST
 * Body: { date: "YYYY-MM-DD" }
 * Response: { availableSlots: ["10:00", "11:00", ...] }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Date is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse date
    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return new Response(
        JSON.stringify({ error: 'Cannot book dates in the past' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get scheduled weekday slots, filtered by Google Calendar
    const availableSlots = await getAvailableSlots(requestedDate);

    return new Response(
      JSON.stringify({ availableSlots }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking availability:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

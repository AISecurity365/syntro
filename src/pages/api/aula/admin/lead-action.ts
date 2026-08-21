import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'julen.sistemas@gmail.com';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const leadId = formData.get('lead_id')?.toString();
    const status = formData.get('status')?.toString();
    const nextFollowUpDate = formData.get('next_follow_up_date')?.toString();
    const note = formData.get('note')?.toString().trim();

    if (!leadId) {
      return new Response(JSON.stringify({ error: 'lead_id es obligatorio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!);

    // Actualizar estado y próxima fecha de seguimiento del lead
    const updatePayload: Record<string, string | null> = {};
    if (status) updatePayload.status = status;
    updatePayload.next_follow_up_date = nextFollowUpDate || null;

    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId);

    if (updateError) {
      console.error('Error actualizando lead:', updateError);
      return new Response(JSON.stringify({ error: 'Error al actualizar el lead' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Guardar la nota si el admin escribió algo
    if (note) {
      const { error: noteError } = await supabaseAdmin
        .from('lead_notes')
        .insert({ lead_id: leadId, note });

      if (noteError) {
        console.error('Error guardando nota:', noteError);
      }
    }

    return redirect(`/aula/admin/leads/${leadId}?updated=1`);
  } catch (error) {
    console.error('Error en lead-action:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

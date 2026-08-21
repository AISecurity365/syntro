import { createClient } from '@supabase/supabase-js';

export type LeadSource =
  | 'contacto'
  | 'migracion'
  | 'demo-wazuh'
  | 'te-llamamos'
  | 'ticket-soporte'
  | 'reunion'
  | 'partner'
  | 'passbolt'
  | 'inscripcion-curso-wazuh'
  | 'lista-espera-wazuh-en'
  | 'lista-espera-techai-boost'
  | 'lista-espera-seo-geo';

export interface LeadInput {
  source: LeadSource;
  lang?: 'es' | 'en';
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  plan?: string | null;
  extra?: Record<string, unknown>;
}

/**
 * Guarda un lead comercial en el CRM (tabla `leads`).
 * Nunca lanza: si Supabase no está configurado o falla el insert,
 * se registra en consola y se continúa (no debe romper el envío de emails).
 */
export async function saveLead(input: LeadInput): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('saveLead: Supabase no configurado, lead no guardado en CRM');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('leads').insert({
      source: input.source,
      lang: input.lang || 'es',
      name: input.name || null,
      company: input.company || null,
      email: input.email || null,
      phone: input.phone || null,
      message: input.message || null,
      plan: input.plan || null,
      extra: input.extra || {},
    });

    if (error) {
      console.error('saveLead: error al guardar en CRM:', error);
    }
  } catch (err) {
    console.error('saveLead: excepción al guardar en CRM:', err);
  }
}
-- =====================================================
-- ESQUEMA: CRM de leads comerciales
-- AI Security - aisecurity.es
--
-- INSTRUCCIONES: ejecutar este archivo completo en el
-- SQL Editor de Supabase (Dashboard → SQL Editor → New query).
-- Requiere que supabase-schema.sql ya se haya ejecutado antes
-- (reutiliza la función update_updated_at_column()).
-- =====================================================

-- =====================================================
-- TABLA: leads
-- Un registro por cada envío de formulario comercial del sitio
-- (contacto, migración, demo, soporte, reuniones, partners,
-- listas de espera...). NO incluye los usuarios del curso Wazuh
-- (course_users), que ya tienen su propio panel en /aula/admin.
-- =====================================================
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,              -- 'contacto' | 'migracion' | 'demo-wazuh' | 'te-llamamos' | 'ticket-soporte' | 'reunion' | 'partner' | 'passbolt' | 'inscripcion-curso-wazuh' | 'lista-espera-wazuh-en' | 'lista-espera-techai-boost' | 'lista-espera-seo-geo'
  lang TEXT NOT NULL DEFAULT 'es' CHECK (lang IN ('es', 'en')),
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  plan TEXT,
  extra JSONB DEFAULT '{}'::jsonb,    -- campos específicos de cada formulario (país, tipo de incidencia, servicios de interés, etc.)
  status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'convertido', 'descartado')),
  next_follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_lang ON leads(lang);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up_date);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Solo el service role (usado desde las API routes del servidor) puede leer/escribir
CREATE POLICY "Service role full access to leads"
  ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: lead_notes
-- Historial de interacciones/seguimiento comercial por lead
-- (p.ej. "contactado por teléfono el 12/08, interesado en plan X,
-- volver a llamar la semana que viene")
-- =====================================================
CREATE TABLE lead_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_notes_lead ON lead_notes(lead_id, created_at DESC);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to lead_notes"
  ON lead_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);
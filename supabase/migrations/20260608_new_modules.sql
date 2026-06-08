-- Agenda / événements
CREATE TABLE IF NOT EXISTS agenda_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT DEFAULT '09:00',
  type TEXT DEFAULT 'task',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_events_authenticated" ON agenda_events
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Consignes
CREATE TABLE IF NOT EXISTS consignes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  priority TEXT DEFAULT 'normal',
  target_role TEXT DEFAULT 'all',
  status TEXT DEFAULT 'active',
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consignes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consignes_read_authenticated" ON consignes
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "consignes_manage_admin" ON consignes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Fonds de caisse
CREATE TABLE IF NOT EXISTS cash_register (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'in',
  category TEXT DEFAULT 'vente',
  description TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cash_register ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cash_register_authenticated" ON cash_register
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Objets trouvés
CREATE TABLE IF NOT EXISTS lost_found (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'stored',
  found_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lost_found ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lost_found_authenticated" ON lost_found
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Objets prêtés
CREATE TABLE IF NOT EXISTS lent_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  room TEXT,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'lent',
  lent_by UUID NOT NULL REFERENCES auth.users(id),
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lent_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lent_items_authenticated" ON lent_items
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Contrôles qualités
CREATE TABLE IF NOT EXISTS quality_controls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  notes TEXT,
  category TEXT DEFAULT 'general',
  inspector_id UUID NOT NULL REFERENCES auth.users(id),
  inspector_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quality_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quality_controls_authenticated" ON quality_controls
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Contrats
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT,
  type TEXT DEFAULT 'service',
  start_date DATE,
  end_date DATE,
  amount NUMERIC,
  status TEXT DEFAULT 'active',
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts_own" ON contracts
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "contracts_admin_read" ON contracts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

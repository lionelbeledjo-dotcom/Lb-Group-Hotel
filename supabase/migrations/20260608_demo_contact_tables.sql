-- Table des demandes de démo
CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  rooms TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut soumettre une demande (pas besoin d'être connecté)
CREATE POLICY "demo_requests_insert_public" ON demo_requests
  FOR INSERT WITH CHECK (true);

-- Seul le staff peut lire les demandes
CREATE POLICY "demo_requests_read_staff" ON demo_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Table des messages contact
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_insert_public" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_read_staff" ON contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Mise à jour du statut par le staff
CREATE POLICY "contact_messages_update_staff" ON contact_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "demo_requests_update_staff" ON demo_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

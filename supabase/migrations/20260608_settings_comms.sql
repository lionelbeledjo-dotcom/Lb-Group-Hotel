-- Table des paramètres de l'établissement
CREATE TABLE IF NOT EXISTS hotel_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL DEFAULT 'Mon établissement',
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  checkin_time TEXT DEFAULT '14:00',
  checkout_time TEXT DEFAULT '11:00',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hotel_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hotel_settings_own" ON hotel_settings
  FOR ALL USING (owner_id = auth.uid());

-- Table des messages internes (communication persistante)
CREATE TABLE IF NOT EXISTS internal_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'message',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "internal_messages_read_authenticated" ON internal_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "internal_messages_insert_authenticated" ON internal_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Table des annonces
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_read_authenticated" ON announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "announcements_insert_staff" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

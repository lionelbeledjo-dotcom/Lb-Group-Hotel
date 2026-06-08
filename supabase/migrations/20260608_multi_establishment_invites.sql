-- Support multi-établissement : chaque hotel_settings = un établissement
-- Ajout d'un champ pour identifier l'établissement actif de l'utilisateur
ALTER TABLE hotel_settings ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Table pour gérer les membres par établissement
CREATE TABLE IF NOT EXISTS establishment_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES hotel_settings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'receptionist',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(establishment_id, user_id)
);

ALTER TABLE establishment_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "establishment_members_read" ON establishment_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM establishment_members em
      WHERE em.establishment_id = establishment_members.establishment_id
      AND em.user_id = auth.uid()
      AND em.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "establishment_members_manage" ON establishment_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hotel_settings hs
      WHERE hs.id = establishment_members.establishment_id
      AND hs.owner_id = auth.uid()
    )
  );

-- Table des invitations staff
CREATE TABLE IF NOT EXISTS staff_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES hotel_settings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'receptionist',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '7 days'
);

ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_invitations_owner" ON staff_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM hotel_settings hs
      WHERE hs.id = staff_invitations.establishment_id
      AND hs.owner_id = auth.uid()
    )
  );

-- L'invité peut lire son invitation par email
CREATE POLICY "staff_invitations_read_own" ON staff_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

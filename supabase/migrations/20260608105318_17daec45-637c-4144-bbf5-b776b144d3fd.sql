
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'receptionist', 'housekeeper', 'maintenance');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read all auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles insert self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles read self" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

-- Auto-create profile + first user becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_first BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;
  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'receptionist');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Rooms
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'cleaning', 'maintenance', 'reserved');
CREATE TYPE public.room_category AS ENUM ('standard', 'deluxe', 'suite', 'apartment');

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  floor INT NOT NULL DEFAULT 0,
  category public.room_category NOT NULL DEFAULT 'standard',
  price_per_night NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.room_status NOT NULL DEFAULT 'available',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms read all auth" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "rooms admin write" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "rooms admin update" ON public.rooms FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'receptionist'));
CREATE POLICY "rooms admin delete" ON public.rooms FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reservations
CREATE TYPE public.reservation_status AS ENUM ('confirmed','checked_in','checked_out','cancelled','no_show');

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_id_document TEXT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status public.reservation_status NOT NULL DEFAULT 'confirmed',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations read auth" ON public.reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "reservations write staff" ON public.reservations FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "reservations update staff" ON public.reservations FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "reservations delete admin" ON public.reservations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER reservations_updated BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Housekeeping
CREATE TYPE public.task_status AS ENUM ('pending','in_progress','done','inspected');

CREATE TABLE public.housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  status public.task_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  quality_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.housekeeping_tasks TO authenticated;
GRANT ALL ON public.housekeeping_tasks TO service_role;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hk read auth" ON public.housekeeping_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "hk write staff" ON public.housekeeping_tasks FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "hk update staff" ON public.housekeeping_tasks FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "hk delete admin" ON public.housekeeping_tasks FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER hk_updated BEFORE UPDATE ON public.housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Maintenance
CREATE TYPE public.priority_level AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','resolved');

CREATE TABLE public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority public.priority_level NOT NULL DEFAULT 'medium',
  status public.ticket_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_tickets TO authenticated;
GRANT ALL ON public.maintenance_tickets TO service_role;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt read auth" ON public.maintenance_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "mt write auth" ON public.maintenance_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "mt update staff" ON public.maintenance_tickets FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "mt delete admin" ON public.maintenance_tickets FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER mt_updated BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Guest requests
CREATE TYPE public.request_status AS ENUM ('new','in_progress','done','cancelled');

CREATE TABLE public.guest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT,
  status public.request_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_requests TO authenticated;
GRANT ALL ON public.guest_requests TO service_role;
ALTER TABLE public.guest_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gr read auth" ON public.guest_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "gr write auth" ON public.guest_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "gr update staff" ON public.guest_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "gr delete admin" ON public.guest_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER gr_updated BEFORE UPDATE ON public.guest_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Invoices
CREATE TYPE public.payment_status AS ENUM ('pending','paid','refunded','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash','card','mobile_money','bank_transfer');

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.payment_status NOT NULL DEFAULT 'pending',
  method public.payment_method,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv read auth" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "inv write staff" ON public.invoices FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "inv update staff" ON public.invoices FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "inv delete admin" ON public.invoices FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER inv_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

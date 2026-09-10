CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS cal_event_type_id INTEGER,
  ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS services_cal_event_type_unique_idx
  ON public.services(cal_event_type_id)
  WHERE cal_event_type_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS services_slug_unique_idx
  ON public.services(slug)
  WHERE slug IS NOT NULL;

ALTER TABLE public.pre_reservations
  ADD COLUMN IF NOT EXISTS cal_booking_uid TEXT,
  ADD COLUMN IF NOT EXISTS cal_status TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS pre_reservations_cal_booking_uid_unique_idx
  ON public.pre_reservations(cal_booking_uid)
  WHERE cal_booking_uid IS NOT NULL;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cal_booking_uid TEXT,
  ADD COLUMN IF NOT EXISTS cal_status TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_cal_booking_uid_unique_idx
  ON public.bookings(cal_booking_uid)
  WHERE cal_booking_uid IS NOT NULL;

ALTER TABLE public.webhook_events DROP CONSTRAINT IF EXISTS webhook_events_provider_check;
ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_provider_check CHECK (provider IN ('mercadopago', 'calcom')),
  ADD COLUMN IF NOT EXISTS delivery_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.webhook_events DROP CONSTRAINT IF EXISTS webhook_events_status_check;
ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_status_check CHECK (status IN ('received', 'processing', 'processed', 'failed'));

UPDATE public.webhook_events
SET status = 'processed', updated_at = COALESCE(processed_at, updated_at)
WHERE processed_at IS NOT NULL AND status <> 'processed';

DROP INDEX IF EXISTS public.payments_mp_payment_unique_idx;
CREATE UNIQUE INDEX payments_mp_payment_unique_idx
  ON public.payments(mercado_pago_payment_id);

CREATE INDEX IF NOT EXISTS webhook_events_retry_idx
  ON public.webhook_events(status, next_attempt_at)
  WHERE status = 'failed';

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  site_name TEXT NOT NULL DEFAULT 'Jessica Quiróz',
  hero_eyebrow TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  hero_quote TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  contact_schedule TEXT,
  contact_location_note TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  person_role TEXT NOT NULL DEFAULT 'Paciente',
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  closing_text TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((status = 'draft') OR (published_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS public.seo_pages (
  path TEXT PRIMARY KEY CHECK (path LIKE '/%'),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  indexable BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagekit_file_id TEXT NOT NULL UNIQUE,
  imagekit_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_key TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  before_data JSONB,
  after_data JSONB,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_revisions_record_idx
  ON public.content_revisions(table_name, record_key, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_role_rank(role_name TEXT)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE role_name WHEN 'owner' THEN 20 WHEN 'editor' THEN 10 ELSE 0 END;
$$;

CREATE OR REPLACE FUNCTION public.is_site_admin(required_role TEXT DEFAULT 'editor')
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles AS profile
    WHERE profile.user_id = auth.uid()
      AND profile.active = TRUE
      AND public.admin_role_rank(profile.role) >= public.admin_role_rank(required_role)
  );
$$;

REVOKE ALL ON FUNCTION public.is_site_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_site_admin(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_content_revision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  source JSONB;
  key_value TEXT;
BEGIN
  source := CASE WHEN TG_OP = 'DELETE' THEN TO_JSONB(OLD) ELSE TO_JSONB(NEW) END;
  key_value := COALESCE(source ->> 'id', source ->> 'path', 'unknown');
  INSERT INTO public.content_revisions(table_name, record_key, action, before_data, after_data, actor_user_id)
  VALUES (
    TG_TABLE_NAME,
    key_value,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN TO_JSONB(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN TO_JSONB(NEW) END,
    auth.uid()
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_webhook_event(
  p_provider TEXT,
  p_event_key TEXT,
  p_delivery_id TEXT,
  p_payload JSONB
)
RETURNS TABLE(id UUID, should_process BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  claimed_id UUID;
BEGIN
  INSERT INTO public.webhook_events(
    provider, event_key, delivery_id, raw_payload, status, attempts, updated_at
  ) VALUES (
    p_provider, p_event_key, p_delivery_id, COALESCE(p_payload, '{}'::JSONB), 'processing', 1, NOW()
  )
  ON CONFLICT (provider, event_key) DO UPDATE
    SET status = 'processing',
        attempts = public.webhook_events.attempts + 1,
        last_error = NULL,
        next_attempt_at = NULL,
        updated_at = NOW()
    WHERE public.webhook_events.status = 'failed'
       OR (public.webhook_events.status = 'processing' AND public.webhook_events.updated_at < NOW() - INTERVAL '5 minutes')
  RETURNING public.webhook_events.id INTO claimed_id;

  IF claimed_id IS NULL THEN
    SELECT event.id INTO claimed_id
    FROM public.webhook_events AS event
    WHERE event.provider = p_provider AND event.event_key = p_event_key;
    RETURN QUERY SELECT claimed_id, FALSE;
  ELSE
    RETURN QUERY SELECT claimed_id, TRUE;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_webhook_event(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_webhook_event(TEXT, TEXT, TEXT, JSONB) TO project_admin;

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'admin_profiles', 'site_settings', 'site_sections', 'timeline_items', 'courses',
    'notions', 'experiences', 'treatments', 'testimonials', 'reflections', 'legal_pages', 'seo_pages'
  ] LOOP
    EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON public.%I', target_table || '_set_updated_at', target_table);
    EXECUTE FORMAT('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', target_table || '_set_updated_at', target_table);
  END LOOP;
END;
$$;

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'site_settings', 'site_sections', 'timeline_items', 'courses', 'notions',
    'experiences', 'treatments', 'testimonials', 'reflections', 'legal_pages', 'seo_pages'
  ] LOOP
    EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON public.%I', target_table || '_revision', target_table);
    EXECUTE FORMAT('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.record_content_revision()', target_table || '_revision', target_table);
  END LOOP;
END;
$$;

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'services', 'availability_rules', 'blackout_dates', 'pre_reservations', 'reservation_images',
    'payments', 'bookings', 'calendar_events', 'webhook_events', 'audit_logs', 'admin_profiles',
    'site_settings', 'site_sections', 'timeline_items', 'courses', 'notions', 'experiences',
    'treatments', 'testimonials', 'reflections', 'legal_pages', 'seo_pages', 'media_assets', 'content_revisions'
  ] LOOP
    EXECUTE FORMAT('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);
  END LOOP;
END;
$$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treatments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT SELECT ON public.pre_reservations, public.reservation_images, public.payments, public.bookings, public.webhook_events, public.audit_logs, public.content_revisions TO authenticated;
GRANT UPDATE ON public.pre_reservations, public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_profiles TO authenticated;

CREATE POLICY admin_profiles_read_self_or_owner ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_site_admin('owner'));

CREATE POLICY admin_profiles_owner_insert ON public.admin_profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin('owner'));

CREATE POLICY admin_profiles_owner_update ON public.admin_profiles
  FOR UPDATE TO authenticated
  USING (public.is_site_admin('owner'))
  WITH CHECK (public.is_site_admin('owner'));

CREATE POLICY admin_profiles_owner_delete ON public.admin_profiles
  FOR DELETE TO authenticated
  USING (public.is_site_admin('owner'));

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'services', 'site_settings', 'site_sections', 'timeline_items', 'courses', 'notions',
    'experiences', 'treatments', 'testimonials', 'reflections', 'legal_pages', 'seo_pages', 'media_assets'
  ] LOOP
    EXECUTE FORMAT('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_site_admin())', target_table || '_admin_select', target_table);
    EXECUTE FORMAT('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_site_admin())', target_table || '_admin_insert', target_table);
    EXECUTE FORMAT('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_site_admin()) WITH CHECK (public.is_site_admin())', target_table || '_admin_update', target_table);
    EXECUTE FORMAT('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_site_admin())', target_table || '_admin_delete', target_table);
  END LOOP;
END;
$$;

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'pre_reservations', 'reservation_images', 'payments', 'bookings', 'webhook_events', 'audit_logs', 'content_revisions'
  ] LOOP
    EXECUTE FORMAT('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_site_admin())', target_table || '_admin_select', target_table);
  END LOOP;
END;
$$;

CREATE POLICY pre_reservations_admin_update ON public.pre_reservations
  FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

CREATE POLICY bookings_admin_update ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.reys_services
  ADD COLUMN IF NOT EXISTS cal_event_type_id INTEGER,
  ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS reys_services_cal_event_type_unique_idx
  ON public.reys_services(cal_event_type_id)
  WHERE cal_event_type_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reys_services_slug_unique_idx
  ON public.reys_services(slug)
  WHERE slug IS NOT NULL;

ALTER TABLE public.reys_pre_reservations
  ADD COLUMN IF NOT EXISTS cal_booking_uid TEXT,
  ADD COLUMN IF NOT EXISTS cal_status TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS reys_pre_reservations_cal_booking_uid_unique_idx
  ON public.reys_pre_reservations(cal_booking_uid)
  WHERE cal_booking_uid IS NOT NULL;

ALTER TABLE public.reys_bookings
  ADD COLUMN IF NOT EXISTS cal_booking_uid TEXT,
  ADD COLUMN IF NOT EXISTS cal_status TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS reys_bookings_cal_booking_uid_unique_idx
  ON public.reys_bookings(cal_booking_uid)
  WHERE cal_booking_uid IS NOT NULL;

ALTER TABLE public.reys_webhook_events DROP CONSTRAINT IF EXISTS reys_webhook_events_provider_check;
ALTER TABLE public.reys_webhook_events
  ADD CONSTRAINT reys_webhook_events_provider_check CHECK (provider IN ('mercadopago', 'calcom')),
  ADD COLUMN IF NOT EXISTS delivery_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.reys_webhook_events DROP CONSTRAINT IF EXISTS reys_webhook_events_status_check;
ALTER TABLE public.reys_webhook_events
  ADD CONSTRAINT reys_webhook_events_status_check CHECK (status IN ('received', 'processing', 'processed', 'failed'));

UPDATE public.reys_webhook_events
SET status = 'processed', updated_at = COALESCE(processed_at, updated_at)
WHERE processed_at IS NOT NULL AND status <> 'processed';

DROP INDEX IF EXISTS public.reys_payments_mp_payment_unique_idx;
CREATE UNIQUE INDEX reys_payments_mp_payment_unique_idx
  ON public.reys_payments(mercado_pago_payment_id);

CREATE INDEX IF NOT EXISTS reys_webhook_events_retry_idx
  ON public.reys_webhook_events(status, next_attempt_at)
  WHERE status = 'failed';

CREATE TABLE IF NOT EXISTS public.reys_admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reys_site_settings (
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

CREATE TABLE IF NOT EXISTS public.reys_site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reys_timeline_items (
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

CREATE TABLE IF NOT EXISTS public.reys_courses (
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

CREATE TABLE IF NOT EXISTS public.reys_notions (
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

CREATE TABLE IF NOT EXISTS public.reys_experiences (
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

CREATE TABLE IF NOT EXISTS public.reys_treatments (
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

CREATE TABLE IF NOT EXISTS public.reys_testimonials (
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

CREATE TABLE IF NOT EXISTS public.reys_reflections (
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

CREATE TABLE IF NOT EXISTS public.reys_legal_pages (
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

CREATE TABLE IF NOT EXISTS public.reys_seo_pages (
  path TEXT PRIMARY KEY CHECK (path LIKE '/%'),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  indexable BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reys_media_assets (
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

CREATE TABLE IF NOT EXISTS public.reys_content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_key TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  before_data JSONB,
  after_data JSONB,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reys_content_revisions_record_idx
  ON public.reys_content_revisions(table_name, record_key, created_at DESC);

/*
 * Historial de la implementación original basada en funciones SQL.
 * DieGui Dev 2.0.2 rechaza CREATE FUNCTION en public con FORBIDDEN, por lo que
 * este bloque no se ejecuta. La migración siguiente implementa la variante
 * compatible mediante políticas y triggers directos, y el BFF registra las
 * revisiones de contenido y reclama webhooks sin RPC personalizada.
 *

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.reys_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  buffer_before_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_before_minutes >= 0),
  buffer_after_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_after_minutes >= 0),
  price_amount NUMERIC(12, 2) NOT NULL CHECK (price_amount > 0),
  currency CHAR(3) NOT NULL DEFAULT 'CLP',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reys_availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Santiago',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS public.reys_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (starts_at < ends_at)
);

CREATE TABLE IF NOT EXISTS public.reys_pre_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.reys_services(id) ON DELETE RESTRICT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_notes TEXT,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Santiago',
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'awaiting_payment', 'paid_pending_calendar', 'confirmed', 'expired', 'cancelled', 'manual_review')
  ),
  expires_at TIMESTAMPTZ NOT NULL,
  customer_token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (starts_at < ends_at)
);

CREATE TABLE IF NOT EXISTS public.reys_reservation_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_reservation_id UUID NOT NULL REFERENCES public.reys_pre_reservations(id) ON DELETE CASCADE,
  imagekit_file_id TEXT NOT NULL,
  imagekit_path TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  width INTEGER,
  height INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reys_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_reservation_id UUID NOT NULL REFERENCES public.reys_pre_reservations(id) ON DELETE CASCADE,
  mercado_pago_preference_id TEXT,
  mercado_pago_payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('created', 'pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'CLP',
  init_point TEXT,
  sandbox_init_point TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reys_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_reservation_id UUID NOT NULL UNIQUE REFERENCES public.reys_pre_reservations(id) ON DELETE RESTRICT,
  payment_id UUID NOT NULL REFERENCES public.reys_payments(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES public.reys_services(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Santiago',
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'rescheduled', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (starts_at < ends_at)
);

CREATE TABLE IF NOT EXISTS public.reys_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.reys_bookings(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  html_link TEXT,
  meet_link TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reys_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('mercadopago')),
  event_key TEXT NOT NULL,
  processed_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_key)
);

CREATE TABLE IF NOT EXISTS public.reys_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reys_services_active_idx ON public.reys_services(active);
CREATE INDEX IF NOT EXISTS reys_availability_rules_day_active_idx ON public.reys_availability_rules(day_of_week, active);
CREATE INDEX IF NOT EXISTS reys_blackout_dates_range_idx ON public.reys_blackout_dates(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS reys_pre_reservations_status_range_idx ON public.reys_pre_reservations(status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS reys_pre_reservations_expires_idx ON public.reys_pre_reservations(expires_at);
CREATE INDEX IF NOT EXISTS reys_reservation_images_pre_reservation_idx ON public.reys_reservation_images(pre_reservation_id, status);
CREATE INDEX IF NOT EXISTS reys_payments_pre_reservation_idx ON public.reys_payments(pre_reservation_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS reys_payments_preference_unique_idx ON public.reys_payments(mercado_pago_preference_id) WHERE mercado_pago_preference_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS reys_payments_mp_payment_unique_idx ON public.reys_payments(mercado_pago_payment_id) WHERE mercado_pago_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reys_bookings_range_status_idx ON public.reys_bookings(starts_at, ends_at, status);
CREATE INDEX IF NOT EXISTS reys_audit_logs_created_at_idx ON public.reys_audit_logs(created_at DESC);

DROP TRIGGER IF EXISTS reys_services_updated_at ON public.reys_services;
CREATE TRIGGER reys_services_updated_at
  BEFORE UPDATE ON public.reys_services
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_availability_rules_updated_at ON public.reys_availability_rules;
CREATE TRIGGER reys_availability_rules_updated_at
  BEFORE UPDATE ON public.reys_availability_rules
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_blackout_dates_updated_at ON public.reys_blackout_dates;
CREATE TRIGGER reys_blackout_dates_updated_at
  BEFORE UPDATE ON public.reys_blackout_dates
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_pre_reservations_updated_at ON public.reys_pre_reservations;
CREATE TRIGGER reys_pre_reservations_updated_at
  BEFORE UPDATE ON public.reys_pre_reservations
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_reservation_images_updated_at ON public.reys_reservation_images;
CREATE TRIGGER reys_reservation_images_updated_at
  BEFORE UPDATE ON public.reys_reservation_images
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_payments_updated_at ON public.reys_payments;
CREATE TRIGGER reys_payments_updated_at
  BEFORE UPDATE ON public.reys_payments
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_bookings_updated_at ON public.reys_bookings;
CREATE TRIGGER reys_bookings_updated_at
  BEFORE UPDATE ON public.reys_bookings
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_calendar_events_updated_at ON public.reys_calendar_events;
CREATE TRIGGER reys_calendar_events_updated_at
  BEFORE UPDATE ON public.reys_calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

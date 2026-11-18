-- Run as the database owner. Set the login password separately.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'reys_app') THEN
    CREATE ROLE reys_app NOLOGIN;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE neondb TO reys_app;
GRANT USAGE ON SCHEMA public TO reys_app;
GRANT SELECT ON public.reys_admin_profiles, public.reys_bookings, public.reys_content_revisions,
  public.reys_courses, public.reys_experiences, public.reys_notions, public.reys_payments,
  public.reys_pre_reservations, public.reys_reflections, public.reys_reservation_images,
  public.reys_services, public.reys_site_settings, public.reys_testimonials,
  public.reys_timeline_items, public.reys_treatments, public.reys_webhook_events TO reys_app;
GRANT INSERT ON public.reys_admin_profiles, public.reys_bookings, public.reys_content_revisions,
  public.reys_payments, public.reys_pre_reservations, public.reys_reservation_images,
  public.reys_services, public.reys_site_settings, public.reys_webhook_events TO reys_app;
GRANT UPDATE ON public.reys_bookings, public.reys_payments, public.reys_pre_reservations,
  public.reys_services, public.reys_site_settings, public.reys_webhook_events TO reys_app;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'reys_admin_profiles', 'reys_bookings', 'reys_content_revisions', 'reys_courses',
    'reys_experiences', 'reys_notions', 'reys_payments', 'reys_pre_reservations',
    'reys_reflections', 'reys_reservation_images', 'reys_services', 'reys_site_settings',
    'reys_testimonials', 'reys_timeline_items', 'reys_treatments', 'reys_webhook_events'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = table_name
        AND policyname = 'reys_app_access'
    ) THEN
      EXECUTE format('CREATE POLICY reys_app_access ON public.%I TO reys_app USING (true) WITH CHECK (true)', table_name);
    END IF;
  END LOOP;
END
$$;

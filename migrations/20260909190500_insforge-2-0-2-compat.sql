-- Compatibilidad para DieGui Dev 2.0.2: esta versión bloquea CREATE FUNCTION
-- en public. Se usan únicamente triggers administrados por InsForge y políticas
-- directas; el BFF implementa la revisión de contenido y el claim de webhooks.

DROP TRIGGER IF EXISTS reys_webhook_events_set_updated_at ON public.reys_webhook_events;
CREATE TRIGGER reys_webhook_events_set_updated_at
  BEFORE UPDATE ON public.reys_webhook_events
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_admin_profiles_set_updated_at ON public.reys_admin_profiles;
CREATE TRIGGER reys_admin_profiles_set_updated_at
  BEFORE UPDATE ON public.reys_admin_profiles
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_site_settings_set_updated_at ON public.reys_site_settings;
CREATE TRIGGER reys_site_settings_set_updated_at
  BEFORE UPDATE ON public.reys_site_settings
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_site_sections_set_updated_at ON public.reys_site_sections;
CREATE TRIGGER reys_site_sections_set_updated_at
  BEFORE UPDATE ON public.reys_site_sections
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_timeline_items_set_updated_at ON public.reys_timeline_items;
CREATE TRIGGER reys_timeline_items_set_updated_at
  BEFORE UPDATE ON public.reys_timeline_items
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_courses_set_updated_at ON public.reys_courses;
CREATE TRIGGER reys_courses_set_updated_at
  BEFORE UPDATE ON public.reys_courses
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_notions_set_updated_at ON public.reys_notions;
CREATE TRIGGER reys_notions_set_updated_at
  BEFORE UPDATE ON public.reys_notions
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_experiences_set_updated_at ON public.reys_experiences;
CREATE TRIGGER reys_experiences_set_updated_at
  BEFORE UPDATE ON public.reys_experiences
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_treatments_set_updated_at ON public.reys_treatments;
CREATE TRIGGER reys_treatments_set_updated_at
  BEFORE UPDATE ON public.reys_treatments
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_testimonials_set_updated_at ON public.reys_testimonials;
CREATE TRIGGER reys_testimonials_set_updated_at
  BEFORE UPDATE ON public.reys_testimonials
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_reflections_set_updated_at ON public.reys_reflections;
CREATE TRIGGER reys_reflections_set_updated_at
  BEFORE UPDATE ON public.reys_reflections
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_legal_pages_set_updated_at ON public.reys_legal_pages;
CREATE TRIGGER reys_legal_pages_set_updated_at
  BEFORE UPDATE ON public.reys_legal_pages
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS reys_seo_pages_set_updated_at ON public.reys_seo_pages;
CREATE TRIGGER reys_seo_pages_set_updated_at
  BEFORE UPDATE ON public.reys_seo_pages
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE public.reys_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_pre_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_reservation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_notions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reys_content_revisions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.reys_services,
  public.reys_availability_rules,
  public.reys_blackout_dates,
  public.reys_pre_reservations,
  public.reys_reservation_images,
  public.reys_payments,
  public.reys_bookings,
  public.reys_calendar_events,
  public.reys_webhook_events,
  public.reys_audit_logs,
  public.reys_admin_profiles,
  public.reys_site_settings,
  public.reys_site_sections,
  public.reys_timeline_items,
  public.reys_courses,
  public.reys_notions,
  public.reys_experiences,
  public.reys_treatments,
  public.reys_testimonials,
  public.reys_reflections,
  public.reys_legal_pages,
  public.reys_seo_pages,
  public.reys_media_assets,
  public.reys_content_revisions
FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.reys_services,
  public.reys_site_settings,
  public.reys_site_sections,
  public.reys_timeline_items,
  public.reys_courses,
  public.reys_notions,
  public.reys_experiences,
  public.reys_treatments,
  public.reys_testimonials,
  public.reys_reflections,
  public.reys_legal_pages,
  public.reys_seo_pages,
  public.reys_media_assets
TO authenticated;

GRANT SELECT ON TABLE public.reys_admin_profiles TO authenticated;
GRANT SELECT ON TABLE
  public.reys_pre_reservations,
  public.reys_reservation_images,
  public.reys_payments,
  public.reys_bookings,
  public.reys_webhook_events,
  public.reys_audit_logs,
  public.reys_content_revisions
TO authenticated;
GRANT UPDATE ON TABLE public.reys_pre_reservations, public.reys_bookings TO authenticated;

DROP POLICY IF EXISTS reys_admin_profiles_read_self ON public.reys_admin_profiles;
CREATE POLICY reys_admin_profiles_read_self ON public.reys_admin_profiles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS reys_services_admin_all ON public.reys_services;
CREATE POLICY reys_services_admin_all ON public.reys_services
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_site_settings_admin_all ON public.reys_site_settings;
CREATE POLICY reys_site_settings_admin_all ON public.reys_site_settings
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_site_sections_admin_all ON public.reys_site_sections;
CREATE POLICY reys_site_sections_admin_all ON public.reys_site_sections
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_timeline_items_admin_all ON public.reys_timeline_items;
CREATE POLICY reys_timeline_items_admin_all ON public.reys_timeline_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_courses_admin_all ON public.reys_courses;
CREATE POLICY reys_courses_admin_all ON public.reys_courses
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_notions_admin_all ON public.reys_notions;
CREATE POLICY reys_notions_admin_all ON public.reys_notions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_experiences_admin_all ON public.reys_experiences;
CREATE POLICY reys_experiences_admin_all ON public.reys_experiences
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_treatments_admin_all ON public.reys_treatments;
CREATE POLICY reys_treatments_admin_all ON public.reys_treatments
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_testimonials_admin_all ON public.reys_testimonials;
CREATE POLICY reys_testimonials_admin_all ON public.reys_testimonials
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_reflections_admin_all ON public.reys_reflections;
CREATE POLICY reys_reflections_admin_all ON public.reys_reflections
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_legal_pages_admin_all ON public.reys_legal_pages;
CREATE POLICY reys_legal_pages_admin_all ON public.reys_legal_pages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_seo_pages_admin_all ON public.reys_seo_pages;
CREATE POLICY reys_seo_pages_admin_all ON public.reys_seo_pages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_media_assets_admin_all ON public.reys_media_assets;
CREATE POLICY reys_media_assets_admin_all ON public.reys_media_assets
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_pre_reservations_admin_select ON public.reys_pre_reservations;
CREATE POLICY reys_pre_reservations_admin_select ON public.reys_pre_reservations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_reservation_images_admin_select ON public.reys_reservation_images;
CREATE POLICY reys_reservation_images_admin_select ON public.reys_reservation_images
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_payments_admin_select ON public.reys_payments;
CREATE POLICY reys_payments_admin_select ON public.reys_payments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_bookings_admin_select ON public.reys_bookings;
CREATE POLICY reys_bookings_admin_select ON public.reys_bookings
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_webhook_events_admin_select ON public.reys_webhook_events;
CREATE POLICY reys_webhook_events_admin_select ON public.reys_webhook_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_audit_logs_admin_select ON public.reys_audit_logs;
CREATE POLICY reys_audit_logs_admin_select ON public.reys_audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_content_revisions_admin_select ON public.reys_content_revisions;
CREATE POLICY reys_content_revisions_admin_select ON public.reys_content_revisions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_pre_reservations_admin_update ON public.reys_pre_reservations;
CREATE POLICY reys_pre_reservations_admin_update ON public.reys_pre_reservations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

DROP POLICY IF EXISTS reys_bookings_admin_update ON public.reys_bookings;
CREATE POLICY reys_bookings_admin_update ON public.reys_bookings
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reys_admin_profiles AS profile
    WHERE profile.user_id = (SELECT auth.uid()) AND profile.active = TRUE
  ));

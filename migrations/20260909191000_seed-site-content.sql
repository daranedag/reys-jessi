INSERT INTO public.site_settings(
  id, site_name, hero_eyebrow, hero_title, hero_description, hero_quote, hero_image_url,
  contact_schedule, contact_location_note
) VALUES (
  'main',
  'Jessica Quiróz',
  'Sanación energética & rejuvenecimiento',
  'Rejuvenece desde tu interior y refleja tu equilibrio en el exterior.',
  'Acompañamiento holístico para armonizar cuerpo, mente y espíritu. Terapias alternativas, rituales de bienestar y técnicas faciales que potencian tu brillo natural.',
  'La belleza auténtica nace de la paz interior.',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
  'Atención presencial · 09:00 - 17:00 hrs.',
  'Dirección informada al confirmar la reserva'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.timeline_items(slug, badge, title, description, sort_order) VALUES
  ('inicio', 'Inicio', 'Primeros pasos', 'Comienzo de un recorrido personal y profesional ligado al bienestar integral.', 10),
  ('estudios', 'Formación', 'Estudios terapéuticos', 'Aprendizajes en técnicas energéticas, cuidado corporal y rejuvenecimiento.', 20),
  ('consulta', 'Actualidad', 'Sesiones personalizadas', 'Acompañamiento individual para procesos de armonización, cuidado y transformación.', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.courses(slug, badge, title, description, sort_order) VALUES
  ('energia', 'Energía', 'Sanación energética', 'Prácticas de armonización para acompañar procesos emocionales y corporales.', 10),
  ('facial', 'Facial', 'Rejuvenecimiento consciente', 'Técnicas faciales y corporales integradas con respiración y presencia.', 20),
  ('rituales', 'Bienestar', 'Rituales terapéuticos', 'Herramientas para sostener calma, claridad y autocuidado entre sesiones.', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.notions(slug, title, description, sort_order) VALUES
  ('escucha', 'Escucha profunda', 'Cada sesión parte desde una mirada cuidadosa del momento actual de la persona.', 10),
  ('cuerpo', 'Cuerpo presente', 'El trabajo corporal se integra como una vía concreta para liberar tensión.', 20),
  ('equilibrio', 'Equilibrio energético', 'La práctica busca ordenar, suavizar y acompañar el bienestar desde adentro.', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.experiences(slug, badge, title, description, sort_order) VALUES
  ('vocacion', 'Inicio', 'Vocación de acompañamiento', 'Un camino enfocado en escuchar procesos personales con respeto, calma y presencia.', 10),
  ('formacion', 'Formación', 'Aprendizaje continuo', 'Estudios y talleres orientados a integrar bienestar emocional, corporal y energético.', 20),
  ('practica', 'Hoy', 'Práctica holística', 'Sesiones personalizadas que combinan cuidado externo y equilibrio interior.', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.treatments(slug, title, description, image_url, sort_order) VALUES
  ('lifting', 'Lifting facial consciente', 'Masaje y drenaje linfático para tonificar y relajar.', 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=900&q=80', 10),
  ('armonia', 'Armonización corporal', 'Liberación de tensiones y equilibrio energético del cuerpo.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80', 20),
  ('regeneracion', 'Ritual de regeneración', 'Sesiones combinadas de energía, respiración y cuidado facial.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.testimonials(slug, title, description, person_role, sort_order) VALUES
  ('maria', 'María', 'Sentí una calma profunda y un cambio visible en mi rostro después de la sesión.', 'Paciente', 10),
  ('paula', 'Paula', 'El acompañamiento fue respetuoso, cercano y muy cuidadoso con mi proceso.', 'Paciente', 20),
  ('carolina', 'Carolina', 'Me ayudó a reconectar con mi cuerpo desde un lugar más amable.', 'Paciente', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.reflections(slug, badge, title, description, closing_text, sort_order) VALUES
  ('calma', 'Calma', 'Respirar también es volver', 'Un instante de pausa puede abrir espacio donde antes había ruido.', 'Tu cuerpo sabe bajar el ritmo cuando encuentra un lugar seguro.', 10),
  ('presencia', 'Presencia', 'Habitar el presente', 'La transformación suele comenzar cuando dejamos de apurarnos.', 'No todo proceso necesita fuerza; algunos necesitan ternura.', 20),
  ('cuidado', 'Cuidado', 'Belleza que nace adentro', 'El brillo exterior se sostiene mejor cuando hay paz interior.', 'Cuidarte también es una forma de escucharte.', 30)
ON CONFLICT (slug) DO NOTHING;

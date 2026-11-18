UPDATE public.reys_site_settings
SET
  hero_eyebrow = 'Rejuvenecimiento facial · Santiago de Chile',
  hero_title = 'Tu rostro también cuenta la historia de lo vivido.',
  hero_description = 'Soy Jessica Quiróz. Mi camino de servicio comenzó hace más de dos décadas y hoy integra trabajo corporal, escucha y distintas disciplinas de bienestar. Mi enfoque facial nace de observar cómo el tiempo y las experiencias se expresan en el rostro.',
  hero_quote = 'Desde muy niña tengo la certeza de que no hay nada imposible.',
  contact_location_note = 'Atención presencial en Santiago de Chile; dirección informada al confirmar la reserva'
WHERE id = 'main';

UPDATE public.reys_timeline_items
SET
  badge = 'Hace más de 20 años',
  title = 'Servicio y trabajo corporal',
  description = 'Comenzó estudiando masaje de relajación y descontracturante, herramientas que llevó al voluntariado con personas mayores. Después sumó reflexología y podología.'
WHERE slug = 'inicio';

UPDATE public.reys_timeline_items
SET
  badge = '2011–2012',
  title = 'Un cambio de rumbo',
  description = 'Inició Derecho con el deseo de defender a otras personas. Un proceso personal de salud la llevó a pausar esa carrera y a explorar formas de acompañar antes de que una dificultad se transforme en crisis.'
WHERE slug = 'estudios';

UPDATE public.reys_timeline_items
SET
  badge = 'Últimos 12–15 años',
  title = 'Integración y rejuvenecimiento',
  description = 'Profundizó en terapias complementarias y en la observación del rostro, integrando experiencia personal, aprendizaje continuo y una mirada consciente del rejuvenecimiento.'
WHERE slug = 'consulta';

UPDATE public.reys_courses
SET
  badge = 'Cuerpo',
  title = 'Masoterapia y bienestar corporal',
  description = 'Formación en masaje de relajación y descontracturante, reflexología, podología y Ayurveda.'
WHERE slug = 'energia';

UPDATE public.reys_courses
SET
  badge = 'Energía',
  title = 'Terapias energéticas',
  description = 'Estudios en Sanación Reconectiva, La Reconexión, biomagnetismo y Terapia de Respuesta Espiritual.'
WHERE slug = 'facial';

UPDATE public.reys_courses
SET
  badge = 'Lectura integral',
  title = 'Sistemas de autoconocimiento',
  description = 'Numerología, quiromancia y quirología; astrología tropical y védica; cosmobiología, morfología, Nueva Medicina Germánica, biodescodificación, proyecto sentido, trabajo transgeneracional y constelaciones.'
WHERE slug = 'rituales';

UPDATE public.reys_notions
SET
  title = 'El rostro guarda lo vivido',
  description = 'Desde esta mirada, los cambios faciales no responden solo al paso del tiempo: también pueden acompañar las emociones, los desafíos y los aprendizajes de cada etapa.'
WHERE slug = 'escucha';

UPDATE public.reys_notions
SET
  title = 'Escucha antes que recetas',
  description = 'Cada persona necesita un acompañamiento propio, menos mecánico y más atento a su historia, su cuerpo y su momento.'
WHERE slug = 'cuerpo';

UPDATE public.reys_notions
SET
  title = 'Ayudar antes de la crisis',
  description = 'Su vocación se orienta a ofrecer herramientas y contención antes de que las dificultades se vuelvan más profundas.'
WHERE slug = 'equilibrio';

UPDATE public.reys_experiences
SET
  badge = 'Servicio',
  title = 'Voluntariado con personas mayores',
  description = 'El masaje, la reflexología y la podología fueron sus primeras herramientas para servir en hogares de personas mayores y aprender desde el contacto humano.'
WHERE slug = 'vocacion';

UPDATE public.reys_experiences
SET
  badge = 'Transformación',
  title = 'De la dificultad al aprendizaje',
  description = 'Las experiencias personales y de salud impulsaron una búsqueda que convirtió el dolor en autoconocimiento y luego en una forma de acompañar a otras personas.'
WHERE slug = 'formacion';

UPDATE public.reys_experiences
SET
  badge = 'Intuición',
  title = 'Una escucha que va más allá de las palabras',
  description = 'A lo largo de su práctica, Jessica ha aprendido a atender gestos, sensaciones y señales sutiles para ofrecer una presencia cercana y personalizada.'
WHERE slug = 'practica';

UPDATE public.reys_treatments
SET
  title = 'El rostro como mapa de experiencias',
  description = 'Una mirada que reconoce la huella del tiempo, las emociones y las situaciones vividas, sin reducir el proceso a la apariencia.'
WHERE slug = 'lifting';

UPDATE public.reys_treatments
SET
  title = 'Rejuvenecimiento desde la experiencia',
  description = 'Jessica aplica en otras personas un trabajo que también ha explorado en su propio rostro a lo largo de los años.'
WHERE slug = 'armonia';

UPDATE public.reys_treatments
SET
  title = 'Un proceso personal y posible',
  description = 'El rejuvenecimiento se propone como una elección abierta a quien quiera cuidar su rostro, recuperar vitalidad y avanzar sin darse por vencida.'
WHERE slug = 'regeneracion';

UPDATE public.reys_testimonials
SET
  title = 'Jessica Quiróz',
  description = 'Desde muy niña tengo la certeza de que no hay nada imposible.',
  person_role = 'Convicción'
WHERE slug = 'maria';

UPDATE public.reys_testimonials
SET
  title = 'Jessica Quiróz',
  description = 'Comprendí que podía ayudar a las personas antes de que llegaran a una situación difícil.',
  person_role = 'Vocación'
WHERE slug = 'paula';

UPDATE public.reys_testimonials
SET
  title = 'Jessica Quiróz',
  description = 'Rejuvenecer es para todas las personas que quieran vivir este proceso.',
  person_role = 'Invitación'
WHERE slug = 'carolina';

UPDATE public.reys_reflections
SET
  badge = 'Persistencia',
  title = 'No darse por vencida',
  description = 'Hay etapas que parecen imposibles de atravesar, especialmente cuando el dolor ocupa toda la mirada.',
  closing_text = 'Con el tiempo, también pueden convertirse en aprendizaje.'
WHERE slug = 'calma';

UPDATE public.reys_reflections
SET
  badge = 'Conciencia',
  title = 'Agradecer lo vivido',
  description = 'Mirar el pasado con otra conciencia permite reconocer lo que cada experiencia dejó y cómo transformó el camino.',
  closing_text = 'Lo vivido puede abrir una nueva manera de cuidarte y acompañar.'
WHERE slug = 'presencia';

UPDATE public.reys_reflections
SET
  badge = 'Servicio',
  title = 'Acompañar a tiempo',
  description = 'Ayudar no siempre empieza cuando el problema ya está instalado; también puede comenzar mucho antes.',
  closing_text = 'A veces una escucha presente cambia el rumbo antes de la crisis.'
WHERE slug = 'cuidado';

UPDATE public.reys_courses
SET description = 'Estudios en Sanación Reconectiva, La Reconexión, biomagnetismo, Terapia de Respuesta Espiritual y Sanación Pránica; en esta última también se desempeñó como instructora de nivel básico.'
WHERE slug = 'facial';

-- El único servicio registrado era una prueba con duración y valor ficticios.
-- Se oculta hasta contar con los datos comerciales y la agenda confirmados.
UPDATE public.reys_services
SET active = FALSE
WHERE name = 'Servicio Prueba 1';

import type { SiteContent } from "@/lib/domain";

export const defaultContent: SiteContent = {
  hero: {
    eyebrow: "Rejuvenecimiento facial · Santiago de Chile",
    title: "Tu rostro también cuenta la historia de lo vivido.",
    description:
      "Soy Jessica Quiróz. Mi camino de servicio comenzó hace más de dos décadas y hoy integra trabajo corporal, escucha y distintas disciplinas de bienestar. Mi enfoque facial nace de observar cómo el tiempo y las experiencias se expresan en el rostro.",
    quote: "Desde muy niña tengo la certeza de que no hay nada imposible.",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85",
  },
  timeline: [
    {
      id: "inicio",
      badge: "Hace más de 20 años",
      title: "Servicio y trabajo corporal",
      description:
        "Comenzó estudiando masaje de relajación y descontracturante, herramientas que llevó al voluntariado con personas mayores. Después sumó reflexología y podología.",
    },
    {
      id: "estudios",
      badge: "2011–2012",
      title: "Un cambio de rumbo",
      description:
        "Inició Derecho con el deseo de defender a otras personas. Un proceso personal de salud la llevó a pausar esa carrera y a explorar formas de acompañar antes de que una dificultad se transforme en crisis.",
    },
    {
      id: "consulta",
      badge: "Últimos 12–15 años",
      title: "Integración y rejuvenecimiento",
      description:
        "Profundizó en terapias complementarias y en la observación del rostro, integrando experiencia personal, aprendizaje continuo y una mirada consciente del rejuvenecimiento.",
    },
  ],
  training: [
    {
      id: "energia",
      badge: "Cuerpo",
      title: "Masoterapia y bienestar corporal",
      description:
        "Formación en masaje de relajación y descontracturante, reflexología, podología y Ayurveda.",
    },
    {
      id: "facial",
      badge: "Energía",
      title: "Terapias energéticas",
      description:
        "Estudios en Sanación Reconectiva, La Reconexión, biomagnetismo, Terapia de Respuesta Espiritual y Sanación Pránica; en esta última también se desempeñó como instructora de nivel básico.",
    },
    {
      id: "rituales",
      badge: "Lectura integral",
      title: "Sistemas de autoconocimiento",
      description:
        "Numerología, quiromancia y quirología; astrología tropical y védica; cosmobiología, morfología, Nueva Medicina Germánica, biodescodificación, proyecto sentido, trabajo transgeneracional y constelaciones.",
    },
  ],
  notions: [
    {
      id: "escucha",
      title: "El rostro guarda lo vivido",
      description:
        "Desde esta mirada, los cambios faciales no responden solo al paso del tiempo: también pueden acompañar las emociones, los desafíos y los aprendizajes de cada etapa.",
    },
    {
      id: "cuerpo",
      title: "Escucha antes que recetas",
      description:
        "Cada persona necesita un acompañamiento propio, menos mecánico y más atento a su historia, su cuerpo y su momento.",
    },
    {
      id: "equilibrio",
      title: "Ayudar antes de la crisis",
      description:
        "Su vocación se orienta a ofrecer herramientas y contención antes de que las dificultades se vuelvan más profundas.",
    },
  ],
  experiences: [
    {
      id: "vocacion",
      badge: "Servicio",
      title: "Voluntariado con personas mayores",
      description:
        "El masaje, la reflexología y la podología fueron sus primeras herramientas para servir en hogares de personas mayores y aprender desde el contacto humano.",
    },
    {
      id: "formacion",
      badge: "Transformación",
      title: "De la dificultad al aprendizaje",
      description:
        "Las experiencias personales y de salud impulsaron una búsqueda que convirtió el dolor en autoconocimiento y luego en una forma de acompañar a otras personas.",
    },
    {
      id: "practica",
      badge: "Intuición",
      title: "Una escucha que va más allá de las palabras",
      description:
        "A lo largo de su práctica, Jessica ha aprendido a atender gestos, sensaciones y señales sutiles para ofrecer una presencia cercana y personalizada.",
    },
  ],
  treatments: [
    {
      id: "lifting",
      title: "El rostro como mapa de experiencias",
      description:
        "Una mirada que reconoce la huella del tiempo, las emociones y las situaciones vividas, sin reducir el proceso a la apariencia.",
      imageUrl:
        "https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "armonia",
      title: "Rejuvenecimiento desde la experiencia",
      description:
        "Jessica aplica en otras personas un trabajo que también ha explorado en su propio rostro a lo largo de los años.",
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "regeneracion",
      title: "Un proceso personal y posible",
      description:
        "El rejuvenecimiento se propone como una elección abierta a quien quiera cuidar su rostro, recuperar vitalidad y avanzar sin darse por vencida.",
      imageUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    },
  ],
  testimonials: [
    {
      id: "maria",
      title: "Jessica Quiróz",
      description: "Desde muy niña tengo la certeza de que no hay nada imposible.",
      personRole: "Convicción",
    },
    {
      id: "paula",
      title: "Jessica Quiróz",
      description:
        "Comprendí que podía ayudar a las personas antes de que llegaran a una situación difícil.",
      personRole: "Vocación",
    },
    {
      id: "carolina",
      title: "Jessica Quiróz",
      description: "Rejuvenecer es para todas las personas que quieran vivir este proceso.",
      personRole: "Invitación",
    },
  ],
  reflections: [
    {
      id: "calma",
      badge: "Persistencia",
      title: "No darse por vencida",
      description:
        "Hay etapas que parecen imposibles de atravesar, especialmente cuando el dolor ocupa toda la mirada.",
      closing: "Con el tiempo, también pueden convertirse en aprendizaje.",
    },
    {
      id: "presencia",
      badge: "Conciencia",
      title: "Agradecer lo vivido",
      description:
        "Mirar el pasado con otra conciencia permite reconocer lo que cada experiencia dejó y cómo transformó el camino.",
      closing: "Lo vivido puede abrir una nueva manera de cuidarte y acompañar.",
    },
    {
      id: "cuidado",
      badge: "Servicio",
      title: "Acompañar a tiempo",
      description:
        "Ayudar no siempre empieza cuando el problema ya está instalado; también puede comenzar mucho antes.",
      closing: "A veces una escucha presente cambia el rumbo antes de la crisis.",
    },
  ],
};

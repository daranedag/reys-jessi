import type { SiteContent } from "@/lib/domain";

export const defaultContent: SiteContent = {
  hero: {
    eyebrow: "Sanación energética & rejuvenecimiento",
    title: "Rejuvenece desde tu interior y refleja tu equilibrio en el exterior.",
    description:
      "Acompañamiento holístico para armonizar cuerpo, mente y espíritu. Terapias alternativas, rituales de bienestar y técnicas faciales que potencian tu brillo natural.",
    quote: "La belleza auténtica nace de la paz interior.",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85",
  },
  timeline: [
    {
      id: "inicio",
      badge: "Inicio",
      title: "Primeros pasos",
      description: "Comienzo de un recorrido personal y profesional ligado al bienestar integral.",
    },
    {
      id: "estudios",
      badge: "Formación",
      title: "Estudios terapéuticos",
      description: "Aprendizajes en técnicas energéticas, cuidado corporal y rejuvenecimiento.",
    },
    {
      id: "consulta",
      badge: "Actualidad",
      title: "Sesiones personalizadas",
      description: "Acompañamiento individual para procesos de armonización, cuidado y transformación.",
    },
  ],
  training: [
    {
      id: "energia",
      badge: "Energía",
      title: "Sanación energética",
      description: "Prácticas de armonización para acompañar procesos emocionales y corporales.",
    },
    {
      id: "facial",
      badge: "Facial",
      title: "Rejuvenecimiento consciente",
      description: "Técnicas faciales y corporales integradas con respiración y presencia.",
    },
    {
      id: "rituales",
      badge: "Bienestar",
      title: "Rituales terapéuticos",
      description: "Herramientas para sostener calma, claridad y autocuidado entre sesiones.",
    },
  ],
  notions: [
    {
      id: "escucha",
      title: "Escucha profunda",
      description: "Cada sesión parte desde una mirada cuidadosa del momento actual de la persona.",
    },
    {
      id: "cuerpo",
      title: "Cuerpo presente",
      description: "El trabajo corporal se integra como una vía concreta para liberar tensión.",
    },
    {
      id: "equilibrio",
      title: "Equilibrio energético",
      description: "La práctica busca ordenar, suavizar y acompañar el bienestar desde adentro.",
    },
  ],
  experiences: [
    {
      id: "vocacion",
      badge: "Inicio",
      title: "Vocación de acompañamiento",
      description: "Un camino enfocado en escuchar procesos personales con respeto, calma y presencia.",
    },
    {
      id: "formacion",
      badge: "Formación",
      title: "Aprendizaje continuo",
      description: "Estudios y talleres orientados a integrar bienestar emocional, corporal y energético.",
    },
    {
      id: "practica",
      badge: "Hoy",
      title: "Práctica holística",
      description: "Sesiones personalizadas que combinan cuidado externo y equilibrio interior.",
    },
  ],
  treatments: [
    {
      id: "lifting",
      title: "Lifting facial consciente",
      description: "Masaje y drenaje linfático para tonificar y relajar.",
      imageUrl:
        "https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "armonia",
      title: "Armonización corporal",
      description: "Liberación de tensiones y equilibrio energético del cuerpo.",
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "regeneracion",
      title: "Ritual de regeneración",
      description: "Sesiones combinadas de energía, respiración y cuidado facial.",
      imageUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    },
  ],
  testimonials: [
    {
      id: "maria",
      title: "María",
      description: "Sentí una calma profunda y un cambio visible en mi rostro después de la sesión.",
      personRole: "Paciente",
    },
    {
      id: "paula",
      title: "Paula",
      description: "El acompañamiento fue respetuoso, cercano y muy cuidadoso con mi proceso.",
      personRole: "Paciente",
    },
    {
      id: "carolina",
      title: "Carolina",
      description: "Me ayudó a reconectar con mi cuerpo desde un lugar más amable.",
      personRole: "Paciente",
    },
  ],
  reflections: [
    {
      id: "calma",
      badge: "Calma",
      title: "Respirar también es volver",
      description: "Un instante de pausa puede abrir espacio donde antes había ruido.",
      closing: "Tu cuerpo sabe bajar el ritmo cuando encuentra un lugar seguro.",
    },
    {
      id: "presencia",
      badge: "Presencia",
      title: "Habitar el presente",
      description: "La transformación suele comenzar cuando dejamos de apurarnos.",
      closing: "No todo proceso necesita fuerza; algunos necesitan ternura.",
    },
    {
      id: "cuidado",
      badge: "Cuidado",
      title: "Belleza que nace adentro",
      description: "El brillo exterior se sostiene mejor cuando hay paz interior.",
      closing: "Cuidarte también es una forma de escucharte.",
    },
  ],
};

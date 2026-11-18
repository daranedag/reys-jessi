import "server-only";
import { defaultContent } from "@/lib/content/defaults";
import type { ContentCard, SiteContent } from "@/lib/domain";
import { env } from "@/lib/env";
import { sql } from "@/lib/db";

type Row = Record<string, unknown>;
type HeroSettings = {
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_quote: string;
  hero_image_url: string;
};

const stringValue = (value: unknown, fallback?: string) =>
  typeof value === "string" && value.trim() ? value : (fallback ?? "");

const toCard = (row: Row, fallback: ContentCard): ContentCard => ({
  id: stringValue(row.slug ?? row.id, fallback.id),
  eyebrow: stringValue(row.eyebrow, fallback.eyebrow),
  title: stringValue(row.title, fallback.title),
  description: stringValue(row.description ?? row.body, fallback.description),
  imageUrl: stringValue(row.image_url, fallback.imageUrl),
  badge: stringValue(row.badge ?? row.period ?? row.category, fallback.badge),
});

export async function getHeroSettings() {
  const [settings] = await sql<HeroSettings>`
    SELECT hero_eyebrow, hero_title, hero_description, hero_quote, hero_image_url
    FROM public.reys_site_settings WHERE id = 'main'
  `;
  return settings;
}

function mergeCards(rows: Row[], fallback: ContentCard[]) {
  if (!rows.length) return fallback;
  return rows.map((row, index) => toCard(row, fallback[index] ?? fallback[0]));
}

export async function getPublicContent(): Promise<SiteContent> {
  if (!env.databaseUrl) return defaultContent;

  try {
    const [settings, timeline, training, notions, experiences, treatments, testimonials, reflections] =
      await Promise.all([
        getHeroSettings(),
        sql`SELECT * FROM public.reys_timeline_items WHERE published ORDER BY sort_order`,
        sql`SELECT * FROM public.reys_courses WHERE published ORDER BY sort_order`,
        sql`SELECT * FROM public.reys_notions WHERE published ORDER BY sort_order`,
        sql`SELECT * FROM public.reys_experiences WHERE published ORDER BY sort_order`,
        sql`SELECT * FROM public.reys_treatments WHERE published ORDER BY sort_order`,
        sql`SELECT * FROM public.reys_testimonials WHERE published ORDER BY sort_order`,
        sql`SELECT * FROM public.reys_reflections WHERE published ORDER BY sort_order`,
      ]);

    return {
      hero: {
        eyebrow: stringValue(settings?.hero_eyebrow, defaultContent.hero.eyebrow),
        title: stringValue(settings?.hero_title, defaultContent.hero.title),
        description: stringValue(settings?.hero_description, defaultContent.hero.description),
        quote: stringValue(settings?.hero_quote, defaultContent.hero.quote),
        imageUrl: stringValue(settings?.hero_image_url, defaultContent.hero.imageUrl),
      },
      timeline: mergeCards(timeline, defaultContent.timeline),
      training: mergeCards(training, defaultContent.training),
      notions: mergeCards(notions, defaultContent.notions),
      experiences: mergeCards(experiences, defaultContent.experiences),
      treatments: mergeCards(treatments, defaultContent.treatments),
      testimonials: testimonials.length
        ? testimonials.map((row, index) => ({
            ...toCard(row, defaultContent.testimonials[index] ?? defaultContent.testimonials[0]),
            personRole: stringValue(row.person_role, "Paciente"),
          }))
        : defaultContent.testimonials,
      reflections: reflections.length
        ? reflections.map((row, index) => ({
            ...toCard(row, defaultContent.reflections[index] ?? defaultContent.reflections[0]),
            closing: stringValue(row.closing_text, defaultContent.reflections[index]?.closing),
          }))
        : defaultContent.reflections,
    };
  } catch (error) {
    console.error("No se pudo cargar el contenido de Neon; se usa el contenido local.", error);
    return defaultContent;
  }
}

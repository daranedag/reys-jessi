import "server-only";
import { defaultContent } from "@/lib/content/defaults";
import type { ContentCard, SiteContent } from "@/lib/domain";
import { isInsforgeAdminConfigured } from "@/lib/env";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";

type Row = Record<string, unknown>;
type AdminClient = ReturnType<typeof createInsforgeAdminClient>;

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

async function loadRows(client: AdminClient, table: string): Promise<Row[]> {
  const { data, error } = await client.database.from(table).select().eq("published", true).order("sort_order");
  if (error) throw error;
  return (data ?? []) as Row[];
}

function mergeCards(rows: Row[], fallback: ContentCard[]) {
  if (!rows.length) return fallback;
  return rows.map((row, index) => toCard(row, fallback[index] ?? fallback[0]));
}

export async function getPublicContent(): Promise<SiteContent> {
  if (!isInsforgeAdminConfigured()) return defaultContent;

  try {
    const client = createInsforgeAdminClient();
    const [settingsResult, timeline, training, notions, experiences, treatments, testimonials, reflections] =
      await Promise.all([
        client.database.from("site_settings").select().eq("id", "main").maybeSingle(),
        loadRows(client, "timeline_items"),
        loadRows(client, "courses"),
        loadRows(client, "notions"),
        loadRows(client, "experiences"),
        loadRows(client, "treatments"),
        loadRows(client, "testimonials"),
        loadRows(client, "reflections"),
      ]);

    if (settingsResult.error) throw settingsResult.error;
    const settings = (settingsResult.data ?? {}) as Row;

    return {
      hero: {
        eyebrow: stringValue(settings.hero_eyebrow, defaultContent.hero.eyebrow),
        title: stringValue(settings.hero_title, defaultContent.hero.title),
        description: stringValue(settings.hero_description, defaultContent.hero.description),
        quote: stringValue(settings.hero_quote, defaultContent.hero.quote),
        imageUrl: stringValue(settings.hero_image_url, defaultContent.hero.imageUrl),
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
    console.error("No se pudo cargar el contenido de InsForge; se usa el contenido migrado.", error);
    return defaultContent;
  }
}

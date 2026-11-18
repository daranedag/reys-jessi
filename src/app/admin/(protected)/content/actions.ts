"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { sql } from "@/lib/db";

const heroSchema = z.object({
  heroEyebrow: z.string().trim().min(2).max(120),
  heroTitle: z.string().trim().min(5).max(220),
  heroDescription: z.string().trim().min(10).max(800),
  heroQuote: z.string().trim().min(2).max(220),
  heroImageUrl: z.string().url(),
});

export async function saveHeroAction(formData: FormData) {
  const session = await requireAdminSession();
  const values = heroSchema.parse({
    heroEyebrow: formData.get("heroEyebrow"),
    heroTitle: formData.get("heroTitle"),
    heroDescription: formData.get("heroDescription"),
    heroQuote: formData.get("heroQuote"),
    heroImageUrl: formData.get("heroImageUrl"),
  });
  await sql`
    WITH previous AS MATERIALIZED (
      SELECT * FROM public.reys_site_settings WHERE id = 'main' FOR UPDATE
    ), saved AS (
      INSERT INTO public.reys_site_settings
        (id, hero_eyebrow, hero_title, hero_description, hero_quote, hero_image_url, updated_by)
      SELECT 'main', ${values.heroEyebrow}, ${values.heroTitle}, ${values.heroDescription},
             ${values.heroQuote}, ${values.heroImageUrl}, ${session.user.id}
      FROM (SELECT count(*) FROM previous) AS locked WHERE true
      ON CONFLICT (id) DO UPDATE SET hero_eyebrow = EXCLUDED.hero_eyebrow,
        hero_title = EXCLUDED.hero_title, hero_description = EXCLUDED.hero_description,
        hero_quote = EXCLUDED.hero_quote, hero_image_url = EXCLUDED.hero_image_url, updated_by = EXCLUDED.updated_by
      RETURNING *
    )
    INSERT INTO public.reys_content_revisions
      (table_name, record_key, action, before_data, after_data, actor_user_id)
    SELECT 'reys_site_settings', saved.id, CASE WHEN previous.id IS NULL THEN 'INSERT' ELSE 'UPDATE' END,
           to_jsonb(previous), to_jsonb(saved), ${session.user.id}
    FROM saved LEFT JOIN previous USING (id)
  `;

  revalidatePath("/");
  revalidatePath("/admin/content");
}

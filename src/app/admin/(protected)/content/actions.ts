"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { createInsforgeServerClient } from "@/lib/insforge/server";

const heroSchema = z.object({
  heroEyebrow: z.string().trim().min(2).max(120),
  heroTitle: z.string().trim().min(5).max(220),
  heroDescription: z.string().trim().min(10).max(800),
  heroQuote: z.string().trim().min(2).max(220),
  heroImageUrl: z.string().url(),
});

export async function saveHeroAction(formData: FormData) {
  await requireAdminSession();
  const values = heroSchema.parse({
    heroEyebrow: formData.get("heroEyebrow"),
    heroTitle: formData.get("heroTitle"),
    heroDescription: formData.get("heroDescription"),
    heroQuote: formData.get("heroQuote"),
    heroImageUrl: formData.get("heroImageUrl"),
  });
  const client = await createInsforgeServerClient();
  const { error } = await client.database.from("site_settings").upsert([{
    id: "main",
    hero_eyebrow: values.heroEyebrow,
    hero_title: values.heroTitle,
    hero_description: values.heroDescription,
    hero_quote: values.heroQuote,
    hero_image_url: values.heroImageUrl,
    updated_at: new Date().toISOString(),
  }]);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/content");
}

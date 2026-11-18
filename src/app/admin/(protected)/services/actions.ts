"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { sql } from "@/lib/db";

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(600),
  duration: z.coerce.number().int().min(15).max(480),
  price: z.coerce.number().positive(),
  calEventTypeId: z.coerce.number().int().positive(),
});

export async function saveServiceAction(formData: FormData) {
  await requireAdminSession();
  const rawId = String(formData.get("id") ?? "");
  const values = serviceSchema.parse({
    id: rawId || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    price: formData.get("price"),
    calEventTypeId: formData.get("calEventTypeId"),
  });
  const { id, name, description, duration, price, calEventTypeId } = values;
  if (id) {
    await sql`UPDATE public.reys_services SET name = ${name}, description = ${description || null},
      duration_minutes = ${duration}, price_amount = ${price}, currency = 'CLP',
      cal_event_type_id = ${calEventTypeId}, active = true WHERE id = ${id}`;
  } else {
    await sql`INSERT INTO public.reys_services
      (name, description, duration_minutes, price_amount, cal_event_type_id)
      VALUES (${name}, ${description || null}, ${duration}, ${price}, ${calEventTypeId})`;
  }
  revalidatePath("/");
  revalidatePath("/admin/services");
}

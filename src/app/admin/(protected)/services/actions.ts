"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { createInsforgeServerClient } from "@/lib/insforge/server";

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
  const client = await createInsforgeServerClient();
  const row = {
    name: values.name,
    description: values.description || null,
    duration_minutes: values.duration,
    price_amount: values.price,
    currency: "CLP",
    cal_event_type_id: values.calEventTypeId,
    active: true,
    updated_at: new Date().toISOString(),
  };
  const query = values.id
    ? client.database.from("services").update(row).eq("id", values.id)
    : client.database.from("services").insert([row]);
  const { error } = await query;
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/services");
}

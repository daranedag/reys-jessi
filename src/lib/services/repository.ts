import "server-only";
import type { Service } from "@/lib/domain";
import { isInsforgeAdminConfigured } from "@/lib/env";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";

export async function getActiveServices(): Promise<Service[]> {
  if (!isInsforgeAdminConfigured()) return [];

  const client = createInsforgeAdminClient();
  const { data, error } = await client.database
    .from("services")
    .select("id,name,description,duration_minutes,price_amount,currency,active,cal_event_type_id")
    .eq("active", true)
    .order("name");

  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getService(serviceId: string): Promise<Service | null> {
  if (!isInsforgeAdminConfigured()) return null;

  const client = createInsforgeAdminClient();
  const { data, error } = await client.database
    .from("services")
    .select("id,name,description,duration_minutes,price_amount,currency,active,cal_event_type_id")
    .eq("id", serviceId)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return (data as Service | null) ?? null;
}

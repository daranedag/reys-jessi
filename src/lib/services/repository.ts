import "server-only";
import { sql } from "@/lib/db";
import type { Service } from "@/lib/domain";
import { env } from "@/lib/env";

export async function getServices(activeOnly = true): Promise<Service[]> {
  if (!env.databaseUrl) return [];
  return sql<Service>`
    SELECT id, name, description, duration_minutes, price_amount::float8, currency,
           active, cal_event_type_id::float8
    FROM public.reys_services WHERE (${activeOnly} = false OR active) ORDER BY name
  `;
}

export function getActiveServices() {
  return getServices();
}

export async function getService(serviceId: string, activeOnly = true): Promise<Service | null> {
  if (!env.databaseUrl) return null;
  const [service] = await sql<Service>`
    SELECT id, name, description, duration_minutes, price_amount::float8, currency,
           active, cal_event_type_id::float8
    FROM public.reys_services WHERE id = ${serviceId} AND (${activeOnly} = false OR active)
  `;
  return service ?? null;
}

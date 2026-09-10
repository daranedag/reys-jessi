import "server-only";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";

type Claim = { id: string; should_process: boolean };

export async function claimWebhook(input: {
  provider: "mercadopago" | "calcom";
  eventKey: string;
  deliveryId?: string | null;
  payload: unknown;
}) {
  const client = createInsforgeAdminClient();
  const { data, error } = await client.database.rpc("claim_webhook_event", {
    p_provider: input.provider,
    p_event_key: input.eventKey,
    p_delivery_id: input.deliveryId ?? null,
    p_payload: input.payload,
  });
  if (error) throw error;
  const claim = (Array.isArray(data) ? data[0] : data) as Claim | undefined;
  return claim?.should_process ? claim.id : null;
}

export async function completeWebhook(eventId: string) {
  const { error } = await createInsforgeAdminClient().database.from("webhook_events").update({
    status: "processed",
    processed_at: new Date().toISOString(),
    last_error: null,
    updated_at: new Date().toISOString(),
  }).eq("id", eventId);
  if (error) throw error;
}

export async function failWebhook(eventId: string, error: unknown) {
  const message = error instanceof Error ? error.message.slice(0, 2000) : "Error desconocido";
  await createInsforgeAdminClient().database.from("webhook_events").update({
    status: "failed",
    last_error: message,
    next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", eventId);
}

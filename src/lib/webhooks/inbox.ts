import "server-only";
import { sql } from "@/lib/db";

export async function claimWebhook(input: {
  provider: "mercadopago" | "calcom";
  eventKey: string;
  deliveryId?: string | null;
  payload: unknown;
}) {
  const [event] = await sql<{ id: string }>`
    INSERT INTO public.reys_webhook_events AS event
      (provider, event_key, delivery_id, raw_payload, status, attempts)
    VALUES (${input.provider}, ${input.eventKey}, ${input.deliveryId ?? null},
            ${JSON.stringify(input.payload)}::jsonb, 'processing', 1)
    ON CONFLICT (provider, event_key) DO UPDATE SET status = 'processing',
      attempts = event.attempts + 1, last_error = NULL, next_attempt_at = NULL
    WHERE event.status = 'failed' OR (event.status = 'processing' AND event.updated_at < now() - interval '5 minutes')
    RETURNING id
  `;
  return event?.id ?? null;
}

export async function completeWebhook(eventId: string) {
  await sql`UPDATE public.reys_webhook_events SET status = 'processed', processed_at = now(), last_error = NULL WHERE id = ${eventId}`;
}

export async function failWebhook(eventId: string, error: unknown) {
  const message = error instanceof Error ? error.message.slice(0, 2000) : "Error desconocido";
  try {
    await sql`UPDATE public.reys_webhook_events SET status = 'failed', last_error = ${message},
      next_attempt_at = now() + interval '5 minutes' WHERE id = ${eventId}`;
  } catch (writeError) {
    console.error("No se pudo guardar el fallo del webhook.", writeError);
  }
}

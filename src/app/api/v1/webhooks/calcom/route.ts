import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { env, requireValue } from "@/lib/env";
import { sql } from "@/lib/db";
import { claimWebhook, completeWebhook, failWebhook } from "@/lib/webhooks/inbox";
import { verifyCalSignature } from "@/lib/webhooks/signatures";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export async function POST(request: Request) {
  let eventId: string | null = null;
  try {
    const rawBody = await request.text();
    verifyCalSignature(rawBody, request.headers.get("x-cal-signature-256"), requireValue(env.calWebhookSecret, "CAL_WEBHOOK_SECRET"));
    const body = record(JSON.parse(rawBody));
    const type = String(body.triggerEvent ?? body.type ?? "UNKNOWN");
    const payload = record(body.payload ?? body.data);
    const bookingUid = String(payload.uid ?? payload.bookingUid ?? "");
    if (!bookingUid) throw new ApiError(400, "missing_booking_uid", "La notificación de Cal.com no incluye la reserva.");
    const fingerprint = createHash("sha256").update(rawBody).digest("hex");
    eventId = await claimWebhook({ provider: "calcom", eventKey: `${type}:${bookingUid}:${fingerprint}`, payload: body });
    if (!eventId) return NextResponse.json({ ok: true, duplicate: true });

    const [reservation] = await sql<{ id: string }>`SELECT id FROM public.reys_pre_reservations WHERE cal_booking_uid = ${bookingUid}`;
    if (!reservation) {
      await completeWebhook(eventId);
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (["BOOKING_CANCELLED", "BOOKING_REJECTED"].includes(type)) {
      await sql`WITH reservation AS (
        UPDATE public.reys_pre_reservations SET status = 'cancelled', cal_status = 'cancelled'
        WHERE id = ${reservation.id} RETURNING id
      )
      UPDATE public.reys_bookings SET status = 'cancelled', cal_status = 'cancelled'
      WHERE pre_reservation_id IN (SELECT id FROM reservation)`;
    } else if (type === "BOOKING_RESCHEDULED") {
      const nextUid = String(payload.rescheduledToUid ?? payload.uid ?? bookingUid);
      const status = typeof payload.status === "string" ? payload.status : "accepted";
      const start = payload.startTime ?? payload.start ?? null;
      const end = payload.endTime ?? payload.end ?? null;
      await sql`WITH reservation AS (
        UPDATE public.reys_pre_reservations SET cal_booking_uid = ${nextUid}, cal_status = ${status},
          starts_at = coalesce(${start}::timestamptz, starts_at),
          ends_at = coalesce(${end}::timestamptz, ends_at)
        WHERE id = ${reservation.id} RETURNING id, cal_booking_uid, cal_status, starts_at, ends_at
      )
      UPDATE public.reys_bookings AS booking SET status = 'rescheduled',
        cal_booking_uid = reservation.cal_booking_uid, cal_status = reservation.cal_status,
        starts_at = reservation.starts_at, ends_at = reservation.ends_at
      FROM reservation WHERE booking.pre_reservation_id = reservation.id`;
    }

    await completeWebhook(eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (eventId) await failWebhook(eventId, error);
    return apiErrorResponse(error);
  }
}

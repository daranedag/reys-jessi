import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { env, requireValue } from "@/lib/env";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";
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

    const client = createInsforgeAdminClient();
    const { data: reservation, error } = await client.database.from("pre_reservations").select().eq("cal_booking_uid", bookingUid).maybeSingle();
    if (error) throw error;
    if (!reservation) {
      await completeWebhook(eventId);
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (["BOOKING_CANCELLED", "BOOKING_REJECTED"].includes(type)) {
      await Promise.all([
        client.database.from("pre_reservations").update({ status: "cancelled", cal_status: "cancelled", updated_at: new Date().toISOString() }).eq("id", reservation.id),
        client.database.from("bookings").update({ status: "cancelled", cal_status: "cancelled", updated_at: new Date().toISOString() }).eq("pre_reservation_id", reservation.id),
      ]);
    } else if (type === "BOOKING_RESCHEDULED") {
      const nextUid = String(payload.rescheduledToUid ?? payload.uid ?? bookingUid);
      const patch = { cal_booking_uid: nextUid, cal_status: payload.status ?? "accepted", starts_at: payload.startTime ?? payload.start, ends_at: payload.endTime ?? payload.end, updated_at: new Date().toISOString() };
      await Promise.all([
        client.database.from("pre_reservations").update(patch).eq("id", reservation.id),
        client.database.from("bookings").update({ ...patch, status: "rescheduled" }).eq("pre_reservation_id", reservation.id),
      ]);
    }

    await completeWebhook(eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (eventId) await failWebhook(eventId, error);
    return apiErrorResponse(error);
  }
}

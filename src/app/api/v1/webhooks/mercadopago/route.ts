import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { cancelCalBooking, confirmCalBooking } from "@/lib/calcom/client";
import { env, requireValue } from "@/lib/env";
import { sql } from "@/lib/db";
import { getMercadoPagoPayment } from "@/lib/mercadopago/client";
import { getPreReservation } from "@/lib/reservations/repository";
import { getService } from "@/lib/services/repository";
import { claimWebhook, completeWebhook, failWebhook } from "@/lib/webhooks/inbox";
import { verifyMercadoPagoSignature } from "@/lib/webhooks/signatures";

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function localPaymentStatus(status: string) {
  if (status === "approved") return "approved";
  if (["rejected", "cancelled", "refunded"].includes(status)) return status;
  return "pending";
}

export async function POST(request: NextRequest) {
  let eventId: string | null = null;
  try {
    const rawBody = await request.text();
    const body = record(JSON.parse(rawBody));
    const bodyData = record(body.data);
    const dataId = text(request.nextUrl.searchParams.get("data.id") ?? bodyData.id ?? body.id);
    if (!dataId) throw new ApiError(400, "missing_payment_id", "La notificación no incluye el pago.");
    const requestId = request.headers.get("x-request-id");
    verifyMercadoPagoSignature({
      signature: request.headers.get("x-signature"),
      requestId,
      dataId,
      secret: requireValue(env.mercadoPagoWebhookSecret, "MERCADOPAGO_WEBHOOK_SECRET"),
    });

    const action = text(body.action ?? body.type ?? request.nextUrl.searchParams.get("type")) || "payment";
    const deliveryFingerprint = requestId ?? createHash("sha256").update(rawBody).digest("hex");
    eventId = await claimWebhook({
      provider: "mercadopago",
      eventKey: `${action}:${dataId}:${deliveryFingerprint}`,
      deliveryId: requestId,
      payload: body,
    });
    if (!eventId) return NextResponse.json({ ok: true, duplicate: true });
    if (dataId === "123456" && action === "payment") {
      await completeWebhook(eventId);
      return NextResponse.json({ ok: true, test: true });
    }

    const remote = await getMercadoPagoPayment(dataId);
    const preReservationId = remote.external_reference;
    if (!preReservationId) throw new ApiError(400, "missing_external_reference", "El pago no está asociado a una reserva.");
    const reservation = await getPreReservation(preReservationId);
    const service = await getService(reservation.service_id, false);
    if (!service) throw new ApiError(404, "service_not_found", "No encontramos el servicio de la reserva.");

    const status = localPaymentStatus(remote.status ?? "pending");
    const amountMatches = Number(remote.transaction_amount) === Number(service.price_amount);
    const currencyMatches = remote.currency_id === service.currency;
    const [payment] = await sql<{ id: string }>`
      INSERT INTO public.reys_payments
        (pre_reservation_id, mercado_pago_payment_id, status, amount, currency, raw_payload)
      VALUES (${reservation.id}, ${dataId}, ${amountMatches && currencyMatches ? status : "pending"},
              ${Number(remote.transaction_amount ?? 0)}, ${remote.currency_id ?? "CLP"}, ${JSON.stringify(remote)}::jsonb)
      ON CONFLICT (mercado_pago_payment_id) DO UPDATE SET
        pre_reservation_id = EXCLUDED.pre_reservation_id, status = EXCLUDED.status,
        amount = EXCLUDED.amount, currency = EXCLUDED.currency, raw_payload = EXCLUDED.raw_payload
      RETURNING id
    `;

    if (!amountMatches || !currencyMatches) {
      await sql`UPDATE public.reys_pre_reservations SET status = 'manual_review' WHERE id = ${reservation.id}`;
      throw new ApiError(409, "payment_mismatch", "El monto o la moneda del pago no coinciden.");
    }

    if (status === "approved") {
      if (!reservation.cal_booking_uid) throw new ApiError(409, "missing_cal_booking", "La reserva no tiene una hora asociada en Cal.com.");
      const calBooking = await confirmCalBooking(reservation.cal_booking_uid);
      await sql`WITH booking AS (
        INSERT INTO public.reys_bookings
          (pre_reservation_id, payment_id, service_id, starts_at, ends_at, timezone, status, cal_booking_uid, cal_status)
        VALUES (${reservation.id}, ${payment.id}, ${reservation.service_id}, ${calBooking.start}, ${calBooking.end},
                ${reservation.timezone}, 'confirmed', ${calBooking.uid}, ${calBooking.status})
        ON CONFLICT (pre_reservation_id) DO UPDATE SET payment_id = EXCLUDED.payment_id,
          service_id = EXCLUDED.service_id, starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at,
          timezone = EXCLUDED.timezone, status = EXCLUDED.status, cal_booking_uid = EXCLUDED.cal_booking_uid,
          cal_status = EXCLUDED.cal_status
        RETURNING pre_reservation_id
      )
      UPDATE public.reys_pre_reservations SET status = 'confirmed', cal_status = ${calBooking.status}
      WHERE id IN (SELECT pre_reservation_id FROM booking)`;
    } else if (["rejected", "cancelled", "refunded"].includes(status)) {
      if (reservation.cal_booking_uid) await cancelCalBooking(reservation.cal_booking_uid, `Pago ${status}`);
      await sql`UPDATE public.reys_pre_reservations SET status = 'cancelled', cal_status = 'cancelled' WHERE id = ${reservation.id}`;
    }

    await completeWebhook(eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (eventId) await failWebhook(eventId, error);
    return apiErrorResponse(error);
  }
}

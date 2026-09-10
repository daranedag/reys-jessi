import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { cancelCalBooking, confirmCalBooking } from "@/lib/calcom/client";
import { env, requireValue } from "@/lib/env";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";
import { getMercadoPagoPayment } from "@/lib/mercadopago/client";
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
    const client = createInsforgeAdminClient();
    const { data: reservation, error: reservationError } = await client.database.from("pre_reservations").select().eq("id", preReservationId).maybeSingle();
    if (reservationError) throw reservationError;
    if (!reservation) throw new ApiError(404, "reservation_not_found", "No encontramos la reserva del pago.");
    const { data: service, error: serviceError } = await client.database.from("services").select().eq("id", reservation.service_id).single();
    if (serviceError) throw serviceError;

    const status = localPaymentStatus(remote.status ?? "pending");
    const amountMatches = Number(remote.transaction_amount) === Number(service.price_amount);
    const currencyMatches = remote.currency_id === service.currency;
    const { data: payment, error: paymentError } = await client.database.from("payments").upsert([{
      pre_reservation_id: reservation.id,
      mercado_pago_payment_id: dataId,
      status: amountMatches && currencyMatches ? status : "pending",
      amount: Number(remote.transaction_amount ?? 0),
      currency: remote.currency_id ?? "CLP",
      raw_payload: remote,
      updated_at: new Date().toISOString(),
    }], { onConflict: "mercado_pago_payment_id" }).select().single();
    if (paymentError) throw paymentError;

    if (!amountMatches || !currencyMatches) {
      await client.database.from("pre_reservations").update({ status: "manual_review", updated_at: new Date().toISOString() }).eq("id", reservation.id);
      throw new ApiError(409, "payment_mismatch", "El monto o la moneda del pago no coinciden.");
    }

    if (status === "approved") {
      if (!reservation.cal_booking_uid) throw new ApiError(409, "missing_cal_booking", "La reserva no tiene una hora asociada en Cal.com.");
      const calBooking = await confirmCalBooking(reservation.cal_booking_uid);
      const { error: bookingError } = await client.database.from("bookings").upsert([{
        pre_reservation_id: reservation.id,
        payment_id: payment.id,
        service_id: reservation.service_id,
        starts_at: calBooking.start,
        ends_at: calBooking.end,
        timezone: reservation.timezone,
        status: "confirmed",
        cal_booking_uid: calBooking.uid,
        cal_status: calBooking.status,
        updated_at: new Date().toISOString(),
      }], { onConflict: "pre_reservation_id" });
      if (bookingError) throw bookingError;
      const { error: updateError } = await client.database.from("pre_reservations").update({ status: "confirmed", cal_status: calBooking.status, updated_at: new Date().toISOString() }).eq("id", reservation.id);
      if (updateError) throw updateError;
    } else if (["rejected", "cancelled", "refunded"].includes(status)) {
      if (reservation.cal_booking_uid) await cancelCalBooking(reservation.cal_booking_uid, `Pago ${status}`);
      const { error: updateError } = await client.database.from("pre_reservations").update({ status: "cancelled", cal_status: "cancelled", updated_at: new Date().toISOString() }).eq("id", reservation.id);
      if (updateError) throw updateError;
    }

    await completeWebhook(eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (eventId) await failWebhook(eventId, error);
    return apiErrorResponse(error);
  }
}

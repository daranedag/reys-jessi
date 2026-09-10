import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { cancelCalBooking, createPendingCalBooking } from "@/lib/calcom/client";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";
import { createReservationToken } from "@/lib/security/reservation-token";
import { getService } from "@/lib/services/repository";

const schema = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  timezone: z.string().min(3).max(80).default("America/Santiago"),
  client: z.object({
    fullName: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).optional(),
    notes: z.string().trim().max(1200).optional(),
  }),
});

export async function POST(request: Request) {
  let preReservationId: string | undefined;
  let calBookingUid: string | undefined;
  try {
    const body = schema.parse(await request.json());
    const startsAt = new Date(body.startsAt);
    if (startsAt.getTime() < Date.now() + 5 * 60_000) throw new ApiError(400, "slot_in_past", "La hora seleccionada ya no está disponible.");

    const service = await getService(body.serviceId);
    if (!service?.cal_event_type_id) throw new ApiError(404, "service_not_available", "El servicio no está disponible para reservar.");
    const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    const { token, hash } = createReservationToken();
    const client = createInsforgeAdminClient();
    const { data: inserted, error: insertError } = await client.database
      .from("pre_reservations")
      .insert([{
        service_id: service.id,
        client_name: body.client.fullName,
        client_email: body.client.email.toLowerCase(),
        client_phone: body.client.phone ?? null,
        client_notes: body.client.notes ?? null,
        form_data: {},
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        timezone: body.timezone,
        status: "draft",
        expires_at: expiresAt.toISOString(),
        customer_token_hash: hash,
      }])
      .select()
      .single();
    if (insertError) throw insertError;
    const savedReservationId = inserted.id as string;
    preReservationId = savedReservationId;

    const calBooking = await createPendingCalBooking({
      eventTypeId: service.cal_event_type_id,
      startsAt: startsAt.toISOString(),
      name: body.client.fullName,
      email: body.client.email,
      phone: body.client.phone,
      timezone: body.timezone,
      preReservationId: savedReservationId,
    });
    calBookingUid = calBooking.uid;
    if (calBooking.status !== "pending") {
      await cancelCalBooking(calBooking.uid, "La reserva debe esperar confirmación de pago");
      throw new ApiError(503, "calcom_event_misconfigured", "La agenda necesita activar la confirmación manual antes de recibir reservas.");
    }

    const { data: updated, error: updateError } = await client.database
      .from("pre_reservations")
      .update({
        status: "awaiting_payment",
        cal_booking_uid: calBooking.uid,
        cal_status: calBooking.status,
        starts_at: calBooking.start,
        ends_at: calBooking.end,
        updated_at: new Date().toISOString(),
      })
      .eq("id", savedReservationId)
      .select()
      .single();
    if (updateError) {
      await cancelCalBooking(calBooking.uid, "No se pudo persistir la pre-reserva");
      throw updateError;
    }

    return NextResponse.json({
      data: {
        preReservation: { id: updated.id, status: updated.status, startsAt: updated.starts_at, expiresAt: updated.expires_at },
        customerToken: token,
      },
    }, { status: 201 });
  } catch (error) {
    if (calBookingUid) {
      try {
        await cancelCalBooking(calBookingUid, "La preparación de la reserva no se completó");
      } catch { /* Cal.com volverá a sincronizar el estado por webhook. */ }
    }
    if (preReservationId) {
      try {
        await createInsforgeAdminClient().database.from("pre_reservations").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", preReservationId);
      } catch { /* Preserve the original integration error. */ }
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "invalid_body", message: "Revisa los datos de la reserva." } }, { status: 400 });
    return apiErrorResponse(error);
  }
}

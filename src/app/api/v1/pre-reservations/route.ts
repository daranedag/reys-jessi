import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { cancelCalBooking, createPendingCalBooking } from "@/lib/calcom/client";
import { sql } from "@/lib/db";
import type { PreReservationRow } from "@/lib/reservations/repository";
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
    const [{ id: savedReservationId }] = await sql<{ id: string }>`
      INSERT INTO public.reys_pre_reservations
        (service_id, client_name, client_email, client_phone, client_notes, starts_at, ends_at,
         timezone, status, expires_at, customer_token_hash)
      VALUES (${service.id}, ${body.client.fullName}, ${body.client.email.toLowerCase()},
              ${body.client.phone ?? null}, ${body.client.notes ?? null}, ${startsAt.toISOString()},
              ${endsAt.toISOString()}, ${body.timezone}, 'draft', ${expiresAt.toISOString()}, ${hash})
      RETURNING id
    `;
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

    const [updated] = await sql<Pick<PreReservationRow, "id" | "status" | "starts_at" | "expires_at">>`
      UPDATE public.reys_pre_reservations SET status = 'awaiting_payment', cal_booking_uid = ${calBooking.uid},
        cal_status = ${calBooking.status}, starts_at = ${calBooking.start}, ends_at = ${calBooking.end}
      WHERE id = ${savedReservationId} RETURNING id, status, starts_at, expires_at
    `;
    if (!updated) throw new Error("No se pudo persistir la pre-reserva");

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
        await sql`UPDATE public.reys_pre_reservations SET status = 'cancelled' WHERE id = ${preReservationId}`;
      } catch { /* Preserve the original integration error. */ }
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "invalid_body", message: "Revisa los datos de la reserva." } }, { status: 400 });
    return apiErrorResponse(error);
  }
}

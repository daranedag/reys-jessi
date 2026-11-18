import { NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { sql } from "@/lib/db";
import { createMercadoPagoPreference } from "@/lib/mercadopago/client";
import { getAuthorizedPreReservation, reservationTokenFrom } from "@/lib/reservations/repository";
import { getService } from "@/lib/services/repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const preReservation = await getAuthorizedPreReservation(id, reservationTokenFrom(request));
    if (preReservation.status !== "awaiting_payment") throw new ApiError(409, "invalid_status", "Esta reserva no puede iniciar un pago.");
    if (new Date(preReservation.expires_at).getTime() <= Date.now()) throw new ApiError(410, "reservation_expired", "La reserva venció. Selecciona una nueva hora.");

    const [existing] = await sql<{ init_point: string | null; sandbox_init_point: string | null }>`
      SELECT init_point, sandbox_init_point FROM public.reys_payments
      WHERE pre_reservation_id = ${id} AND status IN ('created', 'pending') ORDER BY created_at DESC LIMIT 1
    `;
    if (existing?.init_point || existing?.sandbox_init_point) {
      return NextResponse.json({ data: { initPoint: existing.init_point, sandboxInitPoint: existing.sandbox_init_point } });
    }

    const service = await getService(preReservation.service_id);
    if (!service) throw new ApiError(404, "service_not_found", "No encontramos el servicio de la reserva.");
    const preference = await createMercadoPagoPreference({ preReservation, service });
    await sql`
      INSERT INTO public.reys_payments
        (pre_reservation_id, mercado_pago_preference_id, status, amount, currency,
         init_point, sandbox_init_point, raw_payload)
      VALUES (${id}, ${preference.id}, 'created', ${service.price_amount}, ${service.currency},
              ${preference.init_point ?? null}, ${preference.sandbox_init_point ?? null},
              ${JSON.stringify(preference)}::jsonb)
    `;
    return NextResponse.json({ data: { preferenceId: preference.id, initPoint: preference.init_point, sandboxInitPoint: preference.sandbox_init_point } }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

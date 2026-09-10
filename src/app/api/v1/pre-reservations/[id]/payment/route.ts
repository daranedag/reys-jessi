import { NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";
import { createMercadoPagoPreference } from "@/lib/mercadopago/client";
import { getAuthorizedPreReservation, reservationTokenFrom } from "@/lib/reservations/repository";
import { getService } from "@/lib/services/repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const preReservation = await getAuthorizedPreReservation(id, reservationTokenFrom(request));
    if (preReservation.status !== "awaiting_payment") throw new ApiError(409, "invalid_status", "Esta reserva no puede iniciar un pago.");
    if (new Date(preReservation.expires_at).getTime() <= Date.now()) throw new ApiError(410, "reservation_expired", "La reserva venció. Selecciona una nueva hora.");

    const client = createInsforgeAdminClient();
    const { data: existing, error: existingError } = await client.database
      .from("payments")
      .select()
      .eq("pre_reservation_id", id)
      .in("status", ["created", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing?.init_point || existing?.sandbox_init_point) {
      return NextResponse.json({ data: { initPoint: existing.init_point, sandboxInitPoint: existing.sandbox_init_point } });
    }

    const service = await getService(preReservation.service_id);
    if (!service) throw new ApiError(404, "service_not_found", "No encontramos el servicio de la reserva.");
    const preference = await createMercadoPagoPreference({ preReservation, service });
    const { error: paymentError } = await client.database.from("payments").insert([{
      pre_reservation_id: id,
      mercado_pago_preference_id: preference.id,
      status: "created",
      amount: Number(service.price_amount),
      currency: service.currency,
      init_point: preference.init_point ?? null,
      sandbox_init_point: preference.sandbox_init_point ?? null,
      raw_payload: preference,
    }]);
    if (paymentError) throw paymentError;
    return NextResponse.json({ data: { preferenceId: preference.id, initPoint: preference.init_point, sandboxInitPoint: preference.sandbox_init_point } }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

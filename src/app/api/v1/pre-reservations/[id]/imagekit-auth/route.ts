import { NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { getImageKitUploadAuthorization } from "@/lib/imagekit/client";
import { getAuthorizedPreReservation, reservationTokenFrom } from "@/lib/reservations/repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reservation = await getAuthorizedPreReservation(id, reservationTokenFrom(request));
    if (!["draft", "awaiting_payment"].includes(reservation.status)) throw new ApiError(409, "uploads_closed", "Esta reserva ya no acepta imágenes.");
    if (new Date(reservation.expires_at).getTime() <= Date.now()) throw new ApiError(410, "reservation_expired", "La reserva venció.");
    return NextResponse.json({ data: getImageKitUploadAuthorization(id) });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

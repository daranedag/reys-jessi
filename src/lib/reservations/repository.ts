import "server-only";
import { ApiError } from "@/lib/api";
import { sql } from "@/lib/db";
import { assertReservationToken } from "@/lib/security/reservation-token";

export type PreReservationRow = {
  id: string;
  service_id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  starts_at: string;
  ends_at: string;
  expires_at: string;
  timezone: string;
  status: string;
  cal_booking_uid: string | null;
  customer_token_hash: string;
};

export async function getPreReservation(id: string): Promise<PreReservationRow> {
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ApiError(404, "reservation_not_found", "No encontramos la reserva.");
  }
  const [reservation] = await sql<PreReservationRow>`SELECT * FROM public.reys_pre_reservations WHERE id = ${id}`;
  if (!reservation) throw new ApiError(404, "reservation_not_found", "No encontramos la reserva.");
  return reservation;
}

export async function getAuthorizedPreReservation(id: string, token: string | null) {
  const preReservation = await getPreReservation(id);
  assertReservationToken(preReservation.customer_token_hash, token);
  return preReservation;
}

export function reservationTokenFrom(request: Request) {
  return request.headers.get("x-reservation-token");
}

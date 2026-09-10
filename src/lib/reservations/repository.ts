import "server-only";
import { ApiError } from "@/lib/api";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";
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
  status: string;
  cal_booking_uid: string | null;
  customer_token_hash: string;
};

export async function getPreReservation(id: string): Promise<PreReservationRow> {
  const client = createInsforgeAdminClient();
  const { data, error } = await client.database.from("pre_reservations").select().eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new ApiError(404, "reservation_not_found", "No encontramos la reserva.");
  return data as PreReservationRow;
}

export async function getAuthorizedPreReservation(id: string, token: string | null) {
  const preReservation = await getPreReservation(id);
  assertReservationToken(preReservation.customer_token_hash, token);
  return preReservation;
}

export function reservationTokenFrom(request: Request) {
  return request.headers.get("x-reservation-token");
}

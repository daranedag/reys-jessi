import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { ApiError } from "@/lib/api";

export function createReservationToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashReservationToken(token) };
}

export function hashReservationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function assertReservationToken(expectedHash: string, provided: string | null) {
  if (!provided) throw new ApiError(401, "reservation_token_required", "Falta la autorización de la reserva.");
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(hashReservationToken(provided), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new ApiError(403, "invalid_reservation_token", "La autorización de la reserva no es válida.");
  }
}

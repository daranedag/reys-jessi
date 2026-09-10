import "server-only";
import { ApiError } from "@/lib/api";
import type { Slot } from "@/lib/domain";
import { env, requireValue } from "@/lib/env";

type CalResponse<T> = { status: "success" | "error"; data: T; error?: { message?: string } };

async function calRequest<T>(path: string, init: RequestInit, version: string): Promise<T> {
  const apiKey = requireValue(env.calApiKey, "CAL_API_KEY");
  const response = await fetch(`${env.calBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": version,
      "content-type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as CalResponse<T>;
  if (!response.ok || payload.status === "error") {
    throw new ApiError(502, "calcom_error", payload.error?.message ?? "Cal.com no pudo completar la solicitud.");
  }
  return payload.data;
}

export async function getCalSlots(input: {
  eventTypeId: number;
  from: string;
  to: string;
  timezone: string;
}): Promise<Slot[]> {
  const query = new URLSearchParams({
    eventTypeId: String(input.eventTypeId),
    start: input.from,
    end: input.to,
    timeZone: input.timezone,
    format: "range",
  });
  const data = await calRequest<Record<string, Slot[]>>(`/v2/slots?${query}`, { method: "GET" }, env.calSlotsVersion);
  return Object.values(data).flat().sort((a, b) => a.start.localeCompare(b.start));
}

export type CalBooking = {
  uid: string;
  status: "pending" | "accepted" | "cancelled" | "rejected" | string;
  start: string;
  end: string;
};

export async function createPendingCalBooking(input: {
  eventTypeId: number;
  startsAt: string;
  name: string;
  email: string;
  phone?: string;
  timezone: string;
  preReservationId: string;
}): Promise<CalBooking> {
  return calRequest<CalBooking>(
    "/v2/bookings",
    {
      method: "POST",
      body: JSON.stringify({
        start: input.startsAt,
        eventTypeId: input.eventTypeId,
        attendee: {
          name: input.name,
          email: input.email,
          phoneNumber: input.phone,
          timeZone: input.timezone,
          language: "es",
        },
        metadata: { preReservationId: input.preReservationId, source: "jessica-quiroz-web" },
      }),
    },
    env.calBookingsVersion,
  );
}

export async function getCalBooking(uid: string) {
  return calRequest<CalBooking>(`/v2/bookings/${encodeURIComponent(uid)}`, { method: "GET" }, env.calBookingsVersion);
}

export async function confirmCalBooking(uid: string) {
  const booking = await getCalBooking(uid);
  if (booking.status === "accepted") return booking;
  return calRequest<CalBooking>(`/v2/bookings/${encodeURIComponent(uid)}/confirm`, { method: "POST" }, env.calBookingsVersion);
}

export async function cancelCalBooking(uid: string, cancellationReason: string) {
  const booking = await getCalBooking(uid);
  if (booking.status === "cancelled" || booking.status === "rejected") return booking;
  return calRequest<CalBooking>(
    `/v2/bookings/${encodeURIComponent(uid)}/cancel`,
    { method: "POST", body: JSON.stringify({ cancellationReason }) },
    env.calBookingsVersion,
  );
}

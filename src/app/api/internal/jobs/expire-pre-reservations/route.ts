import { NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { cancelCalBooking } from "@/lib/calcom/client";
import { env, requireValue } from "@/lib/env";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const secret = requireValue(env.cronSecret, "CRON_SECRET");
    if (request.headers.get("authorization") !== `Bearer ${secret}`) throw new ApiError(401, "unauthorized", "Autorización inválida.");
    const reservations = await sql<{ id: string; cal_booking_uid: string | null }>`
      SELECT id, cal_booking_uid FROM public.reys_pre_reservations
      WHERE status IN ('draft', 'awaiting_payment') AND expires_at < now() LIMIT 100
    `;

    let expired = 0;
    const failed: string[] = [];
    for (const reservation of reservations) {
      try {
        if (reservation.cal_booking_uid) await cancelCalBooking(reservation.cal_booking_uid, "El plazo de pago venció");
        const changed = await sql`UPDATE public.reys_pre_reservations SET status = 'expired', cal_status = 'cancelled'
          WHERE id = ${reservation.id} AND status IN ('draft', 'awaiting_payment') RETURNING id`;
        expired += changed.length;
      } catch {
        failed.push(reservation.id);
      }
    }
    return NextResponse.json({ data: { expired, failed } }, { status: failed.length ? 207 : 200 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

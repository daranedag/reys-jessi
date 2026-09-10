import { NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { cancelCalBooking } from "@/lib/calcom/client";
import { env, requireValue } from "@/lib/env";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";

export async function GET(request: Request) {
  try {
    const secret = requireValue(env.cronSecret, "CRON_SECRET");
    if (request.headers.get("authorization") !== `Bearer ${secret}`) throw new ApiError(401, "unauthorized", "Autorización inválida.");
    const client = createInsforgeAdminClient();
    const { data, error } = await client.database
      .from("pre_reservations")
      .select("id,cal_booking_uid")
      .in("status", ["draft", "awaiting_payment"])
      .lt("expires_at", new Date().toISOString())
      .limit(100);
    if (error) throw error;

    let expired = 0;
    const failed: string[] = [];
    for (const reservation of data ?? []) {
      try {
        if (reservation.cal_booking_uid) await cancelCalBooking(reservation.cal_booking_uid, "El plazo de pago venció");
        const { error: updateError } = await client.database.from("pre_reservations").update({ status: "expired", cal_status: "cancelled", updated_at: new Date().toISOString() }).eq("id", reservation.id);
        if (updateError) throw updateError;
        expired += 1;
      } catch {
        failed.push(reservation.id);
      }
    }
    return NextResponse.json({ data: { expired, failed } }, { status: failed.length ? 207 : 200 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { getCalSlots } from "@/lib/calcom/client";
import { getService } from "@/lib/services/repository";

const querySchema = z.object({
  serviceId: z.string().uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  timezone: z.string().min(3).max(80),
});

export async function GET(request: NextRequest) {
  try {
    const query = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (to <= from || to.getTime() - from.getTime() > 31 * 86_400_000) {
      throw new ApiError(400, "invalid_range", "El rango de fechas no es válido.");
    }
    const service = await getService(query.serviceId);
    if (!service?.cal_event_type_id) throw new ApiError(404, "service_not_available", "El servicio aún no tiene agenda disponible.");
    const data = await getCalSlots({
      eventTypeId: service.cal_event_type_id,
      from: query.from,
      to: query.to,
      timezone: query.timezone,
    });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "invalid_query", message: "Revisa la fecha y el servicio." } }, { status: 400 });
    return apiErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { getActiveServices } from "@/lib/services/repository";

export async function GET() {
  try {
    return NextResponse.json({ data: await getActiveServices() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

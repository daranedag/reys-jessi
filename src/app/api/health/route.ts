import { NextResponse } from "next/server";
import { env, isInsforgeAdminConfigured } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    integrations: {
      insforge: isInsforgeAdminConfigured(),
      calcom: Boolean(env.calApiKey),
      mercadoPago: Boolean(env.mercadoPagoAccessToken),
      imageKit: Boolean(env.imageKitPrivateKey && env.imageKitPublicKey),
    },
  });
}

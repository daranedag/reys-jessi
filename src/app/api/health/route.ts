import { NextResponse } from "next/server";
import { env, isAdminAuthConfigured } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    integrations: {
      neon: Boolean(env.databaseUrl),
      neonAuth: isAdminAuthConfigured(),
      calcom: Boolean(env.calApiKey),
      mercadoPago: Boolean(env.mercadoPagoAccessToken),
      imageKit: Boolean(env.imageKitPrivateKey && env.imageKitPublicKey),
    },
  });
}

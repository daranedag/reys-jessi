import { createRefreshAuthRouter } from "@insforge/sdk/ssr";
import { NextResponse } from "next/server";
import { env, isInsforgePublicConfigured } from "@/lib/env";

export async function POST(request: Request) {
  if (!isInsforgePublicConfigured()) {
    return NextResponse.json({ error: "InsForge no está configurado" }, { status: 503 });
  }

  const router = createRefreshAuthRouter({
    baseUrl: env.insforgeBaseUrl,
    anonKey: env.insforgeAnonKey,
  });
  return router.POST(request);
}

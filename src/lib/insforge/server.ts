import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { env, requireValue } from "@/lib/env";

export async function createInsforgeServerClient() {
  return createServerClient({
    baseUrl: requireValue(env.insforgeBaseUrl, "NEXT_PUBLIC_INSFORGE_BASE_URL"),
    anonKey: requireValue(env.insforgeAnonKey, "NEXT_PUBLIC_INSFORGE_ANON_KEY"),
    cookies: await cookies(),
  });
}

import "server-only";
import { createAdminClient } from "@insforge/sdk";
import { env, requireValue } from "@/lib/env";

export function createInsforgeAdminClient() {
  return createAdminClient({
    baseUrl: requireValue(env.insforgeBaseUrl, "NEXT_PUBLIC_INSFORGE_BASE_URL"),
    apiKey: requireValue(env.insforgeApiKey, "INSFORGE_API_KEY"),
  });
}

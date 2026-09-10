"use client";

import { createBrowserClient } from "@insforge/sdk/ssr";

export const insforgeBrowser = createBrowserClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  refreshUrl: "/api/auth/refresh",
});

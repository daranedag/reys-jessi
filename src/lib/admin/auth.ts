import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";
import { env, requireValue } from "@/lib/env";

let auth: ReturnType<typeof createNeonAuth> | undefined;

export function getAuth() {
  auth ??= createNeonAuth({
    baseUrl: requireValue(env.neonAuthBaseUrl, "NEON_AUTH_BASE_URL"),
    cookies: { secret: requireValue(env.neonAuthCookieSecret, "NEON_AUTH_COOKIE_SECRET") },
  });
  return auth;
}

export function verifyAdminEmail(credentials: { email: string; otp: string }) {
  // The managed SDK exposes the optional email OTP plugin at runtime.
  const emailOtp = getAuth().emailOtp as {
    verifyEmail(input: typeof credentials): Promise<{ error: unknown }>;
  };
  return emailOtp.verifyEmail(credentials);
}

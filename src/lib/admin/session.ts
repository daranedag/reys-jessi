import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isInsforgePublicConfigured } from "@/lib/env";
import { createInsforgeServerClient } from "@/lib/insforge/server";

export type AdminSession = {
  user: { id: string; email?: string | null };
  profile: { display_name: string | null; role: "owner" | "editor" };
};

export async function isAdminSubdomain() {
  const store = await headers();
  const host = (store.get("x-forwarded-host") ?? store.get("host") ?? "").split(":")[0];
  return host.toLowerCase().startsWith("admin.");
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isInsforgePublicConfigured()) return null;

  const client = await createInsforgeServerClient();
  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  const user = userData?.user;
  if (userError || !user) return null;

  const { data: profile, error: profileError } = await client.database
    .from("admin_profiles")
    .select("display_name,role,active")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (profileError || !profile) return null;
  return {
    user: { id: user.id, email: user.email },
    profile: profile as AdminSession["profile"],
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect((await isAdminSubdomain()) ? "/login" : "/admin/login");
  return session;
}

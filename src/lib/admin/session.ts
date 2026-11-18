import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/admin/auth";
import { sql } from "@/lib/db";
import { env, isAdminAuthConfigured } from "@/lib/env";

type AdminProfile = { display_name: string | null; role: "owner" | "editor" };
type AuthenticatedUser = { id: string; email: string; emailVerified: boolean; name?: string | null };

export async function isAdminSubdomain() {
  const store = await headers();
  const host = (store.get("x-forwarded-host") ?? store.get("host") ?? "").split(":")[0].toLowerCase();
  return host === env.adminHost.split(":")[0].toLowerCase() || host.startsWith("admin.");
}

export async function canCreateFirstAdmin() {
  if (!isAdminAuthConfigured() || !env.adminEmail) return false;
  const [row] = await sql<{ available: boolean }>`
    SELECT NOT EXISTS (SELECT 1 FROM public.reys_admin_profiles WHERE role = 'owner') AS available
  `;
  return row.available;
}

export async function findAdminProfile(user: AuthenticatedUser, bootstrap = false) {
  if (!user.emailVerified) return null;

  if (bootstrap && user.email.toLowerCase() === env.adminEmail) {
    await sql`
      INSERT INTO public.reys_admin_profiles (user_id, display_name, role)
      SELECT ${user.id}::uuid, ${user.name || null}, 'owner'
      WHERE NOT EXISTS (SELECT 1 FROM public.reys_admin_profiles WHERE role = 'owner')
      ON CONFLICT (user_id) DO NOTHING
    `;
  }

  const [profile] = await sql<AdminProfile>`
    SELECT display_name, role FROM public.reys_admin_profiles
    WHERE user_id = ${user.id} AND active
  `;
  return profile ?? null;
}

const getAdminSession = cache(async () => {
  if (!isAdminAuthConfigured()) return null;
  const { data: session, error } = await getAuth().getSession();
  if (error || !session?.user) return null;
  const profile = await findAdminProfile(session.user);
  return profile ? { user: session.user, profile } : null;
});

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect((await isAdminSubdomain()) ? "/login" : "/admin/login");
  return session;
}

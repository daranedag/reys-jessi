"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import { z } from "zod";
import { env, isInsforgePublicConfigured } from "@/lib/env";

export type LoginState = { error?: string };

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!isInsforgePublicConfigured()) return { error: "Primero debes configurar la conexión con InsForge." };

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Revisa el correo y la contraseña." };

  const auth = createAuthActions({
    baseUrl: env.insforgeBaseUrl,
    anonKey: env.insforgeAnonKey,
    cookies: await cookies(),
  });
  const { error } = await auth.signInWithPassword(parsed.data);
  if (error) return { error: "No pudimos iniciar sesión con esos datos." };
  redirect("/");
}

export async function logoutAction() {
  if (isInsforgePublicConfigured()) {
    const auth = createAuthActions({
      baseUrl: env.insforgeBaseUrl,
      anonKey: env.insforgeAnonKey,
      cookies: await cookies(),
    });
    await auth.signOut();
  }
  redirect("/login");
}

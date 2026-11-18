"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAuth, verifyAdminEmail } from "@/lib/admin/auth";
import { canCreateFirstAdmin, findAdminProfile, isAdminSubdomain } from "@/lib/admin/session";
import { env, isAdminAuthConfigured } from "@/lib/env";

export type LoginState = { error?: string; verifyEmail?: string; notice?: string };

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const credentialsSchema = z.object({ email: emailSchema, password: z.string().min(8).max(128) });
const verificationSchema = z.object({ email: emailSchema, otp: z.string().regex(/^\d{6}$/) });

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminAuthConfigured()) return { error: "El acceso administrativo todavía está en configuración." };
  const intent = formData.get("intent");
  if (intent === "cancel") return {};
  const auth = getAuth();
  try {
    if (intent === "verify") {
      const parsed = verificationSchema.safeParse(Object.fromEntries(formData));
      if (!parsed.success) return { error: "Ingresa el código de seis dígitos.", verifyEmail: _state.verifyEmail };
      const { error } = await verifyAdminEmail(parsed.data);
      if (error) return { error: "El código es inválido o venció.", verifyEmail: parsed.data.email };
      return { notice: "Correo verificado. Ya puedes iniciar sesión." };
    }

    const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "Revisa el correo y la contraseña." };
    const { email, password } = parsed.data;
    if (intent === "register") {
      if (email !== env.adminEmail || !await canCreateFirstAdmin()) {
        return { error: "La creación de la cuenta administrativa no está disponible." };
      }
      const { error } = await auth.signUp.email({ email, password, name: email.split("@")[0] });
      if (error) return { error: "No pudimos crear la cuenta. Si ya la registraste, intenta iniciar sesión." };
      return { verifyEmail: email, notice: "Te enviamos un código para verificar tu correo." };
    }

    const { data, error } = await auth.signIn.email({ email, password });
    if (error?.code === "EMAIL_NOT_VERIFIED") {
      return { verifyEmail: email, notice: "Te enviamos un código para verificar tu correo." };
    }
    if (error || !data?.user) return { error: "No pudimos iniciar sesión con esos datos." };
    if (!await findAdminProfile(data.user, true)) {
      await auth.signOut();
      return { error: "Esta cuenta no tiene acceso al panel." };
    }
  } catch {
    return { error: "No pudimos completar el acceso. Intenta de nuevo en unos minutos." };
  }
  redirect((await isAdminSubdomain()) ? "/" : "/admin");
}

export async function logoutAction() {
  if (isAdminAuthConfigured()) await getAuth().signOut();
  redirect((await isAdminSubdomain()) ? "/login" : "/admin/login");
}

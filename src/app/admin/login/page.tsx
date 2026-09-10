import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { isInsforgePublicConfigured } from "@/lib/env";

export const metadata = { title: "Acceso al panel" };

export default function AdminLoginPage() {
  const configured = isInsforgePublicConfigured();
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f1f4] px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft sm:p-10">
        <Link className="flex items-center gap-3" href={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}>
          <Image alt="Jessica Quiróz" height={54} src="/logo_color.png" width={54} />
          <span className="font-display text-2xl font-semibold text-primary">Panel Jessica Quiróz</span>
        </Link>
        <h1 className="mt-8 font-display text-4xl">Bienvenida</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Administra el contenido, los servicios y las reservas desde un solo lugar.</p>
        {!configured ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            La pantalla está lista. Para iniciar sesión falta configurar las variables públicas de InsForge.
          </p>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}

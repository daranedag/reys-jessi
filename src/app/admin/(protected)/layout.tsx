import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";
import { isAdminSubdomain, requireAdminSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const nav = [
  ["Resumen", ""],
  ["Contenido", "/content"],
  ["Servicios", "/services"],
  ["Reservas", "/reservations"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const base = (await isAdminSubdomain()) ? "" : "/admin";

  return (
    <div className="min-h-screen bg-[#f4f1f4] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-primary/10 bg-white p-5 lg:fixed lg:inset-y-0 lg:w-[260px] lg:border-b-0 lg:border-r">
        <Link className="flex items-center gap-3" href={`${base}/`}>
          <Image alt="Jessica Quiróz" height={48} src="/logo_color.png" width={48} />
          <span className="font-display text-xl font-semibold text-primary">Administración</span>
        </Link>
        <nav className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
          {nav.map(([label, path]) => (
            <Link className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-primary/5 hover:text-primary" href={`${base}${path || "/"}`} key={label}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-primary/10 pt-5 lg:absolute lg:inset-x-5 lg:bottom-5">
          <p className="truncate text-xs text-slate-500">{session.profile.display_name ?? session.user.email ?? "Administradora"}</p>
          <form action={logoutAction}>
            <button className="mt-3 text-xs font-semibold text-primary" type="submit">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <main className="p-5 sm:p-8 lg:col-start-2 lg:p-10">{children}</main>
    </div>
  );
}

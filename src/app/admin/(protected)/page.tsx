import { PageHeading } from "@/components/admin/page-heading";
import { isInsforgeAdminConfigured } from "@/lib/env";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";

async function countRows(table: string) {
  if (!isInsforgeAdminConfigured()) return 0;
  const { count, error } = await createInsforgeAdminClient().database
    .from(table)
    .select("id", { count: "exact", head: true });
  return error ? 0 : (count ?? 0);
}

export default async function AdminDashboard() {
  const [services, reservations, pendingPayments, content] = await Promise.all([
    countRows("services"),
    countRows("bookings"),
    countRows("payments"),
    countRows("content_revisions"),
  ]);
  const cards = [
    ["Servicios", services, "Conectados con tipos de evento de Cal.com"],
    ["Reservas", reservations, "Historial sincronizado"],
    ["Pagos", pendingPayments, "Registros de Mercado Pago"],
    ["Cambios", content, "Versiones guardadas del contenido"],
  ] as const;

  return (
    <div>
      <PageHeading description="Una vista rápida de la operación y del contenido publicado." title="Resumen" />
      <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, note]) => (
          <article className="rounded-3xl bg-white p-6 shadow-sm" key={label}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-4 font-display text-5xl font-semibold text-primary">{value}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">{note}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 rounded-3xl bg-primary p-7 text-white shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Estado de implementación</p>
        <h2 className="mt-3 font-display text-3xl">Base lista para conectar</h2>
        <div className="mt-6 grid gap-3 text-sm text-white/80 md:grid-cols-2">
          <p>✓ Sitio y panel en una sola aplicación Next.js</p>
          <p>✓ Subdominio administrativo aislado</p>
          <p>✓ Autenticación y permisos por rol</p>
          <p>✓ BFF para Cal.com, Mercado Pago e ImageKit</p>
        </div>
      </section>
    </div>
  );
}

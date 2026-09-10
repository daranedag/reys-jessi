import { saveServiceAction } from "./actions";
import { PageHeading } from "@/components/admin/page-heading";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { requireAdminSession } from "@/lib/admin/session";

export default async function ServicesPage() {
  await requireAdminSession();
  const client = await createInsforgeServerClient();
  const { data } = await client.database.from("services").select().order("name");
  const services = data ?? [];
  return (
    <div>
      <PageHeading description="Cada servicio público se enlaza con un tipo de evento de Cal.com y un precio de Mercado Pago." title="Servicios" />
      <form action={saveServiceAction} className="mt-10 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-3xl">Nuevo servicio</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">Nombre<input className="rounded-xl border-primary/20" name="name" required /></label>
          <label className="grid gap-2 text-sm font-semibold">ID del evento en Cal.com<input className="rounded-xl border-primary/20" min="1" name="calEventTypeId" required type="number" /></label>
          <label className="grid gap-2 text-sm font-semibold">Duración (minutos)<input className="rounded-xl border-primary/20" defaultValue="60" min="15" name="duration" required type="number" /></label>
          <label className="grid gap-2 text-sm font-semibold">Precio CLP<input className="rounded-xl border-primary/20" min="1" name="price" required type="number" /></label>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Descripción<textarea className="min-h-24 rounded-xl border-primary/20" name="description" /></label>
        </div>
        <button className="mt-6 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white" type="submit">Crear servicio</button>
      </form>
      <section className="mt-7 grid gap-4">
        {services.map((service) => (
          <article className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center" key={service.id}>
            <div><h2 className="font-display text-2xl font-semibold">{service.name}</h2><p className="mt-1 text-sm text-slate-500">{service.duration_minutes} min · ${Number(service.price_amount).toLocaleString("es-CL")} CLP · Cal.com #{service.cal_event_type_id ?? "sin enlazar"}</p></div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${service.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{service.active ? "Activo" : "Oculto"}</span>
          </article>
        ))}
        {!services.length ? <p className="rounded-3xl bg-white p-6 text-sm text-slate-600">Todavía no hay servicios configurados.</p> : null}
      </section>
    </div>
  );
}

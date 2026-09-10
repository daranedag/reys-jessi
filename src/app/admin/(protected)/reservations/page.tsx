import { PageHeading } from "@/components/admin/page-heading";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { requireAdminSession } from "@/lib/admin/session";

export default async function ReservationsPage() {
  await requireAdminSession();
  const client = await createInsforgeServerClient();
  const { data } = await client.database
    .from("pre_reservations")
    .select("id,client_name,client_email,starts_at,status,cal_booking_uid,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  const reservations = data ?? [];
  return (
    <div>
      <PageHeading description="Seguimiento conjunto de la hora de Cal.com y el estado del pago." title="Reservas" />
      <section className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-primary/5 text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="p-4">Paciente</th><th className="p-4">Fecha</th><th className="p-4">Estado</th><th className="p-4">Cal.com</th></tr></thead>
            <tbody className="divide-y divide-primary/10">
              {reservations.map((reservation) => (
                <tr key={reservation.id}><td className="p-4"><strong className="block">{reservation.client_name}</strong><span className="text-xs text-slate-500">{reservation.client_email}</span></td><td className="p-4">{new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago" }).format(new Date(reservation.starts_at))}</td><td className="p-4"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{reservation.status}</span></td><td className="p-4 text-xs text-slate-500">{reservation.cal_booking_uid ?? "Pendiente"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {!reservations.length ? <p className="p-7 text-sm text-slate-600">Todavía no hay reservas para mostrar.</p> : null}
      </section>
    </div>
  );
}

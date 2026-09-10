import Image from "next/image";
import Link from "next/link";

const copy = {
  aprobado: { title: "Pago recibido", body: "Estamos confirmando la hora con Cal.com. Recibirás la confirmación de tu reserva por correo.", tone: "text-emerald-700 bg-emerald-50" },
  pendiente: { title: "Pago en revisión", body: "Mercado Pago está procesando el pago. No necesitas reservar otra hora mientras esté vigente.", tone: "text-amber-800 bg-amber-50" },
  fallido: { title: "El pago no se completó", body: "La hora se liberará automáticamente. Puedes volver al sitio y seleccionar otra vez.", tone: "text-red-700 bg-red-50" },
} as const;

export default async function ResultPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const result = copy[estado as keyof typeof copy] ?? copy.pendiente;
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-xl rounded-[2rem] bg-white p-9 text-center shadow-soft">
        <Image alt="Jessica Quiróz" className="mx-auto" height={72} src="/logo_color.png" width={72} />
        <p className={`mx-auto mt-7 w-fit rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${result.tone}`}>Reserva</p>
        <h1 className="mt-5 font-display text-5xl">{result.title}</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-600">{result.body}</p>
        <Link className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white" href="/">Volver al sitio</Link>
      </section>
    </main>
  );
}

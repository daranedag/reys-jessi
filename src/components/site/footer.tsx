import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-white py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo_color.png" alt="Jessica Quiróz" width={52} height={52} />
            <span className="font-display text-2xl font-semibold text-primary">Jessica Quiróz</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Sanación energética y rejuvenecimiento consciente para una vida en armonía.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink">Navegación</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <a href="#cronologia">Camino</a>
            <a href="#rejuvenecimiento">Tratamientos</a>
            <a href="#agendamiento">Reservar</a>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink">Atención</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Presencial · 09:00 a 17:00 hrs.
            <br />La dirección se comparte al confirmar.
          </p>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl border-t border-primary/10 px-6 pt-6 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
        © {new Date().getFullYear()} Jessica Quiróz. Todos los derechos reservados.
      </p>
    </footer>
  );
}

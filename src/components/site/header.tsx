import Image from "next/image";
import Link from "next/link";

const links = [
  ["Camino", "#cronologia"],
  ["Formación", "#cursos"],
  ["Enfoque", "#rejuvenecimiento"],
  ["En primera persona", "#testimonios"],
] as const;

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/10 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link className="focus-ring flex items-center gap-3 rounded-full" href="/">
          <Image src="/logo_color.png" alt="Jessica Quiróz" width={58} height={58} priority />
          <span className="hidden font-display text-2xl font-semibold text-primary sm:block">Jessica Quiróz</span>
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.16em] text-ink/70 lg:flex">
          {links.map(([label, href]) => (
            <a className="focus-ring rounded-full transition hover:text-primary" href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>
        <a
          className="focus-ring rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
          href="#agendamiento"
        >
          Reservar
        </a>
      </div>
    </header>
  );
}

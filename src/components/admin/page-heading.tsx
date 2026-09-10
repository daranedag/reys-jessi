export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">Panel privado</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </header>
  );
}

import Image from "next/image";
import type { Service, SiteContent } from "@/lib/domain";
import { BookingWizard } from "@/components/site/booking-wizard";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

type Props = { content: SiteContent; services: Service[] };

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-3">{title}</h2>
      {body ? <p className="mt-5 text-sm leading-7 text-slate-600">{body}</p> : null}
    </div>
  );
}

export function HomePage({ content, services }: Props) {
  return (
    <>
      <Header />
      <main className="overflow-hidden pt-20">
        <section className="relative py-20 sm:py-28" id="inicio">
          <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
            <div>
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1 className="mt-5 font-display text-5xl leading-[0.98] text-ink sm:text-6xl lg:text-7xl">
                {content.hero.title}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                {content.hero.description}
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <a className="focus-ring rounded-full bg-primary px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/20" href="#agendamiento">
                  Reservar sesión
                </a>
                <a className="focus-ring rounded-full border border-primary/30 px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-primary" href="#rejuvenecimiento">
                  Ver tratamientos
                </a>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-soft">
                <Image alt="Terapeuta holística" className="object-cover" fill priority sizes="(min-width: 1024px) 48vw, 90vw" src={content.hero.imageUrl} />
              </div>
              <blockquote className="absolute -bottom-8 left-6 right-6 rounded-3xl bg-white p-6 text-center font-display text-xl italic shadow-xl sm:left-12 sm:right-auto sm:px-10">
                “{content.hero.quote}”
              </blockquote>
            </div>
          </div>
        </section>

        <section className="bg-white/60 py-24" id="cronologia">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHeading eyebrow="Cronología" title="Estudios y camino de vida" />
            <div className="relative mt-16 grid gap-6 md:grid-cols-3">
              <div className="absolute left-[16.66%] right-[16.66%] top-5 hidden h-px bg-primary/20 md:block" />
              {content.timeline.map((item, index) => (
                <article className="relative rounded-3xl border border-primary/10 bg-white p-7 shadow-sm" key={item.id}>
                  <span className="relative z-10 mb-7 grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-white ring-8 ring-cream">
                    {index + 1}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{item.badge}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24" id="cursos">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="Cursos y talleres realizados" title="Formación continua" body="Una trayectoria de aprendizajes que respalda cada práctica terapéutica." />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {content.training.map((item) => (
                <article className="group rounded-[2rem] border border-primary/10 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-soft" key={item.id}>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{item.badge}</span>
                  <h3 className="mt-12 font-display text-3xl font-semibold">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-24" id="nociones">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="Nociones" title="Bases que sostienen cada sesión" body="Principios integrados para acompañar procesos de sanación y rejuvenecimiento." />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {content.notions.map((item, index) => (
                <article className="rounded-[2rem] bg-white p-8 shadow-sm" key={item.id}>
                  <span className="font-display text-5xl text-primary/30">0{index + 1}</span>
                  <h3 className="mt-7 font-display text-3xl font-semibold">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24" id="experiencias">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="Experiencias de vida" title="Historias que inspiran" body="Momentos clave que moldearon una mirada holística, respetuosa y presente." />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {content.experiences.map((item) => (
                <article className="rounded-[2rem] border border-secondary/20 bg-gradient-to-br from-white to-secondary/5 p-8" key={item.id}>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{item.badge}</p>
                  <h3 className="mt-4 font-display text-3xl font-semibold">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24" id="rejuvenecimiento">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="Rejuvenecimiento" title="Trabajos faciales y corporales" body="Resultados visibles al alinear la energía interna con el cuidado externo." />
            <div className="mt-12 grid gap-7 md:grid-cols-3">
              {content.treatments.map((item) => (
                <article className="overflow-hidden rounded-[2rem] bg-cream shadow-sm" key={item.id}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image alt={item.title} className="object-cover transition duration-700 hover:scale-105" fill sizes="(min-width: 768px) 33vw, 90vw" src={item.imageUrl ?? content.hero.imageUrl} />
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-3xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-secondary/10 py-24" id="testimonios">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="Testimonios" title="Voces de pacientes" />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {content.testimonials.map((item) => (
                <figure className="rounded-[2rem] bg-white p-8 shadow-sm" key={item.id}>
                  <span className="font-display text-6xl leading-none text-secondary/40">“</span>
                  <blockquote className="-mt-2 text-sm leading-7 text-slate-600">{item.description}</blockquote>
                  <figcaption className="mt-7 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-primary font-display text-xl text-white">{item.title.charAt(0)}</span>
                    <span><strong className="block text-sm">{item.title}</strong><small className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.personRole}</small></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24" id="reflexiones">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="Reflexiones" title="Pequeños textos para el alma" />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {content.reflections.map((item, index) => (
                <article className={`rounded-[2rem] p-8 ${index === 1 ? "bg-primary text-white" : "bg-white shadow-sm"}`} key={item.id}>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${index === 1 ? "text-accent" : "text-primary"}`}>{item.badge}</p>
                  <h3 className="mt-7 font-display text-3xl font-semibold">{item.title}</h3>
                  <p className={`mt-4 text-sm leading-7 ${index === 1 ? "text-white/75" : "text-slate-600"}`}>{item.description}</p>
                  <p className={`mt-8 border-t pt-6 font-display text-xl italic ${index === 1 ? "border-white/20" : "border-primary/10"}`}>{item.closing}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <BookingWizard services={services} />

        <section className="bg-primary/10 py-24" id="contacto">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="rounded-[2.5rem] bg-white p-10 shadow-soft sm:p-14">
              <p className="eyebrow">Contacto</p>
              <h2 className="section-title mt-3">Agenda tu espacio de bienestar</h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600">La atención es presencial y la dirección se comparte una vez confirmado el pago y la reserva.</p>
              <a className="focus-ring mt-8 inline-flex rounded-full bg-primary px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white" href="#agendamiento">Reservar tu hora</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

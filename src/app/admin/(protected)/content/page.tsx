import { saveHeroAction } from "./actions";
import { PageHeading } from "@/components/admin/page-heading";
import { defaultContent } from "@/lib/content/defaults";
import { getHeroSettings } from "@/lib/content/repository";
import { requireAdminSession } from "@/lib/admin/session";

export default async function ContentPage() {
  await requireAdminSession();
  const data = await getHeroSettings();
  const hero = {
    eyebrow: data?.hero_eyebrow ?? defaultContent.hero.eyebrow,
    title: data?.hero_title ?? defaultContent.hero.title,
    description: data?.hero_description ?? defaultContent.hero.description,
    quote: data?.hero_quote ?? defaultContent.hero.quote,
    imageUrl: data?.hero_image_url ?? defaultContent.hero.imageUrl,
  };

  const collections = ["Cronología", "Formación", "Nociones", "Experiencias", "Enfoque facial", "En primera persona", "Reflexiones"];
  return (
    <div>
      <PageHeading description="Edita los textos e imágenes sin modificar el código del sitio." title="Contenido" />
      <form action={saveHeroAction} className="mt-10 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Portada</p><h2 className="mt-1 font-display text-3xl">Mensaje principal</h2></div>
          <button className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white" type="submit">Guardar</button>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Texto superior<input className="rounded-xl border-primary/20" defaultValue={hero.eyebrow} name="heroEyebrow" required /></label>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Título<textarea className="min-h-28 rounded-xl border-primary/20" defaultValue={hero.title} name="heroTitle" required /></label>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Descripción<textarea className="min-h-28 rounded-xl border-primary/20" defaultValue={hero.description} name="heroDescription" required /></label>
          <label className="grid gap-2 text-sm font-semibold">Frase destacada<input className="rounded-xl border-primary/20" defaultValue={hero.quote} name="heroQuote" required /></label>
          <label className="grid gap-2 text-sm font-semibold">URL de imagen<input className="rounded-xl border-primary/20" defaultValue={hero.imageUrl} name="heroImageUrl" required type="url" /></label>
        </div>
      </form>
      <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-3xl">Secciones ordenables</h2>
        <p className="mt-2 text-sm text-slate-600">La estructura de datos ya está separada para activar edición, orden, borradores e historial en cada colección.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((name) => <div className="rounded-2xl border border-primary/10 p-4 text-sm font-semibold" key={name}>{name}</div>)}
        </div>
      </section>
    </div>
  );
}

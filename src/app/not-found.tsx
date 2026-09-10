import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-5xl">Esta página no existe</h1>
        <Link className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-white" href="/">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

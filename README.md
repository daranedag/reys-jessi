# Jessica Quiróz — Next.js BFF

Aplicación unificada para el sitio público y su panel de administración. Está preparada para desplegarse en Vercel con dos dominios:

- `nombredelsitio.cl`: sitio público y reservas.
- `admin.nombredelsitio.cl`: panel privado, servido por la misma aplicación.

## Componentes

- Next.js App Router para las páginas y el BFF.
- InsForge para autenticación, contenido y datos operacionales.
- Cal.com Cloud como motor de disponibilidad y reservas.
- Mercado Pago Checkout Pro para los pagos.
- ImageKit para imágenes del sitio y adjuntos de reservas.

## Desarrollo

1. Copia `.env.example` como `.env.local` y completa los valores.
2. Instala dependencias con `pnpm install`.
3. Inicia con `pnpm dev`.
4. Abre el sitio en `http://localhost:3000` y el panel en `http://admin.localhost:3000`.

Antes de publicar ejecuta:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Las instrucciones de puesta en marcha están en [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) y el diseño técnico en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

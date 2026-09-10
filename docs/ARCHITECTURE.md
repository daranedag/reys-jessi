# Arquitectura

## Un proyecto, dos experiencias

Vercel ejecuta una sola aplicación Next.js. `src/proxy.ts` detecta el subdominio `admin` y lo dirige internamente a las páginas de `src/app/admin`, manteniendo direcciones limpias como `admin.nombredelsitio.cl/content`.

El sitio público nunca recibe las claves privadas. Las páginas y las rutas BFF consultan InsForge con una credencial exclusiva del servidor. El panel usa sesiones SSR de InsForge y sus permisos se verifican de nuevo en cada operación de escritura.

## Flujo de reserva y pago

1. El sitio consulta horas libres al BFF; el BFF consulta Cal.com.
2. Al elegir una hora se crea una pre-reserva en InsForge.
3. El BFF crea una reserva `pending` en Cal.com. El tipo de evento debe usar `confirmationPolicy.type = always` y `blockUnconfirmedBookingsInBooker = true`.
4. Si hay imágenes, el navegador solicita una firma temporal y las sube directamente a ImageKit. Vercel no transporta los archivos.
5. El BFF crea la preferencia de Mercado Pago y dirige al cliente al checkout.
6. El webhook firmado de Mercado Pago consulta el pago en la API oficial. Si está aprobado, confirma la reserva de Cal.com y recién entonces marca la reserva local como confirmada.
7. Si el pago se rechaza, cancela o vence, se libera la reserva pendiente en Cal.com.
8. Los webhooks firmados de Cal.com sincronizan cancelaciones y reprogramaciones hechas fuera del sitio.

Los webhooks usan una bandeja persistente en InsForge. Cada entrega tiene estado, intentos y error; sólo queda procesada después de completar todas las operaciones. Esto permite reintentar una confirmación incompleta sin perder cambios posteriores del mismo pago.

## Contenido administrable

El contenido está separado por tipo: portada, cronología, cursos, nociones, experiencias, tratamientos, testimonios y reflexiones. Los cambios generan una revisión inmutable en `content_revisions`. La estructura deja preparados estados de publicación, orden, páginas legales, SEO y biblioteca de ImageKit.

## Seguridad

- No se concede acceso anónimo directo a las tablas.
- La lectura pública ocurre sólo a través del servidor Next.js.
- El panel usa RLS y roles `owner`/`editor`.
- Las claves de InsForge, Cal.com, Mercado Pago e ImageKit son variables privadas de Vercel.
- Mercado Pago se valida mediante `x-signature`; Cal.com mediante `x-cal-signature-256`.
- La tarea de expiración requiere `CRON_SECRET` y cancela primero en Cal.com antes de cerrar la pre-reserva local.

# Puesta en marcha

## 1. InsForge

El repositorio está vinculado al proyecto existente `jessiquiroz`. Actualmente el servicio está pausado, por lo que las migraciones no se deben aplicar hasta reactivarlo.

Después de reactivarlo:

1. Revisa el historial remoto con `npx -y @insforge/cli db migrations list`.
2. Aplica todas las migraciones pendientes con `npx -y @insforge/cli db migrations up --all`.
3. Crea la cuenta que administrará el sitio en InsForge Auth.
4. Inserta su UUID como primer propietario usando una sesión administrativa:

```sql
INSERT INTO public.admin_profiles(user_id, display_name, role)
VALUES ('UUID_DEL_USUARIO', 'Jessica Quiróz', 'owner');
```

No se incluyó un UUID ficticio en las migraciones para evitar otorgar permisos a la cuenta equivocada.

## 2. Cal.com Cloud

Por cada servicio crea o identifica un tipo de evento y anota su ID en el panel. Configura:

- Confirmación: siempre requerida.
- Bloquear horas sin confirmar en el calendario del cliente: activo.
- Duración y buffers iguales a los del servicio.
- Zona horaria: `America/Santiago`.

Crea un webhook hacia `https://nombredelsitio.cl/api/v1/webhooks/calcom` para cancelaciones, reprogramaciones, confirmaciones y rechazos. Usa el mismo secreto en `CAL_WEBHOOK_SECRET`.

## 3. Mercado Pago

Configura Checkout Pro y el webhook de pagos hacia:

`https://nombredelsitio.cl/api/v1/webhooks/mercadopago`

Copia el token de acceso y el secreto de firma a las variables privadas de Vercel. Prueba primero con credenciales de prueba.

## 4. ImageKit

Configura la clave pública, la clave privada y el URL endpoint. La clave privada queda sólo en Vercel. Los adjuntos se guardan bajo `/jessiquiroz/reservations/<id>` y el navegador limita a 6 imágenes JPEG, PNG o WebP de hasta 8 MB.

## 5. Vercel y DNS

Importa el repositorio como un proyecto Next.js en un plan Pro y agrega ambos dominios al mismo proyecto:

- `nombredelsitio.cl`
- `admin.nombredelsitio.cl`

Crea los registros DNS que Vercel indique y reemplaza `nombredelsitio.cl` en las variables de entorno. El cron incluido libera pre-reservas vencidas cada 10 minutos.

## 6. Verificación previa a producción

- Reserva con un pago de prueba aprobado y verifica la confirmación en Cal.com.
- Rechaza un pago y verifica que la hora quede libre.
- Reenvía el mismo webhook y confirma que no duplique reservas.
- Cancela y reprograma en Cal.com y confirma la sincronización del panel.
- Sube seis imágenes y verifica que ninguna atraviese el BFF.
- Comprueba que una cuenta sin `admin_profiles` no pueda abrir ni modificar el panel.

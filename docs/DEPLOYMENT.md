# Puesta en marcha

## 1. Neon Postgres y Neon Auth

El proyecto es `reys-jessi`, rama `production`, base `neondb`. La restauración del respaldo del 9 de noviembre está documentada en [Migraciones](../migrations/README.md).

Configura estas variables de producción en Vercel:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | URL privada de Neon del rol de aplicación `reys_app`. |
| `NEON_AUTH_BASE_URL` | URL de Neon Auth de la rama. |
| `NEON_AUTH_COOKIE_SECRET` | Secreto aleatorio de al menos 32 caracteres. |
| `ADMIN_EMAIL` | Correo de la primera cuenta administrativa. |

El SQL de [permisos del rol](../migrations/neon/20261118141500_app_role.sql) crea `reys_app` sin acceso de inicio de sesión. Ejecútalo como propietario de la base. En `psql`, usa `\password reys_app` para fijar la contraseña sin dejarla en el historial. Después ejecuta `ALTER ROLE reys_app LOGIN;` y guarda la URL de ese rol como `DATABASE_URL` sensible en Vercel.

En Neon Auth, usa verificación de correo por código al registrarse y al iniciar sesión con una cuenta sin verificar. Configura el proveedor SMTP de producción y registra el origen definitivo del panel como dominio de confianza. Para registrar al primer propietario, abre la pantalla de acceso, usa el correo de `ADMIN_EMAIL`, elige tu contraseña y pulsa **Crear mi cuenta administrativa**. Tras verificar el código e iniciar sesión, la aplicación vincula la identidad y crea el perfil `owner`. Otros perfiles deben estar registrados en `reys_admin_profiles`.

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
- Comprueba que una cuenta sin `reys_admin_profiles` no pueda abrir ni modificar el panel.

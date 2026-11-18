# Migraciones de Reys / Jessica Quiróz

## Restaurar el respaldo de noviembre de 2026 en Neon

Genera el SQL de restauración en una ruta temporal. El archivo contiene los datos de las reservas.

```powershell
$restoreFile = Join-Path $env:TEMP ('reys-neon-' + [guid]::NewGuid() + '.sql')
node scripts/prepare-neon-restore.mjs .\20261109_030829.sql.gz $restoreFile
```

Usa una base de Neon donde aún no existan las tablas `reys_`. Confirma el proyecto, la rama y la base de destino. Con la sesión de Neon autorizada y `psql` instalado, ejecuta desde PowerShell reemplazando los valores de ejemplo:

```powershell
neon psql RAMA --project-id PROYECTO --database-name BASE -- -f $restoreFile
```

La restauración ejecuta el esquema, los datos y la verificación de conteos en una transacción. Para este respaldo deben resultar 24 tablas y 63 filas. Los bloques `COPY` conservan los valores originales. El SQL incluye los índices, las claves foráneas entre tablas `reys_` y los triggers de `updated_at`.

El destino conserva RLS habilitado y la cuenta que restaura es propietaria de las tablas. Las referencias a `auth.users` se omiten y sus columnas UUID se conservan. El respaldo tiene cero perfiles administrativos, por lo que el panel requiere habilitar la autenticación de destino y vincular una cuenta a un perfil `owner` antes del despliegue.

## Migraciones históricas de InsForge

Los archivos SQL de esta carpeta crean exclusivamente objetos con prefijo `reys_` dentro de `public`, para convivir con los demás sistemas del proyecto compartido “DieGui Dev”. Se aplican en orden por su marca de tiempo.

El dump completo de la instancia anterior se conserva localmente en `source/20260725_020327.sql` y está ignorado por Git porque contiene datos personales y objetos internos de InsForge. No se debe importar directamente. `scripts/extract-reys-backup-data.mjs` extrae sólo las diez tablas de esta aplicación, conserva sus relaciones y genera SQL temporal bajo `.insforge/reys-restore-data`.

DieGui Dev 2.0.2 no expone el historial administrado de migraciones y bloquea funciones SQL personalizadas. Por eso `20260909190500_insforge-2-0-2-compat.sql` implementa RLS y timestamps con primitivas compatibles, mientras el BFF resuelve el claim de webhooks y las revisiones de contenido.

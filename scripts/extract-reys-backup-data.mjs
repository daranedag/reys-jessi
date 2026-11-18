import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const inputPath = path.resolve(projectRoot, process.argv[2] ?? "migrations/source/20260725_020327.sql");
const outputDirectory = path.resolve(projectRoot, process.argv[3] ?? ".insforge/reys-restore-data");

const restoreOrder = [
  "services",
  "availability_rules",
  "blackout_dates",
  "pre_reservations",
  "reservation_images",
  "payments",
  "bookings",
  "calendar_events",
  "webhook_events",
  "audit_logs",
];

const allowedTables = new Set(restoreOrder);
const dump = await readFile(inputPath, "utf8");
const lines = dump.split(/\r?\n/);
const copies = new Map();

for (let index = 0; index < lines.length; index += 1) {
  const header = lines[index].match(/^COPY public\.([a-z_]+) \(([^)]+)\) FROM stdin;$/);
  if (!header || !allowedTables.has(header[1])) continue;

  const [, table, columnList] = header;
  const columns = columnList.split(",").map((column) => column.trim());
  const rows = [];

  for (index += 1; index < lines.length && lines[index] !== "\\."; index += 1) {
    const values = lines[index].split("\t");
    if (values.length !== columns.length) {
      throw new Error(`COPY public.${table}: se esperaban ${columns.length} columnas y se encontraron ${values.length}`);
    }
    rows.push(values);
  }

  copies.set(table, { columns, rows });
}

await mkdir(outputDirectory, { recursive: true });

const sqlLiteral = (value) => {
  if (value === "\\N") return "NULL";
  return `E'${value.replaceAll("'", "''")}'`;
};

let restoredRows = 0;
for (const [position, table] of restoreOrder.entries()) {
  const copy = copies.get(table);
  if (!copy) throw new Error(`No se encontró COPY public.${table} en el backup`);

  const values = copy.rows.map((row) => `  (${row.map(sqlLiteral).join(", ")})`);
  const sql = values.length
    ? [
        `INSERT INTO public.reys_${table} (${copy.columns.join(", ")}) VALUES`,
        values.join(",\n"),
        "ON CONFLICT DO NOTHING;",
        "",
      ].join("\n")
    : `-- public.reys_${table}: el backup no contenía filas.\n`;

  const filename = `${String(position + 1).padStart(2, "0")}-reys-${table.replaceAll("_", "-")}.sql`;
  await writeFile(path.join(outputDirectory, filename), sql, "utf8");
  restoredRows += copy.rows.length;
  console.log(`${table}: ${copy.rows.length} fila(s)`);
}

console.log(`Total preparado: ${restoredRows} fila(s)`);

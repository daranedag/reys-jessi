import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";

const [dumpPath, outputPath, format] = process.argv.slice(2);
if (!dumpPath || !outputPath || dumpPath === outputPath ||
    (format !== undefined && format !== "--transaction-json")) {
  throw new Error("Uso: node scripts/prepare-neon-restore.mjs <respaldo.sql.gz> <salida> [--transaction-json]");
}

const source = createReadStream(dumpPath);
const input = dumpPath.endsWith(".gz") ? source.pipe(createGunzip()) : source;
source.on("error", (error) => input.destroy(error));
const lines = createInterface({ input, crlfDelay: Infinity });
const tables = new Map();
const copies = new Map();
const indexes = [];
const constraints = [];
const triggers = [];
const legacyAuthConstraints = [];
let copy;
let statement;

for await (const line of lines) {
  if (copy) {
    if (line === "\\.") {
      copy = undefined;
    } else if (copy.rows) {
      if (line.split("\t").length !== copy.columns.length) {
        throw new Error(`COPY con cantidad de columnas inválida en ${copy.table}`);
      }
      copy.rows.push(line);
    }
    continue;
  }

  if (line.startsWith("COPY ") && line.endsWith(" FROM stdin;")) {
    const match = /^COPY public\.(reys_[a-z0-9_]+) \(([^)]+)\) FROM stdin;$/.exec(line);
    if (line.startsWith("COPY public.reys_") && !match) throw new Error("COPY reys_ desconocido");
    if (!match) {
      copy = {};
      continue;
    }
    const [, table, columns] = match;
    if (copies.has(table)) throw new Error(`COPY duplicado en ${table}`);
    const columnNames = columns.split(",").map((column) => column.trim());
    if (columnNames.some((column) => !/^[a-z_][a-z0-9_]*$/.test(column))) {
      throw new Error(`Identificador de columna desconocido en ${table}`);
    }
    copy = { table, header: line, columns: columnNames, rows: [] };
    copies.set(table, copy);
    continue;
  }

  if (!statement) {
    const match = /^(CREATE TABLE|ALTER TABLE ONLY) public\.(reys_[a-z0-9_]+)\b/.exec(line);
    if (match) statement = { kind: match[1], table: match[2], lines: [] };
    else if (/^CREATE (?:UNIQUE )?INDEX reys_\w+ ON public\.reys_\w+ /.test(line)) {
      indexes.push(line);
    } else if (/^CREATE TRIGGER reys_\w+ .* ON public\.reys_\w+ /.test(line)) {
      if (!line.endsWith("EXECUTE FUNCTION system.update_updated_at();")) {
        throw new Error("El respaldo tiene un trigger reys_ sin adaptación a Neon");
      }
      triggers.push(line.replace("system.update_updated_at()", "public.reys_set_updated_at()"));
    }
  }

  if (!statement) continue;
  statement.lines.push(line);
  if (!line.endsWith(";")) continue;

  const ddl = statement.lines.join("\n");
  if (statement.kind === "CREATE TABLE") {
    if (tables.has(statement.table)) throw new Error(`Tabla duplicada: ${statement.table}`);
    tables.set(statement.table, ddl);
  } else if (ddl.includes("REFERENCES auth.users(id)")) {
    legacyAuthConstraints.push(statement.table);
  } else {
    const references = [...ddl.matchAll(/REFERENCES (\S+?)\(/g)];
    if (references.some(([, target]) => !/^public\.reys_[a-z0-9_]+$/.test(target))) {
      throw new Error(`Clave foránea externa no prevista en ${statement.table}`);
    }
    if (!/^    ADD CONSTRAINT /m.test(ddl)) throw new Error(`ALTER desconocido en ${statement.table}`);
    constraints.push(ddl);
  }
  statement = undefined;
}

if (copy || statement || tables.size === 0 || tables.size !== copies.size ||
    [...tables.keys()].some((table) => !copies.has(table))) {
  throw new Error("El respaldo está incompleto o no coincide el esquema con los bloques COPY");
}

const names = [...tables.keys()].sort();
const verification = names.map((table) => {
  const count = copies.get(table).rows.length;
  return `  IF (SELECT count(*) FROM public.${table}) <> ${count} THEN\n` +
    `    RAISE EXCEPTION 'Cantidad de filas inesperada en ${table}';\n  END IF;`;
});

const initialize = [
  "SET LOCAL client_encoding = 'UTF8';",
  "SET LOCAL standard_conforming_strings = on;",
  "SET LOCAL search_path = pg_catalog, public;",
  ...tables.values(),
];

const finalize = [
  ...constraints,
  ...indexes,
  `CREATE FUNCTION public.reys_set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;`,
  ...triggers,
  ...names.flatMap((table) => [
    `REVOKE ALL ON TABLE public.${table} FROM PUBLIC;`,
    `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`,
  ]),
  ["DO $$\nBEGIN", ...verification, "END;\n$$;"].join("\n"),
];

function copyValueToSql(value) {
  if (value === "\\N") return "NULL";
  const translations = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", "\\": "\\" };
  const decoded = value.replace(/\\(.)/g, (_, key) => {
    if (!Object.hasOwn(translations, key)) {
      throw new Error("Este escape de COPY requiere restaurar por psql");
    }
    return translations[key];
  });
  return `'${decoded.replaceAll("'", "''")}'`;
}

const data = names.flatMap((table) => {
  const { header, columns, rows } = copies.get(table);
  if (format !== "--transaction-json") return [header, ...rows, "\\."];
  if (!rows.length) return [];
  const values = rows.map((row) => `(${row.split("\t").map(copyValueToSql).join(", ")})`);
  return [`INSERT INTO public.${table} (${columns.join(", ")}) VALUES\n${values.join(",\n")};`];
});

const output = format === "--transaction-json"
  ? JSON.stringify([...initialize, ...data, ...finalize]).replace(/[^\x20-\x7e]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`)
  : ["\\set ON_ERROR_STOP on", "BEGIN;", ...initialize, ...data, ...finalize, "COMMIT;", ""].join("\n");

await writeFile(outputPath, output, { flag: "wx", mode: 0o600 });
console.table(names.map((table) => ({ table, rows: copies.get(table).rows.length })));
console.log(`${tables.size} tablas, ${[...copies.values()].reduce((sum, { rows }) => sum + rows.length, 0)} filas.`);
console.log(`${constraints.length} restricciones, ${indexes.length} índices y ${triggers.length} triggers.`);
console.log(`${legacyAuthConstraints.length} claves foráneas a auth.users omitidas. Sus columnas UUID se conservan.`);

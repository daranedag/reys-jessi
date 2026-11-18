import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { env, requireValue } from "@/lib/env";

let client: NeonQueryFunction<false, false> | undefined;

export async function sql<Row = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]) {
  client ??= neon(requireValue(env.databaseUrl, "DATABASE_URL"));
  return await client(strings, ...values) as Row[];
}

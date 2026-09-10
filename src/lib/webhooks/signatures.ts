import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "@/lib/api";

function safeHexEqual(received: string, expected: string) {
  if (!/^[a-f0-9]+$/i.test(received) || !/^[a-f0-9]+$/i.test(expected)) return false;
  const left = Buffer.from(received, "hex");
  const right = Buffer.from(expected, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyMercadoPagoSignature(input: {
  signature: string | null;
  requestId: string | null;
  dataId: string;
  secret: string;
}) {
  if (!input.signature || !input.requestId) throw new ApiError(401, "invalid_webhook_signature", "Falta la firma de Mercado Pago.");
  const parts = Object.fromEntries(input.signature.split(",").map((part) => part.trim().split("=", 2)));
  if (!parts.ts || !parts.v1) throw new ApiError(401, "invalid_webhook_signature", "La firma de Mercado Pago no es válida.");
  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", input.secret).update(manifest).digest("hex");
  if (!safeHexEqual(parts.v1, expected)) throw new ApiError(401, "invalid_webhook_signature", "La firma de Mercado Pago no es válida.");
}

export function verifyCalSignature(rawBody: string, received: string | null, secret: string) {
  if (!received) throw new ApiError(401, "invalid_webhook_signature", "Falta la firma de Cal.com.");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!safeHexEqual(received, expected)) throw new ApiError(401, "invalid_webhook_signature", "La firma de Cal.com no es válida.");
}

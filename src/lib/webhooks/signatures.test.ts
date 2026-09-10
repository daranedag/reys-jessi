import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyCalSignature, verifyMercadoPagoSignature } from "./signatures";

describe("firmas de webhooks", () => {
  it("acepta una firma válida de Mercado Pago", () => {
    const secret = "secret";
    const manifest = "id:42;request-id:req-1;ts:123;";
    const signature = createHmac("sha256", secret).update(manifest).digest("hex");
    expect(() => verifyMercadoPagoSignature({ signature: `ts=123,v1=${signature}`, requestId: "req-1", dataId: "42", secret })).not.toThrow();
  });

  it("rechaza una firma alterada de Mercado Pago", () => {
    expect(() => verifyMercadoPagoSignature({ signature: `ts=123,v1=${"a".repeat(64)}`, requestId: "req-1", dataId: "42", secret: "secret" })).toThrow();
  });

  it("acepta una firma válida de Cal.com", () => {
    const body = JSON.stringify({ triggerEvent: "BOOKING_CANCELLED" });
    const signature = createHmac("sha256", "secret").update(body).digest("hex");
    expect(() => verifyCalSignature(body, signature, "secret")).not.toThrow();
  });
});

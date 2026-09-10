import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { ApiError } from "@/lib/api";
import type { Service } from "@/lib/domain";
import { env, requireValue } from "@/lib/env";

function mercadoPagoClient() {
  return new MercadoPagoConfig({ accessToken: requireValue(env.mercadoPagoAccessToken, "MERCADOPAGO_ACCESS_TOKEN") });
}

export async function createMercadoPagoPreference(input: {
  preReservation: {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string | null;
    expires_at: string;
  };
  service: Service;
}) {
  const preference = new Preference(mercadoPagoClient());
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  const response = await preference.create({
    body: {
      items: [{
        id: input.service.id,
        title: input.service.name,
        description: input.service.description ?? undefined,
        quantity: 1,
        unit_price: Number(input.service.price_amount),
        currency_id: input.service.currency,
      }],
      payer: {
        name: input.preReservation.client_name,
        email: input.preReservation.client_email,
        phone: input.preReservation.client_phone ? { number: input.preReservation.client_phone } : undefined,
      },
      external_reference: input.preReservation.id,
      notification_url: `${siteUrl}/api/v1/webhooks/mercadopago`,
      back_urls: {
        success: `${siteUrl}/reserva/resultado?estado=aprobado`,
        pending: `${siteUrl}/reserva/resultado?estado=pendiente`,
        failure: `${siteUrl}/reserva/resultado?estado=fallido`,
      },
      auto_return: "approved",
      expires: true,
      expiration_date_to: input.preReservation.expires_at,
      metadata: { preReservationId: input.preReservation.id, serviceId: input.service.id },
    },
  });
  if (!response.id) throw new ApiError(502, "mercadopago_error", "Mercado Pago no devolvió una preferencia.");
  return response;
}

export async function getMercadoPagoPayment(paymentId: string) {
  return new Payment(mercadoPagoClient()).get({ id: paymentId });
}

const read = (name: string) => process.env[name]?.trim() || undefined;

export const env = {
  get siteUrl() {
    return read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
  },
  get adminUrl() {
    return read("NEXT_PUBLIC_ADMIN_URL") ?? "http://admin.localhost:3000";
  },
  get adminHost() {
    return read("ADMIN_HOST") ?? "admin.localhost:3000";
  },
  get insforgeBaseUrl() {
    return read("NEXT_PUBLIC_INSFORGE_BASE_URL");
  },
  get insforgeAnonKey() {
    return read("NEXT_PUBLIC_INSFORGE_ANON_KEY");
  },
  get insforgeApiKey() {
    return read("INSFORGE_API_KEY");
  },
  get calApiKey() {
    return read("CAL_API_KEY");
  },
  get calBaseUrl() {
    return read("CAL_API_BASE_URL") ?? "https://api.cal.com";
  },
  get calSlotsVersion() {
    return read("CAL_SLOTS_API_VERSION") ?? "2024-09-04";
  },
  get calBookingsVersion() {
    return read("CAL_BOOKINGS_API_VERSION") ?? "2026-02-25";
  },
  get calWebhookSecret() {
    return read("CAL_WEBHOOK_SECRET");
  },
  get mercadoPagoAccessToken() {
    return read("MERCADOPAGO_ACCESS_TOKEN");
  },
  get mercadoPagoWebhookSecret() {
    return read("MERCADOPAGO_WEBHOOK_SECRET");
  },
  get imageKitPrivateKey() {
    return read("IMAGEKIT_PRIVATE_KEY");
  },
  get imageKitPublicKey() {
    return read("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
  },
  get imageKitUrlEndpoint() {
    return read("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");
  },
  get cronSecret() {
    return read("CRON_SECRET");
  },
};

export function isInsforgePublicConfigured() {
  return Boolean(env.insforgeBaseUrl && env.insforgeAnonKey);
}

export function isInsforgeAdminConfigured() {
  return Boolean(env.insforgeBaseUrl && env.insforgeApiKey);
}

export function requireValue(value: string | undefined, label: string): string {
  if (!value) throw new Error(`${label} no está configurado`);
  return value;
}

import "server-only";
import ImageKit from "@imagekit/nodejs";
import { env, requireValue } from "@/lib/env";

export function getImageKitUploadAuthorization(preReservationId: string) {
  const client = imageKitClient();
  const expiresInFiveMinutes = Math.floor(Date.now() / 1000) + 5 * 60;
  return {
    ...client.helper.getAuthenticationParameters(undefined, expiresInFiveMinutes),
    publicKey: requireValue(env.imageKitPublicKey, "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY"),
    folder: `/jessiquiroz/reservations/${preReservationId}`,
  };
}

function imageKitClient() {
  return new ImageKit({ privateKey: requireValue(env.imageKitPrivateKey, "IMAGEKIT_PRIVATE_KEY") });
}

export function getImageKitFile(fileId: string) {
  return imageKitClient().files.get(fileId);
}

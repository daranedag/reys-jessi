import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { createInsforgeAdminClient } from "@/lib/insforge/admin";
import { getImageKitFile } from "@/lib/imagekit/client";
import { getAuthorizedPreReservation, reservationTokenFrom } from "@/lib/reservations/repository";

const schema = z.object({
  fileId: z.string().min(3).max(300),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reservation = await getAuthorizedPreReservation(id, reservationTokenFrom(request));
    if (!["draft", "awaiting_payment"].includes(reservation.status)) throw new ApiError(409, "uploads_closed", "Esta reserva ya no acepta imágenes.");
    const input = schema.parse(await request.json());
    const verified = await getImageKitFile(input.fileId);
    if (!verified.fileId || !verified.filePath || !verified.url) throw new ApiError(400, "invalid_image", "ImageKit no devolvió los datos completos de la imagen.");
    if (!verified.filePath?.startsWith(`/jessiquiroz/reservations/${id}/`)) throw new ApiError(400, "invalid_image_path", "La imagen no corresponde a esta reserva.");
    if (verified.fileType !== "image" || !verified.mime || !["image/jpeg", "image/png", "image/webp"].includes(verified.mime)) throw new ApiError(400, "invalid_image_type", "El archivo no es una imagen permitida.");
    if (!verified.size || verified.size > 8 * 1024 * 1024) throw new ApiError(400, "invalid_image_size", "La imagen supera el tamaño permitido.");
    if (!verified.isPrivateFile) throw new ApiError(400, "image_not_private", "La imagen debe guardarse como privada.");

    const client = createInsforgeAdminClient();
    const { count } = await client.database.from("reservation_images").select("id", { count: "exact", head: true }).eq("pre_reservation_id", id).eq("status", "active");
    if ((count ?? 0) >= 6) throw new ApiError(409, "image_limit", "Puedes adjuntar como máximo 6 imágenes.");
    const { data, error } = await client.database.from("reservation_images").insert([{
      pre_reservation_id: id,
      imagekit_file_id: verified.fileId,
      imagekit_path: verified.filePath,
      url: verified.url,
      mime_type: verified.mime,
      size_bytes: verified.size,
      width: verified.width ?? null,
      height: verified.height ?? null,
      status: "active",
    }]).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "invalid_image", message: "Los datos de la imagen no son válidos." } }, { status: 400 });
    return apiErrorResponse(error);
  }
}

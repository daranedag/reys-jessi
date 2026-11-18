import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { sql } from "@/lib/db";
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

    const [data] = await sql`
      INSERT INTO public.reys_reservation_images
        (pre_reservation_id, imagekit_file_id, imagekit_path, url, mime_type, size_bytes, width, height)
      SELECT ${id}::uuid, ${verified.fileId}, ${verified.filePath}, ${verified.url}, ${verified.mime},
             ${verified.size}, ${verified.width ?? null}, ${verified.height ?? null}
      WHERE (SELECT count(*) FROM public.reys_reservation_images
             WHERE pre_reservation_id = ${id} AND status = 'active') < 6
      RETURNING *
    `;
    if (!data) throw new ApiError(409, "image_limit", "Puedes adjuntar como máximo 6 imágenes.");
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "invalid_image", message: "Los datos de la imagen no son válidos." } }, { status: 400 });
    return apiErrorResponse(error);
  }
}

"use client";

import { useMemo, useState } from "react";
import type { Service, Slot } from "@/lib/domain";

type Props = { services: Service[] };
type Phase = "details" | "loading" | "redirecting";

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function BookingWizard({ services }: Props) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("details");
  const [message, setMessage] = useState("");
  const service = useMemo(() => services.find((item) => item.id === serviceId), [serviceId, services]);

  async function loadSlots(nextDate: string) {
    setDate(nextDate);
    setSlot("");
    setSlots([]);
    setMessage("");
    if (!serviceId || !nextDate) return;

    setPhase("loading");
    try {
      const from = new Date(`${nextDate}T00:00:00-03:00`).toISOString();
      const to = new Date(`${nextDate}T23:59:59-03:00`).toISOString();
      const response = await fetch(
        `/api/v1/availability?serviceId=${encodeURIComponent(serviceId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&timezone=America%2FSantiago`,
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "No pudimos consultar las horas.");
      setSlots(payload.data ?? []);
      if (!payload.data?.length) setMessage("No hay horas disponibles para ese día.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos consultar las horas.");
    } finally {
      setPhase("details");
    }
  }

  async function uploadImages(preReservationId: string, customerToken: string) {
    for (const file of files) {
      const authResponse = await fetch(`/api/v1/pre-reservations/${preReservationId}/imagekit-auth`, {
        method: "POST",
        headers: { "x-reservation-token": customerToken },
      });
      const authPayload = await authResponse.json();
      if (!authResponse.ok) throw new Error(authPayload.error?.message ?? "No pudimos preparar la imagen.");

      const uploadBody = new FormData();
      uploadBody.set("file", file);
      uploadBody.set("fileName", file.name);
      uploadBody.set("token", authPayload.data.token);
      uploadBody.set("expire", String(authPayload.data.expire));
      uploadBody.set("signature", authPayload.data.signature);
      uploadBody.set("publicKey", authPayload.data.publicKey);
      uploadBody.set("folder", authPayload.data.folder);
      uploadBody.set("useUniqueFileName", "true");
      uploadBody.set("isPrivateFile", "true");

      const uploadedResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: uploadBody,
      });
      const uploaded = await uploadedResponse.json();
      if (!uploadedResponse.ok) throw new Error(uploaded.message ?? "No pudimos subir una imagen.");

      const saveResponse = await fetch(`/api/v1/pre-reservations/${preReservationId}/images`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-reservation-token": customerToken },
        body: JSON.stringify({
          fileId: uploaded.fileId,
          filePath: uploaded.filePath,
          url: uploaded.url,
          mimeType: file.type,
          sizeBytes: uploaded.size,
          width: uploaded.width,
          height: uploaded.height,
        }),
      });
      if (!saveResponse.ok) throw new Error("La imagen se subió, pero no pudimos asociarla a tu reserva.");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");
    setPhase("loading");

    try {
      const response = await fetch("/api/v1/pre-reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceId,
          startsAt: slot,
          timezone: "America/Santiago",
          client: {
            fullName: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone") || undefined,
            notes: form.get("notes") || undefined,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "No pudimos crear la reserva.");

      const { preReservation, customerToken } = payload.data;
      await uploadImages(preReservation.id, customerToken);

      const paymentResponse = await fetch(`/api/v1/pre-reservations/${preReservation.id}/payment`, {
        method: "POST",
        headers: { "x-reservation-token": customerToken },
      });
      const paymentPayload = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(paymentPayload.error?.message ?? "No pudimos crear el pago.");
      const checkoutUrl = paymentPayload.data.initPoint ?? paymentPayload.data.sandboxInitPoint;
      if (!checkoutUrl) throw new Error("Mercado Pago no devolvió una dirección de pago.");
      sessionStorage.setItem("jq-reservation", JSON.stringify({ id: preReservation.id, customerToken }));
      setPhase("redirecting");
      window.location.assign(checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos completar la reserva.");
      setPhase("details");
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="bg-primary py-20 text-white" id="agendamiento">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Reserva personalizada</p>
          <h2 className="mt-4 font-display text-5xl leading-tight">Elige tu sesión y una hora disponible.</h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
            La agenda se consulta en Cal.com, pero toda la experiencia permanece dentro del sitio. El pago seguro se completa en Mercado Pago.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-white/80">
            <p>✓ Hora retenida mientras completas el pago</p>
            <p>✓ Confirmación automática tras la aprobación</p>
            <p>✓ Imágenes enviadas de forma segura a ImageKit</p>
          </div>
        </div>

        <form className="rounded-[2rem] bg-white p-6 text-ink shadow-2xl sm:p-9" onSubmit={submit}>
          {!services.length ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              Actualmente Jessica ofrece rejuvenecimiento facial. La reserva en línea se activará cuando estén confirmados su duración, valor y agenda.
            </div>
          ) : null}
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Servicio
              <select
                className="focus-ring rounded-xl border-primary/20"
                disabled={!services.length}
                onChange={(event) => {
                  setServiceId(event.target.value);
                  setDate("");
                  setSlots([]);
                  setSlot("");
                }}
                required
                value={serviceId}
              >
                {!services.length ? <option value="">Rejuvenecimiento facial · reserva próximamente</option> : null}
                {services.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.duration_minutes} min · {money.format(item.price_amount)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Fecha
              <input
                className="focus-ring rounded-xl border-primary/20"
                disabled={!serviceId}
                min={today}
                onChange={(event) => loadSlots(event.target.value)}
                required
                type="date"
                value={date}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Hora
              <select
                className="focus-ring rounded-xl border-primary/20"
                disabled={!slots.length}
                onChange={(event) => setSlot(event.target.value)}
                required
                value={slot}
              >
                <option value="">{phase === "loading" ? "Buscando…" : "Selecciona"}</option>
                {slots.map((item) => (
                  <option key={item.start} value={item.start}>
                    {new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago" }).format(new Date(item.start))}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nombre completo
              <input className="focus-ring rounded-xl border-primary/20" name="name" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Correo
              <input className="focus-ring rounded-xl border-primary/20" name="email" required type="email" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Teléfono
              <input className="focus-ring rounded-xl border-primary/20" name="phone" type="tel" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Imágenes (opcional)
              <input
                accept="image/jpeg,image/png,image/webp"
                className="focus-ring rounded-xl border-primary/20 text-xs"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 6))}
                type="file"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Cuéntame brevemente qué necesitas
              <textarea className="focus-ring min-h-28 rounded-xl border-primary/20" name="notes" />
            </label>
          </div>
          {message ? <p className="mt-5 rounded-xl bg-secondary/10 p-4 text-sm text-ink">{message}</p> : null}
          <button
            className="focus-ring mt-7 w-full rounded-full bg-accent px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!services.length || !slot || phase !== "details"}
            type="submit"
          >
            {phase === "redirecting" ? "Abriendo Mercado Pago…" : phase === "loading" ? "Preparando…" : `Continuar al pago${service ? ` · ${money.format(service.price_amount)}` : ""}`}
          </button>
        </form>
      </div>
    </section>
  );
}

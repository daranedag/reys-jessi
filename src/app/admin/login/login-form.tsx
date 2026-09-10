"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-semibold">
        Correo
        <input autoComplete="email" className="rounded-xl border-primary/20" name="email" required type="email" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Contraseña
        <input autoComplete="current-password" className="rounded-xl border-primary/20" minLength={8} name="password" required type="password" />
      </label>
      {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
      <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={pending} type="submit">
        {pending ? "Ingresando…" : "Ingresar al panel"}
      </button>
    </form>
  );
}

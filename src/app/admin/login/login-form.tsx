"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};
const field = "rounded-xl border-primary/20";
const button = "rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-50";

export function LoginForm({ canRegister }: { canRegister: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  return (
    <form action={formAction} className="mt-8 grid gap-5">
      {state.notice ? <p role="status">{state.notice}</p> : null}
      {state.verifyEmail ? (
        <>
          <input name="email" type="hidden" value={state.verifyEmail} />
          <label className="grid gap-2 text-sm font-semibold">
            Código de verificación
            <input autoComplete="one-time-code" className={field} inputMode="numeric" maxLength={6} name="otp" pattern="[0-9]{6}" required />
          </label>
        </>
      ) : (
        <>
          <label className="grid gap-2 text-sm font-semibold">
            Correo
            <input autoComplete="email" className={field} name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Contraseña
            <input autoComplete="current-password" className={field} minLength={8} name="password" required type="password" />
          </label>
        </>
      )}
      {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{state.error}</p> : null}
      <button className={button} disabled={pending} name="intent" type="submit" value={state.verifyEmail ? "verify" : "login"}>
        {state.verifyEmail ? "Verificar correo" : "Ingresar al panel"}
      </button>
      {state.verifyEmail ? (
        <button className="text-sm font-semibold text-primary disabled:opacity-50" disabled={pending} formNoValidate name="intent" type="submit" value="cancel">
          Volver al inicio de sesión
        </button>
      ) : null}
      {!state.verifyEmail && canRegister ? (
        <button className="text-sm font-semibold text-primary disabled:opacity-50" disabled={pending} name="intent" type="submit" value="register">
          Crear mi cuenta administrativa
        </button>
      ) : null}
    </form>
  );
}

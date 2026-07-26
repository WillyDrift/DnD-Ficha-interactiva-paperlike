"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { inviteUser } from "./actions";

export default function AdminClient({ profiles }: { profiles: Profile[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | null
    | {
        link: string;
        email: string;
        emailAttempted: boolean;
        alreadyExisted: boolean;
      }
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);
    const res = await inviteUser(email);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult({
      link: res.link,
      email: email.trim().toLowerCase(),
      emailAttempted: res.emailAttempted,
      alreadyExisted: res.alreadyExisted,
    });
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="space-y-8">
      {/* Invitar */}
      <section className="frame p-5">
        <h2 className="flabel flabel-sm mb-3">Invitar a un jugador</h2>
        <form onSubmit={onInvite} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="block flex-1">
            <span className="flabel flabel-xs">Email del invitado</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amigo@correo.com"
              className="sheet-input sheet-underline text-left py-1 mt-1"
            />
          </label>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Generando…" : "Generar invitación"}
          </button>
        </form>

        {error && (
          <p className="text-sm mt-3" style={{ color: "#a11" }}>
            {error}
          </p>
        )}

        {result && (
          <div className="mt-4 rounded-lg border border-neutral-400/60 p-4 bg-[color-mix(in_srgb,var(--detail)_5%,transparent)]">
            <p className="text-sm mb-2">
              Invitación lista para <strong>{result.email}</strong>
              {result.alreadyExisted && " (la cuenta ya existía; enlace regenerado)"}.
            </p>
            <p className="text-sm mb-2 opacity-80">
              Copia este enlace y envíaselo (WhatsApp, Telegram, email…). Al abrirlo
              podrá crear su contraseña y entrar.
            </p>
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={result.link}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 text-xs px-2 py-2 rounded border border-neutral-400/60 bg-white/40 font-mono"
              />
              <button onClick={copyLink} className="btn">
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="text-xs mt-3 opacity-60">
              Nota: el envío automático por email no es fiable en el plan gratuito de
              Supabase, por eso te damos el enlace directo. (Se puede activar el envío
              por email configurando un proveedor SMTP.)
            </p>
          </div>
        )}
      </section>

      {/* Usuarios */}
      <section className="frame p-5">
        <h2 className="flabel flabel-sm mb-3">Cuentas ({profiles.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-400/50">
                <th className="py-2 pr-3 flabel flabel-xs">Email</th>
                <th className="py-2 pr-3 flabel flabel-xs">Rol</th>
                <th className="py-2 pr-3 flabel flabel-xs">Estado</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-neutral-300/40">
                  <td className="py-2 pr-3">{p.email}</td>
                  <td className="py-2 pr-3">
                    {p.role === "admin" ? "Administrador" : "Jugador"}
                  </td>
                  <td className="py-2 pr-3">
                    {p.last_sign_in_at ? (
                      <span className="opacity-70">Activa</span>
                    ) : (
                      <span style={{ color: "#a67c00" }}>Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

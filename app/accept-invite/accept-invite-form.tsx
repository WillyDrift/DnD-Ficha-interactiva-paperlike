"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Phase = "loading" | "confirm" | "setpw" | "invalid";

export default function AcceptInviteForm({
  tokenHash,
  otpType,
}: {
  tokenHash: string | null;
  otpType: string;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // NO verificamos el token al cargar (un GET de un escáner de enlaces
  // consumiría el token de un solo uso). Solo mostramos el estado.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setEmail(data.session.user.email ?? null);
        setPhase("setpw");
      } else if (tokenHash) {
        setPhase("confirm");
      } else {
        setPhase("invalid");
      }
    });
  }, [tokenHash]);

  async function onConfirm() {
    if (!tokenHash) {
      setPhase("invalid");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type: (otpType as EmailOtpType) || "recovery",
      token_hash: tokenHash,
    });
    setLoading(false);
    if (error || !data.session) {
      setPhase("invalid");
      return;
    }
    setEmail(data.session.user.email ?? null);
    setPhase("setpw");
  }

  async function onSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("No se pudo guardar la contraseña. Vuelve a abrir el enlace.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (phase === "loading") {
    return <p className="text-center opacity-70">Un momento…</p>;
  }

  if (phase === "invalid") {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: "#a11" }}>
          Este enlace no es válido o ya se ha usado.
        </p>
        <p className="text-sm opacity-70">
          Pide a tu administrador que te genere una invitación nueva.
        </p>
        <Link href="/login" className="btn w-full">
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  if (phase === "confirm") {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm opacity-80">
          Pulsa el botón para activar tu cuenta y elegir tu contraseña.
        </p>
        {error && (
          <p className="text-sm" style={{ color: "#a11" }}>
            {error}
          </p>
        )}
        <button
          onClick={onConfirm}
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Activando…" : "Continuar"}
        </button>
      </div>
    );
  }

  // phase === "setpw"
  return (
    <form onSubmit={onSetPassword} className="space-y-4">
      {email && (
        <p className="text-sm text-center opacity-80">
          Cuenta: <strong>{email}</strong>
        </p>
      )}
      <label className="block">
        <span className="flabel flabel-sm">Nueva contraseña</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="sheet-input sheet-underline text-left py-1 mt-1"
        />
      </label>
      <label className="block">
        <span className="flabel flabel-sm">Repite la contraseña</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          className="sheet-input sheet-underline text-left py-1 mt-1"
        />
      </label>

      {error && (
        <p className="text-sm" style={{ color: "#a11" }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Guardando…" : "Crear cuenta y entrar"}
      </button>
    </form>
  );
}

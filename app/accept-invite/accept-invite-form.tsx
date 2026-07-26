"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInviteForm() {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setChecking(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
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
      setError("No se pudo guardar la contraseña. Prueba a abrir el enlace de nuevo.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (checking) {
    return <p className="text-center opacity-70">Comprobando invitación…</p>;
  }

  if (!email) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: "#a11" }}>
          Este enlace no es válido o ha caducado.
        </p>
        <p className="text-sm opacity-70">
          Pide a tu administrador que te reenvíe la invitación.
        </p>
        <Link href="/login" className="btn w-full">
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-center opacity-80">
        Cuenta: <strong>{email}</strong>
      </p>
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

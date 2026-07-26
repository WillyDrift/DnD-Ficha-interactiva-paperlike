"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  redirect,
  error: initialError,
}: {
  redirect: string;
  error?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.push(redirect || "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="flabel flabel-sm">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sheet-input sheet-underline text-left py-1 mt-1"
        />
      </label>
      <label className="block">
        <span className="flabel flabel-sm">Contraseña</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="sheet-input sheet-underline text-left py-1 mt-1"
        />
      </label>

      {error && (
        <p className="text-sm" style={{ color: "#a11" }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-xs opacity-60 text-center pt-2">
        El acceso es solo por invitación. Pide a tu administrador que te invite.
      </p>
    </form>
  );
}

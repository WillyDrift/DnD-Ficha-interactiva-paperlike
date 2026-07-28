"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

export default function AppHeader({
  email,
  isAdmin,
}: {
  email: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="w-full border-b border-neutral-300 bg-[#efe6d0] text-[#2b2b2b]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flabel text-xl tracking-widest">
          Fichas D&amp;D
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/browse" className="btn btn-ghost">
            <FiSearch />
            <span className="hidden sm:inline">Buscar personajes</span>
          </Link>
          {isAdmin && (
            <Link href="/admin" className="btn btn-ghost">
              Administración
            </Link>
          )}
          {email && <span className="hidden sm:inline opacity-70">{email}</span>}
          <button onClick={logout} className="btn">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}

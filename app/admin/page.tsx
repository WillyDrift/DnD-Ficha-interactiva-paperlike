import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/app-header";
import AdminClient from "./admin-client";
import type { Profile } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.app_metadata as { role?: string } | undefined)?.role;
  if (!user) redirect("/login");
  if (role !== "admin") redirect("/");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,email,role,created_at,last_sign_in_at")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen paper">
      <AppHeader email={user.email ?? null} isAdmin={true} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="flabel text-2xl mb-1">Administración</h1>
        <p className="text-sm opacity-70 mb-6">
          Invita a nuevos jugadores y gestiona las cuentas.
        </p>
        <AdminClient profiles={(profiles ?? []) as Profile[]} />
      </main>
    </div>
  );
}

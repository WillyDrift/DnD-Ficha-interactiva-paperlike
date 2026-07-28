import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/app-header";
import BrowseClient, { type BrowseRow } from "@/components/browse-client";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = (user.app_metadata as { role?: string } | undefined)?.role;

  const { data: rows } = await supabase.rpc("browse_characters");

  return (
    <div className="min-h-screen paper">
      <AppHeader email={user.email ?? null} isAdmin={role === "admin"} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <BrowseClient rows={(rows ?? []) as BrowseRow[]} />
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/app-header";
import CharacterList from "@/components/character-list";
import type { Character } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = (user.app_metadata as { role?: string } | undefined)?.role;

  const { data: characters } = await supabase
    .from("characters")
    .select("id,name,race,class,level,avatar_url,avatar_thumb_url,colors,updated_at")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen paper">
      <AppHeader email={user.email ?? null} isAdmin={role === "admin"} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <CharacterList
          characters={(characters ?? []) as Partial<Character>[]}
        />
      </main>
    </div>
  );
}

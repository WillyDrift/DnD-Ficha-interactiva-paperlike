import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeSheet } from "@/lib/sheet";
import ReadOnlySheet from "@/components/editor/read-only-sheet";
import type { Character } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BrowseCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS: solo devuelve la ficha si es pública o propia
  const { data: character, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !character) notFound();

  const initial: Character = {
    ...(character as Character),
    data: normalizeSheet(character.data),
  };

  return <ReadOnlySheet initial={initial} />;
}

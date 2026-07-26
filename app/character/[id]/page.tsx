import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeSheet } from "@/lib/sheet";
import Editor from "@/components/editor/editor";
import type { Character } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CharacterPage({
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

  return <Editor initial={initial} />;
}

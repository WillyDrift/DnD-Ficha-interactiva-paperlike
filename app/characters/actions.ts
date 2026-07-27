"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { defaultSheet, DEFAULT_COLORS, normalizeSheet } from "@/lib/sheet";
import type { Colors } from "@/lib/types";

export async function createCharacter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: user.id,
      name: "",
      race: "",
      class: "",
      level: "",
      data: defaultSheet(),
      colors: DEFAULT_COLORS,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/character/${data.id}`);
}

export async function deleteCharacter(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Borrar avatar del Storage (best-effort)
  await supabase.storage.from("avatars").remove([
    `${user.id}/${id}.png`,
    `${user.id}/${id}.jpg`,
    `${user.id}/${id}.jpeg`,
    `${user.id}/${id}.webp`,
    `${user.id}/${id}-full.jpg`,
  ]);

  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function importCharacter(payload: {
  name?: string;
  race?: string;
  class?: string;
  level?: string;
  colors?: Colors;
  data?: unknown;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sheet = normalizeSheet(payload?.data);
  const colors: Colors =
    payload?.colors &&
    typeof payload.colors.bg === "string" &&
    typeof payload.colors.detail === "string" &&
    typeof payload.colors.highlight === "string"
      ? payload.colors
      : DEFAULT_COLORS;

  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: user.id,
      name: (payload?.name ?? "").toString().slice(0, 120),
      race: (payload?.race ?? "").toString().slice(0, 120),
      class: (payload?.class ?? "").toString().slice(0, 120),
      level: (payload?.level ?? "").toString().slice(0, 40),
      data: sheet,
      colors,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/character/${data.id}`);
}

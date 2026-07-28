import { notFound } from "next/navigation";
import Editor from "@/components/editor/editor";
import ReadOnlySheet from "@/components/editor/read-only-sheet";
import { defaultSheet, DEFAULT_COLORS, newId } from "@/lib/sheet";
import type { Character } from "@/lib/types";

export const dynamic = "force-dynamic";

// Vista previa SOLO para desarrollo: permite ver/editar la ficha sin login ni
// base de datos (no guarda nada). No accesible en producción.
export default async function DevPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ ro?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const sp = await searchParams;

  const data = defaultSheet();
  data.background = "Artesano gremial";
  data.alignment = "Caótico bueno";
  data.abilities.str = { score: "18", mod: "+4" };
  data.abilities.con = { score: "16", mod: "+3" };
  data.saves.str = { prof: true, value: "+7" };
  data.saves.con = { prof: true, value: "+6" };
  data.skills.atletismo = { prof: true, value: "+7" };
  data.skills.intimidacion = { prof: true, value: "+3" };
  data.armorClass = "15";
  data.initiative = "+2";
  data.speed = "12 m";
  data.hpMax = "32";
  data.hpCurrent = "32";
  data.hitDice = "3d12";
  data.attacks[0] = { ...data.attacks[0], name: "Hacha a dos manos", bonus: "+7", damage: "1d12+4", types: ["slashing"] };
  data.attacks[1] = { ...data.attacks[1], name: "Aliento gélido", bonus: "+5", damage: "2d6", types: ["cold", "force"] };
  data.equipment = [
    { id: newId(), icon: "GiBattleAxe", text: "Hacha a dos manos" },
    { id: newId(), icon: "GiAnvil", text: "Herramientas de herrero" },
    { id: newId(), icon: "GiBackpack", text: "Mochila de aventurero" },
    { id: newId(), icon: "GiWaterFlask", text: "Odre de agua" },
  ];
  data.features = [
    { id: newId(), icon: "GiBullHorns", text: "Embestida" },
    { id: newId(), icon: "GiMuscleUp", text: "Furia (3/descanso largo)" },
    { id: newId(), icon: null, text: "Defensa sin armadura" },
  ];
  data.otherProficiencies = [
    { id: newId(), icon: "GiAnvil", text: "Herramientas de herrero" },
    { id: newId(), icon: null, text: "Común, Gigante" },
  ];

  const sample: Character = {
    id: "dev-preview",
    user_id: "dev",
    name: "Osborne",
    race: "Minotauro",
    class: "Bárbaro",
    level: "3",
    avatar_url:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iIzNhMjQxNyIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9Ijk1IiByPSI0OCIgZmlsbD0iI2M5YTI0YiIvPjxyZWN0IHg9IjU1IiB5PSIxNTAiIHdpZHRoPSIxMzAiIGhlaWdodD0iOTAiIHJ4PSIyNiIgZmlsbD0iIzdhMWYxZiIvPjwvc3ZnPg==",
    avatar_thumb_url: null,
    is_public: true,
    colors: DEFAULT_COLORS,
    data,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return sp.ro ? (
    <ReadOnlySheet initial={sample} />
  ) : (
    <Editor initial={sample} devMode />
  );
}

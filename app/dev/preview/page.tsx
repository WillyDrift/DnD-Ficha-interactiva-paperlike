import { notFound } from "next/navigation";
import Editor from "@/components/editor/editor";
import { defaultSheet, DEFAULT_COLORS, newId } from "@/lib/sheet";
import type { Character } from "@/lib/types";

export const dynamic = "force-dynamic";

// Vista previa SOLO para desarrollo: permite ver/editar la ficha sin login ni
// base de datos (no guarda nada). No accesible en producción.
export default function DevPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

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
    avatar_url: null,
    colors: DEFAULT_COLORS,
    data,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <Editor initial={sample} devMode />;
}

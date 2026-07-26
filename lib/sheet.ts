// ============================================================
// Modelo de datos de la ficha (sin cálculos automáticos).
// Todo es texto/estado libre que el jugador rellena a mano.
// ============================================================

export type IconLine = {
  id: string;
  icon: string | null; // nombre del icono (react-icons/gi), p. ej. "GiBattleAxe"
  text: string;
};

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITIES: { key: AbilityKey; label: string; abbr: string }[] = [
  { key: "str", label: "Fuerza", abbr: "FUE" },
  { key: "dex", label: "Destreza", abbr: "DES" },
  { key: "con", label: "Constitución", abbr: "CON" },
  { key: "int", label: "Inteligencia", abbr: "INT" },
  { key: "wis", label: "Sabiduría", abbr: "SAB" },
  { key: "cha", label: "Carisma", abbr: "CAR" },
];

export const SKILLS: { key: string; label: string; ability: string }[] = [
  { key: "acrobacias", label: "Acrobacias", ability: "Des" },
  { key: "atletismo", label: "Atletismo", ability: "Fue" },
  { key: "arcano", label: "C. Arcano", ability: "Int" },
  { key: "engano", label: "Engaño", ability: "Car" },
  { key: "historia", label: "Historia", ability: "Int" },
  { key: "interpretacion", label: "Interpretación", ability: "Car" },
  { key: "intimidacion", label: "Intimidación", ability: "Car" },
  { key: "investigacion", label: "Investigación", ability: "Int" },
  { key: "juego_manos", label: "Juego de Manos", ability: "Des" },
  { key: "medicina", label: "Medicina", ability: "Sab" },
  { key: "naturaleza", label: "Naturaleza", ability: "Int" },
  { key: "percepcion", label: "Percepción", ability: "Sab" },
  { key: "perspicacia", label: "Perspicacia", ability: "Sab" },
  { key: "persuasion", label: "Persuasión", ability: "Car" },
  { key: "religion", label: "Religión", ability: "Int" },
  { key: "sigilo", label: "Sigilo", ability: "Des" },
  { key: "supervivencia", label: "Supervivencia", ability: "Sab" },
  { key: "trato_animales", label: "T. con Animales", ability: "Sab" },
];

export type ProfValue = { prof: boolean; value: string };
export type AbilityValue = { score: string; mod: string };

export type Attack = {
  id: string;
  name: string;
  bonus: string;
  damage: string;
  types: string[]; // claves de tipos de daño (ver lib/damage.ts)
};

export type SpellRow = { id: string; prepared: boolean; name: string };
export type SpellLevel = {
  level: number; // 1..9
  slotsTotal: string;
  slotsExpended: string;
  spells: SpellRow[];
};

export type SheetData = {
  version: 1;

  // --- Cabecera pág. 1 (nombre/raza/clase/nivel son columnas de la fila) ---
  background: string;
  playerName: string;
  alignment: string;
  xp: string;

  // --- Características y competencia ---
  abilities: Record<AbilityKey, AbilityValue>;
  inspiration: string;
  proficiencyBonus: string;

  // --- Salvaciones y habilidades ---
  saves: Record<AbilityKey, ProfValue>;
  skills: Record<string, ProfValue>;
  passivePerception: string;
  otherProficiencies: IconLine[];

  // --- Combate ---
  armorClass: string;
  initiative: string;
  speed: string;
  hpMax: string;
  hpCurrent: string;
  hpTemp: string;
  hitDiceTotal: string;
  hitDice: string;
  deathSuccess: [boolean, boolean, boolean];
  deathFail: [boolean, boolean, boolean];
  attacks: Attack[];
  attacksNotes: IconLine[];

  // --- Equipo ---
  coins: { pc: string; pp: string; pe: string; po: string; ppt: string };
  equipment: IconLine[];

  // --- Rasgos (columna derecha pág.1) ---
  personality: IconLine[];
  ideals: IconLine[];
  bonds: IconLine[];
  flaws: IconLine[];
  features: IconLine[];

  // --- Página 2 ---
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  appearance: string;
  backstory: string;
  allies: IconLine[];
  orgName: string;
  additionalFeatures: IconLine[];
  treasure: IconLine[];

  // --- Página 3 (conjuros) ---
  spellClass: string;
  spellAbility: string;
  spellSaveDC: string;
  spellAttackBonus: string;
  cantrips: IconLine[];
  spellLevels: SpellLevel[];
};

// --- Helpers ---

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function emptyLine(): IconLine {
  return { id: newId(), icon: null, text: "" };
}

function emptyLines(n: number): IconLine[] {
  return Array.from({ length: n }, () => emptyLine());
}

export function defaultSheet(): SheetData {
  const abilities = {} as Record<AbilityKey, AbilityValue>;
  const saves = {} as Record<AbilityKey, ProfValue>;
  for (const a of ABILITIES) {
    abilities[a.key] = { score: "", mod: "" };
    saves[a.key] = { prof: false, value: "" };
  }
  const skills: Record<string, ProfValue> = {};
  for (const s of SKILLS) skills[s.key] = { prof: false, value: "" };

  const spellLevels: SpellLevel[] = [];
  for (let lvl = 1; lvl <= 9; lvl++) {
    const rows = lvl <= 2 ? 13 : lvl <= 5 ? 13 : 9;
    spellLevels.push({
      level: lvl,
      slotsTotal: "",
      slotsExpended: "",
      spells: Array.from({ length: rows }, () => ({
        id: newId(),
        prepared: false,
        name: "",
      })),
    });
  }

  return {
    version: 1,
    background: "",
    playerName: "",
    alignment: "",
    xp: "",
    abilities,
    inspiration: "",
    proficiencyBonus: "",
    saves,
    skills,
    passivePerception: "",
    otherProficiencies: emptyLines(4),
    armorClass: "",
    initiative: "",
    speed: "",
    hpMax: "",
    hpCurrent: "",
    hpTemp: "",
    hitDiceTotal: "",
    hitDice: "",
    deathSuccess: [false, false, false],
    deathFail: [false, false, false],
    attacks: Array.from({ length: 3 }, () => ({
      id: newId(),
      name: "",
      bonus: "",
      damage: "",
      types: [],
    })),
    attacksNotes: emptyLines(3),
    coins: { pc: "", pp: "", pe: "", po: "", ppt: "" },
    equipment: emptyLines(4),
    personality: emptyLines(2),
    ideals: emptyLines(1),
    bonds: emptyLines(1),
    flaws: emptyLines(1),
    features: emptyLines(4),
    age: "",
    height: "",
    weight: "",
    eyes: "",
    skin: "",
    hair: "",
    appearance: "",
    backstory: "",
    allies: emptyLines(3),
    orgName: "",
    additionalFeatures: emptyLines(4),
    treasure: emptyLines(3),
    spellClass: "",
    spellAbility: "",
    spellSaveDC: "",
    spellAttackBonus: "",
    cantrips: emptyLines(6),
    spellLevels,
  };
}

export const DEFAULT_COLORS = {
  bg: "#efe6d0",
  detail: "#2b2b2b",
  highlight: "#7a1f1f",
};

export const COLOR_PRESETS: { name: string; colors: typeof DEFAULT_COLORS }[] = [
  { name: "Pergamino", colors: { bg: "#efe6d0", detail: "#2b2b2b", highlight: "#7a1f1f" } },
  { name: "Bosque", colors: { bg: "#e7ecdf", detail: "#233524", highlight: "#3f6b3a" } },
  { name: "Arcano", colors: { bg: "#e9e6f2", detail: "#241b3a", highlight: "#6b3fa0" } },
  { name: "Hierro", colors: { bg: "#e6e8ea", detail: "#1f2933", highlight: "#3a6b8a" } },
  { name: "Oscuro", colors: { bg: "#2a2622", detail: "#e8dfce", highlight: "#c9a24b" } },
];

// Migra/normaliza datos guardados hacia el esquema actual (por si faltan campos).
export function normalizeSheet(raw: unknown): SheetData {
  const base = defaultSheet();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const merged: SheetData = { ...base, ...(r as Partial<SheetData>) } as SheetData;

  // Sub-objetos que deben mantener todas las claves:
  merged.abilities = { ...base.abilities, ...(r.abilities as object) } as SheetData["abilities"];
  merged.saves = { ...base.saves, ...(r.saves as object) } as SheetData["saves"];
  merged.skills = { ...base.skills, ...(r.skills as object) } as SheetData["skills"];
  merged.coins = { ...base.coins, ...(r.coins as object) } as SheetData["coins"];
  if (!Array.isArray(merged.spellLevels) || merged.spellLevels.length !== 9) {
    merged.spellLevels = base.spellLevels;
  }
  // Asegura que cada ataque tenga el campo `types` (datos antiguos)
  if (Array.isArray(merged.attacks)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    merged.attacks = merged.attacks.map((a: any) => ({
      id: a?.id ?? newId(),
      name: a?.name ?? "",
      bonus: a?.bonus ?? "",
      damage: a?.damage ?? "",
      types: Array.isArray(a?.types) ? a.types : [],
    }));
  }
  merged.version = 1;
  return merged;
}

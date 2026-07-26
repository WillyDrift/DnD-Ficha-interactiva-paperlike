import type { IconType } from "react-icons";
import {
  GiCrush,
  GiSaberSlash,
  GiArrowhead,
  GiFlame,
  GiSnowflake1,
  GiAcid,
  GiLightningArc,
  GiSonicBoom,
  GiMightyForce,
  GiDeathSkull,
  GiSunbeams,
  GiPsychicWaves,
  GiPoison,
} from "react-icons/gi";

export type DamageCat = "Físicos" | "Mágicos y elementales";
export type DamageType = {
  key: string;
  label: string;
  cat: DamageCat;
  Icon: IconType;
};

// Tipos de daño de D&D 5e con su icono
export const DAMAGE_TYPES: DamageType[] = [
  { key: "bludgeoning", label: "Contundente", cat: "Físicos", Icon: GiCrush },
  { key: "slashing", label: "Cortante", cat: "Físicos", Icon: GiSaberSlash },
  { key: "piercing", label: "Perforante", cat: "Físicos", Icon: GiArrowhead },
  { key: "fire", label: "Fuego", cat: "Mágicos y elementales", Icon: GiFlame },
  { key: "cold", label: "Frío", cat: "Mágicos y elementales", Icon: GiSnowflake1 },
  { key: "acid", label: "Ácido", cat: "Mágicos y elementales", Icon: GiAcid },
  { key: "lightning", label: "Relámpago", cat: "Mágicos y elementales", Icon: GiLightningArc },
  { key: "thunder", label: "Trueno", cat: "Mágicos y elementales", Icon: GiSonicBoom },
  { key: "force", label: "Fuerza", cat: "Mágicos y elementales", Icon: GiMightyForce },
  { key: "necrotic", label: "Necrótico", cat: "Mágicos y elementales", Icon: GiDeathSkull },
  { key: "radiant", label: "Radiante", cat: "Mágicos y elementales", Icon: GiSunbeams },
  { key: "psychic", label: "Psíquico", cat: "Mágicos y elementales", Icon: GiPsychicWaves },
  { key: "poison", label: "Veneno", cat: "Mágicos y elementales", Icon: GiPoison },
];

export const DAMAGE_MAP: Record<string, DamageType> = Object.fromEntries(
  DAMAGE_TYPES.map((d) => [d.key, d])
);

export const DAMAGE_CATS: DamageCat[] = ["Físicos", "Mágicos y elementales"];

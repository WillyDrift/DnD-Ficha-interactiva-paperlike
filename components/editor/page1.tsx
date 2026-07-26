"use client";

import { ABILITIES, SKILLS, type AbilityKey } from "@/lib/sheet";
import { useSheet } from "./sheet-context";
import { Frame, AbilityBox, Dot, StatBox } from "./fields";
import {
  SInput,
  SList,
  SaveRow,
  SkillRow,
  HField,
  TInput,
  THeaderField,
} from "./connected";
import SheetHeader from "./sheet-header";

export default function Page1() {
  return (
    <div>
      <SheetHeader meta={<Page1Meta />} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        <LeftColumn />
        <MiddleColumn />
        <RightColumn />
      </div>
    </div>
  );
}

function Page1Meta() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 h-full content-center">
      <ClassLevelCell />
      <HField k="background" label="Trasfondo" />
      <HField k="playerName" label="Nombre del jugador" />
      <THeaderField field="race" label="Raza" />
      <HField k="alignment" label="Alineamiento" />
      <HField k="xp" label="Puntos de experiencia" numeric />
    </div>
  );
}

function ClassLevelCell() {
  return (
    <div className="flex flex-col">
      <div className="flex items-end gap-1 sheet-underline">
        <TInput field="class" className="flex-1" center placeholder="Clase" />
        <TInput field="level" className="w-9" center placeholder="Niv" />
      </div>
      <span className="flabel flabel-xs text-center mt-0.5 opacity-80">
        Clase y nivel
      </span>
    </div>
  );
}

/* ---------------- Columna izquierda ---------------- */
function LeftColumn() {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-6 w-[86px] pt-1">
        {ABILITIES.map((a) => (
          <AbilityCell key={a.key} k={a.key} label={a.label} />
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <SmallBox k="inspiration" label="Inspiración" />
        <SmallBox k="proficiencyBonus" label="Bonificador por competencia" />
        <Frame title="Tiradas de salvación" className="px-3 pt-2 pb-5">
          <div className="flex flex-col gap-1">
            {ABILITIES.map((a) => (
              <SaveRow key={a.key} k={a.key} label={a.label} />
            ))}
          </div>
        </Frame>
        <Frame title="Habilidades" className="px-3 pt-2 pb-5">
          <div className="flex flex-col gap-1">
            {SKILLS.map((s) => (
              <SkillRow key={s.key} k={s.key} label={s.label} ability={s.ability} />
            ))}
          </div>
        </Frame>
        <SmallBox k="passivePerception" label="Sabiduría (Percepción) pasiva" />
        <Frame title="Otras competencias e idiomas" className="px-3 pt-2 pb-5 min-h-[130px]">
          <SList k="otherProficiencies" minRows={4} dense />
        </Frame>
      </div>
    </div>
  );
}

function AbilityCell({ k, label }: { k: AbilityKey; label: string }) {
  const { state, setData } = useSheet();
  const ab = state.data.abilities[k];
  return (
    <AbilityBox
      label={label}
      mod={ab.mod}
      score={ab.score}
      onMod={(v) =>
        setData(
          (s) => ({
            ...s,
            abilities: { ...s.abilities, [k]: { ...s.abilities[k], mod: v } },
          }),
          `ab-${k}-mod`
        )
      }
      onScore={(v) =>
        setData(
          (s) => ({
            ...s,
            abilities: { ...s.abilities, [k]: { ...s.abilities[k], score: v } },
          }),
          `ab-${k}-score`
        )
      }
    />
  );
}

function SmallBox({ k, label }: { k: "inspiration" | "proficiencyBonus" | "passivePerception"; label: string }) {
  return (
    <div className="frame flex items-center gap-2 px-2 py-1.5">
      <div className="w-9 flex-shrink-0">
        <SInput k={k} />
      </div>
      <span className="flabel flabel-xs flex-1 leading-tight">{label}</span>
    </div>
  );
}

/* ---------------- Columna central ---------------- */
function MiddleColumn() {
  const { state, setData } = useSheet();
  const d = state.data;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <StatBoxConnected k="armorClass" label="Clase de armadura" shape="shield" />
        <StatBoxConnected k="initiative" label="Iniciativa" />
        <StatBoxConnected k="speed" label="Velocidad" />
      </div>

      <Frame title="Puntos de golpe actuales" className="px-3 pt-2 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="flabel flabel-xs whitespace-nowrap">PG máximos</span>
          <div className="flex-1 sheet-underline">
            <SInput k="hpMax" />
          </div>
        </div>
        <input
          value={d.hpCurrent}
          onChange={(e) => setData((s) => ({ ...s, hpCurrent: e.target.value }), "hpCurrent")}
          aria-label="Puntos de golpe actuales"
          className="sheet-field text-center text-3xl py-2"
        />
      </Frame>

      <Frame title="Puntos de golpe temporales" className="px-3 pt-2 pb-5">
        <input
          value={d.hpTemp}
          onChange={(e) => setData((s) => ({ ...s, hpTemp: e.target.value }), "hpTemp")}
          aria-label="Puntos de golpe temporales"
          className="sheet-field text-center text-2xl py-1"
        />
      </Frame>

      <div className="grid grid-cols-2 gap-2">
        <Frame title="Dados de golpe" className="px-3 pt-2 pb-5">
          <div className="flex items-center gap-1 text-xs mb-1">
            <span className="opacity-70">Total</span>
            <div className="flex-1 sheet-underline">
              <SInput k="hitDiceTotal" center={false} />
            </div>
          </div>
          <input
            value={d.hitDice}
            onChange={(e) => setData((s) => ({ ...s, hitDice: e.target.value }), "hitDice")}
            aria-label="Dados de golpe"
            className="sheet-field text-center text-xl"
          />
        </Frame>
        <Frame title="Salvaciones contra muerte" className="px-3 pt-2 pb-5">
          <DeathRow label="Éxitos" which="deathSuccess" />
          <DeathRow label="Fallos" which="deathFail" />
        </Frame>
      </div>

      <AttacksBlock />
      <EquipmentBlock />
    </div>
  );
}

function StatBoxConnected({
  k,
  label,
  shape,
}: {
  k: "armorClass" | "initiative" | "speed";
  label: string;
  shape?: "box" | "shield";
}) {
  const { state, setData } = useSheet();
  return (
    <StatBox
      label={label}
      shape={shape}
      value={state.data[k]}
      onChange={(v) => setData((s) => ({ ...s, [k]: v }), k)}
    />
  );
}

function DeathRow({
  label,
  which,
}: {
  label: string;
  which: "deathSuccess" | "deathFail";
}) {
  const { state, setData } = useSheet();
  const arr = state.data[which];
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="flabel flabel-xs">{label}</span>
      <div className="flex gap-1.5">
        {arr.map((on, i) => (
          <Dot
            key={i}
            on={on}
            onToggle={() =>
              setData((s) => {
                const next = [...s[which]] as [boolean, boolean, boolean];
                next[i] = !next[i];
                return { ...s, [which]: next };
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function AttacksBlock() {
  const { state, setData } = useSheet();
  const attacks = state.data.attacks;
  const set = (id: string, field: "name" | "bonus" | "damage", v: string) =>
    setData(
      (s) => ({
        ...s,
        attacks: s.attacks.map((a) => (a.id === id ? { ...a, [field]: v } : a)),
      }),
      `atk-${id}-${field}`
    );
  const add = () =>
    setData((s) => ({
      ...s,
      attacks: [
        ...s.attacks,
        { id: crypto.randomUUID(), name: "", bonus: "", damage: "" },
      ],
    }));
  return (
    <Frame title="Ataques y lanzamiento de conjuros" className="px-3 pt-2 pb-5">
      <div className="grid grid-cols-[1fr_52px_1fr] gap-1 hl-bar px-1 py-0.5 rounded">
        <span className="flabel flabel-xs">Nombre</span>
        <span className="flabel flabel-xs text-center">Bonif.</span>
        <span className="flabel flabel-xs">Daño/Tipo</span>
      </div>
      {attacks.map((a) => (
        <div key={a.id} className="grid grid-cols-[1fr_52px_1fr] gap-1 border-b border-[var(--line)]">
          <input value={a.name} onChange={(e) => set(a.id, "name", e.target.value)} className="sheet-field text-left px-1 py-0.5" aria-label="Nombre del ataque" />
          <input value={a.bonus} onChange={(e) => set(a.id, "bonus", e.target.value)} className="sheet-field text-center py-0.5" aria-label="Bonificador" />
          <input value={a.damage} onChange={(e) => set(a.id, "damage", e.target.value)} className="sheet-field text-left px-1 py-0.5" aria-label="Daño y tipo" />
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs mt-1 opacity-60 hover:opacity-100">
        + Añadir ataque
      </button>
      <div className="mt-2">
        <SList k="attacksNotes" minRows={2} dense placeholder="Notas, conjuros, munición…" />
      </div>
    </Frame>
  );
}

function EquipmentBlock() {
  const { state, setData } = useSheet();
  const coins = state.data.coins;
  const setCoin = (key: keyof typeof coins, v: string) =>
    setData((s) => ({ ...s, coins: { ...s.coins, [key]: v } }), `coin-${key}`);
  const coinDefs: { key: keyof typeof coins; label: string }[] = [
    { key: "pc", label: "PC" },
    { key: "pp", label: "PP" },
    { key: "pe", label: "PE" },
    { key: "po", label: "PO" },
    { key: "ppt", label: "PPT" },
  ];
  return (
    <Frame title="Equipo" className="px-3 pt-2 pb-5">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 w-16 flex-shrink-0">
          {coinDefs.map((c) => (
            <div key={c.key} className="flex items-center gap-1">
              <span className="flabel flabel-xs w-7">{c.label}</span>
              <input
                value={coins[c.key]}
                onChange={(e) => setCoin(c.key, e.target.value)}
                className="sheet-field flex-1 text-center border-b border-[var(--line)]"
                aria-label={`Monedas ${c.label}`}
              />
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <SList k="equipment" minRows={5} dense placeholder="Hacha a dos manos, cota de mallas…" />
        </div>
      </div>
    </Frame>
  );
}

/* ---------------- Columna derecha ---------------- */
function RightColumn() {
  return (
    <div className="flex flex-col gap-3">
      <Frame title="Rasgos de personalidad" className="px-3 pt-2 pb-5">
        <SList k="personality" minRows={2} dense />
      </Frame>
      <Frame title="Ideales" className="px-3 pt-2 pb-5">
        <SList k="ideals" minRows={2} dense />
      </Frame>
      <Frame title="Vínculos" className="px-3 pt-2 pb-5">
        <SList k="bonds" minRows={2} dense />
      </Frame>
      <Frame title="Defectos" className="px-3 pt-2 pb-5">
        <SList k="flaws" minRows={2} dense />
      </Frame>
      <Frame title="Rasgos y atributos" className="px-3 pt-2 pb-5 min-h-[280px]">
        <SList k="features" minRows={7} dense />
      </Frame>
    </div>
  );
}

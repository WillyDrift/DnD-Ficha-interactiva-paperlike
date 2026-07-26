"use client";

import { FiX, FiPlus } from "react-icons/fi";
import { newId } from "@/lib/sheet";
import { useSheet } from "./sheet-context";
import { Frame, Dot } from "./fields";
import { SInput, SList } from "./connected";
import SheetHeader from "./sheet-header";

export default function Page3() {
  const { state, setData } = useSheet();
  return (
    <div>
      <SheetHeader
        bannerLabel="Clase lanzadora de conjuros"
        banner={
          <input
            value={state.data.spellClass}
            onChange={(e) =>
              setData((s) => ({ ...s, spellClass: e.target.value }), "spellClass")
            }
            placeholder="—"
            aria-label="Clase lanzadora de conjuros"
            className="sheet-field text-center flabel !text-xl md:!text-2xl w-full"
          />
        }
        meta={
          <div className="grid grid-cols-3 gap-x-3 gap-y-2 h-full content-center">
            <SpellStat k="spellAbility" label="Aptitud mágica" />
            <SpellStat k="spellSaveDC" label="CD tirada de salvación" />
            <SpellStat k="spellAttackBonus" label="Bonif. ataque de conjuros" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        <div className="flex flex-col gap-3">
          <Frame title="Trucos (nivel 0)" className="px-3 pt-2 pb-5">
            <SList k="cantrips" minRows={6} dense placeholder="Nombre del truco" />
          </Frame>
          <SpellLevelBlock idx={0} />
          <SpellLevelBlock idx={1} />
        </div>
        <div className="flex flex-col gap-3">
          <SpellLevelBlock idx={2} />
          <SpellLevelBlock idx={3} />
          <SpellLevelBlock idx={4} />
        </div>
        <div className="flex flex-col gap-3">
          <SpellLevelBlock idx={5} />
          <SpellLevelBlock idx={6} />
          <SpellLevelBlock idx={7} />
          <SpellLevelBlock idx={8} />
        </div>
      </div>
    </div>
  );
}

function SpellStat({
  k,
  label,
}: {
  k: "spellAbility" | "spellSaveDC" | "spellAttackBonus";
  label: string;
}) {
  return (
    <div className="frame flex flex-col items-center px-2 py-2">
      <SInput k={k} />
      <span className="flabel flabel-xs text-center mt-1 leading-tight">{label}</span>
    </div>
  );
}

function SpellLevelBlock({ idx }: { idx: number }) {
  const { state, setData } = useSheet();
  const lvl = state.data.spellLevels[idx];

  const setField = (field: "slotsTotal" | "slotsExpended", v: string) =>
    setData(
      (s) => ({
        ...s,
        spellLevels: s.spellLevels.map((l, i) =>
          i === idx ? { ...l, [field]: v } : l
        ),
      }),
      `slvl-${idx}-${field}`
    );

  const setSpellName = (spellId: string, v: string) =>
    setData(
      (s) => ({
        ...s,
        spellLevels: s.spellLevels.map((l, i) =>
          i === idx
            ? { ...l, spells: l.spells.map((sp) => (sp.id === spellId ? { ...sp, name: v } : sp)) }
            : l
        ),
      }),
      `spname-${spellId}`
    );

  const togglePrepared = (spellId: string) =>
    setData((s) => ({
      ...s,
      spellLevels: s.spellLevels.map((l, i) =>
        i === idx
          ? {
              ...l,
              spells: l.spells.map((sp) =>
                sp.id === spellId ? { ...sp, prepared: !sp.prepared } : sp
              ),
            }
          : l
      ),
    }));

  const removeSpell = (spellId: string) =>
    setData((s) => ({
      ...s,
      spellLevels: s.spellLevels.map((l, i) =>
        i === idx ? { ...l, spells: l.spells.filter((sp) => sp.id !== spellId) } : l
      ),
    }));

  const addSpell = () =>
    setData((s) => ({
      ...s,
      spellLevels: s.spellLevels.map((l, i) =>
        i === idx
          ? { ...l, spells: [...l.spells, { id: newId(), prepared: false, name: "" }] }
          : l
      ),
    }));

  return (
    <Frame className="px-3 pt-2 pb-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flabel flex items-center justify-center h-7 w-7 rounded-md text-sm flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--highlight) 20%, transparent)" }}
        >
          {lvl.level}
        </span>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <label className="flex flex-col">
            <input
              value={lvl.slotsTotal}
              onChange={(e) => setField("slotsTotal", e.target.value)}
              className="sheet-field text-center border-b border-[var(--line-strong)]"
              aria-label="Espacios totales"
            />
            <span className="flabel flabel-xs text-center opacity-80 mt-0.5">
              Espacios totales
            </span>
          </label>
          <label className="flex flex-col">
            <input
              value={lvl.slotsExpended}
              onChange={(e) => setField("slotsExpended", e.target.value)}
              className="sheet-field text-center border-b border-[var(--line-strong)]"
              aria-label="Espacios gastados"
            />
            <span className="flabel flabel-xs text-center opacity-80 mt-0.5">
              Espacios gastados
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {lvl.spells.map((sp) => (
          <div key={sp.id} className="group flex items-center gap-2">
            <Dot on={sp.prepared} onToggle={() => togglePrepared(sp.id)} title="Preparado" />
            <input
              value={sp.name}
              onChange={(e) => setSpellName(sp.id, e.target.value)}
              className="sheet-field text-left flex-1 min-w-0 py-0.5 border-b border-[var(--line)]"
              aria-label="Nombre del conjuro"
            />
            <button
              type="button"
              onClick={() => removeSpell(sp.id)}
              aria-label="Quitar conjuro"
              className="p-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100"
            >
              <FiX size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addSpell}
        className="mt-1 text-xs flex items-center gap-1 opacity-60 hover:opacity-100"
      >
        <FiPlus size={12} /> Añadir conjuro
      </button>
    </Frame>
  );
}

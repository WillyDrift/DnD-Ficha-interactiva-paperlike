"use client";

import { useSheet } from "./sheet-context";
import { LineInput, RuledTextArea, Dot, HeaderField } from "./fields";
import IconBulletList from "./icon-bullet-list";
import type { AbilityKey, IconLine, SheetData } from "@/lib/sheet";

/* eslint-disable @typescript-eslint/no-explicit-any */

type StrKey = keyof SheetData;

export function SInput({
  k,
  numeric,
  center = true,
  placeholder,
  className,
  big,
  ariaLabel,
}: {
  k: StrKey;
  numeric?: boolean;
  center?: boolean;
  placeholder?: string;
  className?: string;
  big?: boolean;
  ariaLabel?: string;
}) {
  const { state, setData } = useSheet();
  const d = state.data as any;
  return (
    <LineInput
      value={(d[k] as string) ?? ""}
      onChange={(v) => setData((s) => ({ ...(s as any), [k]: v }), String(k))}
      numeric={numeric}
      center={center}
      placeholder={placeholder}
      className={className}
      big={big}
      ariaLabel={ariaLabel}
    />
  );
}

export function SArea({
  k,
  rows,
  placeholder,
}: {
  k: StrKey;
  rows?: number;
  placeholder?: string;
}) {
  const { state, setData } = useSheet();
  const d = state.data as any;
  return (
    <RuledTextArea
      value={(d[k] as string) ?? ""}
      onChange={(v) => setData((s) => ({ ...(s as any), [k]: v }), String(k))}
      rows={rows}
      placeholder={placeholder}
    />
  );
}

export function SList({
  k,
  placeholder,
  minRows,
  dense,
}: {
  k: StrKey;
  placeholder?: string;
  minRows?: number;
  dense?: boolean;
}) {
  const { state, setData } = useSheet();
  const d = state.data as any;
  return (
    <IconBulletList
      lines={(d[k] as IconLine[]) ?? []}
      onChange={(next, ck) =>
        setData((s) => ({ ...(s as any), [k]: next }), ck)
      }
      placeholder={placeholder}
      minRows={minRows}
      dense={dense}
    />
  );
}

export function HField({
  k,
  label,
  numeric,
}: {
  k: StrKey;
  label: string;
  numeric?: boolean;
}) {
  const { state, setData } = useSheet();
  const d = state.data as any;
  return (
    <HeaderField
      label={label}
      value={(d[k] as string) ?? ""}
      onChange={(v) => setData((s) => ({ ...(s as any), [k]: v }), String(k))}
      numeric={numeric}
    />
  );
}

/* ---- Fila de tirada de salvación (punto + valor + nombre) ---- */
export function SaveRow({ k, label }: { k: AbilityKey; label: string }) {
  const { state, setData } = useSheet();
  const sv = state.data.saves[k] ?? { prof: false, value: "" };
  return (
    <div className="flex items-center gap-2 text-sm">
      <Dot
        on={sv.prof}
        onToggle={() =>
          setData((s) => ({
            ...s,
            saves: { ...s.saves, [k]: { ...s.saves[k], prof: !sv.prof } },
          }))
        }
        title={`Competente en ${label}`}
      />
      <input
        value={sv.value}
        onChange={(e) =>
          setData(
            (s) => ({
              ...s,
              saves: { ...s.saves, [k]: { ...s.saves[k], value: e.target.value } },
            }),
            `sv-${k}`
          )
        }
        className="sheet-field w-8 text-center border-b border-[var(--line)]"
        aria-label={`${label} salvación`}
      />
      <span>{label}</span>
    </div>
  );
}

/* ---- Fila de habilidad (punto + valor + nombre + característica) ---- */
export function SkillRow({
  k,
  label,
  ability,
}: {
  k: string;
  label: string;
  ability: string;
}) {
  const { state, setData } = useSheet();
  const sk = (state.data.skills as any)[k] ?? { prof: false, value: "" };
  return (
    <div className="flex items-center gap-2 text-sm">
      <Dot
        on={sk.prof}
        onToggle={() =>
          setData((s) => ({
            ...s,
            skills: { ...s.skills, [k]: { ...s.skills[k], prof: !sk.prof } },
          }))
        }
        title={`Competente en ${label}`}
      />
      <input
        value={sk.value}
        onChange={(e) =>
          setData(
            (s) => ({
              ...s,
              skills: { ...s.skills, [k]: { ...s.skills[k], value: e.target.value } },
            }),
            `sk-${k}`
          )
        }
        className="sheet-field w-8 text-center border-b border-[var(--line)]"
        aria-label={`${label} habilidad`}
      />
      <span className="flex-1">
        {label} <span className="opacity-55">({ability})</span>
      </span>
    </div>
  );
}

/* ---- Campos de nivel superior (nombre/raza/clase/nivel) ---- */
type TopKey = "name" | "race" | "class" | "level";

export function TInput({
  field,
  className,
  big,
  placeholder,
  center = false,
}: {
  field: TopKey;
  className?: string;
  big?: boolean;
  placeholder?: string;
  center?: boolean;
}) {
  const { state, setTop } = useSheet();
  return (
    <LineInput
      value={state[field] ?? ""}
      onChange={(v) => setTop({ [field]: v }, field)}
      className={className}
      big={big}
      placeholder={placeholder}
      center={center}
    />
  );
}

export function THeaderField({ field, label }: { field: TopKey; label: string }) {
  const { state, setTop } = useSheet();
  return (
    <HeaderField
      label={label}
      value={state[field] ?? ""}
      onChange={(v) => setTop({ [field]: v }, field)}
    />
  );
}

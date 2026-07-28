"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch, FiLock } from "react-icons/fi";
import { GiDiceTwentyFacesTwenty } from "react-icons/gi";
import type { Colors } from "@/lib/types";
import type { SheetData } from "@/lib/sheet";
import { DEFAULT_COLORS } from "@/lib/sheet";

export type BrowseRow = {
  id: string;
  name: string;
  race: string;
  class: string;
  level: string;
  avatar_url: string | null;
  avatar_thumb_url: string | null;
  colors: Colors | null;
  data: SheetData;
  owner: string;
  is_mine: boolean;
  is_public: boolean;
  updated_at: string;
};

function strip(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Recoge los textos escritos por el usuario dentro de la ficha (ignora ids e iconos).
function collectStrings(v: unknown, out: string[]) {
  if (typeof v === "string") {
    out.push(v);
  } else if (Array.isArray(v)) {
    for (const x of v) collectStrings(x, out);
  } else if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (k === "icon" || k === "id") continue;
      collectStrings(val, out);
    }
  }
}

export default function BrowseClient({ rows }: { rows: BrowseRow[] }) {
  const [q, setQ] = useState("");
  const [userF, setUserF] = useState("");
  const [classF, setClassF] = useState("");
  const [raceF, setRaceF] = useState("");

  const uniq = (vals: string[]) =>
    Array.from(new Set(vals.map((v) => v.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "es")
    );

  const owners = useMemo(() => uniq(rows.map((r) => r.owner)), [rows]);
  const classes = useMemo(() => uniq(rows.map((r) => r.class)), [rows]);
  const races = useMemo(() => uniq(rows.map((r) => r.race)), [rows]);

  // Índice de búsqueda por fila (nombre + textos de la ficha), sin acentos
  const searchIndex = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      const parts: string[] = [r.name, r.race, r.class, r.level, r.owner];
      collectStrings(r.data, parts);
      map.set(r.id, strip(parts.join("  ")));
    }
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    const nq = strip(q.trim());
    return rows.filter((r) => {
      if (userF && r.owner !== userF) return false;
      if (classF && r.class !== classF) return false;
      if (raceF && r.race !== raceF) return false;
      if (nq && !(searchIndex.get(r.id) ?? "").includes(nq)) return false;
      return true;
    });
  }, [rows, q, userF, classF, raceF, searchIndex]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <h1 className="flabel text-2xl">Buscar personajes</h1>
        <span className="text-sm opacity-60">
          {filtered.length} de {rows.length}
        </span>
      </div>
      <p className="text-sm opacity-70 mb-5">
        Todos los personajes públicos de la aplicación (solo lectura).
      </p>

      {/* Buscador + filtros */}
      <div className="frame p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 sheet-underline pb-1">
          <FiSearch className="opacity-60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o dentro de la ficha (equipo, rasgos, historia…)"
            className="sheet-field text-left flex-1"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterSelect label="Usuario" value={userF} onChange={setUserF} options={owners} />
          <FilterSelect label="Clase" value={classF} onChange={setClassF} options={classes} />
          <FilterSelect label="Raza" value={raceF} onChange={setRaceF} options={races} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="frame p-10 text-center">
          <GiDiceTwentyFacesTwenty className="mx-auto mb-3" size={44} />
          <p className="opacity-75">No hay personajes que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <BrowseCard key={r.id} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flabel flabel-xs opacity-80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-[var(--line-strong)] bg-transparent px-2 py-1.5 text-sm"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function BrowseCard({ row }: { row: BrowseRow }) {
  const colors = row.colors ?? DEFAULT_COLORS;
  const style = {
    ["--bg" as string]: colors.bg,
    ["--detail" as string]: colors.detail,
    ["--highlight" as string]: colors.highlight,
  } as React.CSSProperties;
  const name = row.name?.trim() || "Sin nombre";
  const meta = [row.race, row.class, row.level ? `Nivel ${row.level}` : ""]
    .filter(Boolean)
    .join(" · ");
  const img = row.avatar_thumb_url ?? row.avatar_url;

  return (
    <Link
      href={`/browse/${row.id}`}
      style={style}
      className="paper frame p-4 flex items-center gap-4 relative group"
    >
      <div
        className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-[3px] transition-transform duration-200 ease-out group-hover:scale-[1.12]"
        style={{
          borderColor: "var(--highlight)",
          background: "color-mix(in srgb, var(--detail) 10%, transparent)",
        }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="flabel text-2xl">{name.charAt(0).toUpperCase() || "?"}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flabel text-lg leading-tight truncate">{name}</div>
        <div className="text-sm opacity-75 truncate">{meta || "—"}</div>
        <div className="text-xs opacity-55 truncate mt-0.5">por {row.owner || "—"}</div>
      </div>
      {row.is_mine && !row.is_public && (
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] opacity-70"
          title="Privada (solo tú la ves)"
        >
          <FiLock size={11} /> privada
        </span>
      )}
    </Link>
  );
}

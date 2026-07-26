"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { ICON_MAP, CATEGORIES, searchIcons } from "@/lib/icons";

export function Icon({
  name,
  size,
  className,
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  if (!name) return null;
  const C = ICON_MAP[name];
  if (!C) return null;
  return <C size={size} className={className} />;
}

export default function IconPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCat(null);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(
    () => (open ? searchIcons(query, cat ?? undefined) : []),
    [open, query, cat]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-xl bg-[var(--bg)] text-[var(--detail)] shadow-2xl border-2"
        style={{ borderColor: "var(--detail)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-3 border-b border-[var(--line-strong)]">
          <FiSearch />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar icono… (hacha, yunque, cuerno, pócima…)"
            className="flex-1 bg-transparent outline-none"
          />
          <button className="btn btn-ghost !p-1" onClick={onClose} aria-label="Cerrar">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex gap-1 flex-wrap p-2 border-b border-[var(--line-strong)]">
          <Chip active={cat === null} onClick={() => setCat(null)}>
            Todos
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>

        <div className="p-3 overflow-y-auto">
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="mb-3 text-sm underline opacity-70 hover:opacity-100"
          >
            Quitar icono
          </button>
          {results.length === 0 ? (
            <p className="opacity-60 text-sm">Sin resultados para “{query}”.</p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {results.map((m) => {
                const C = ICON_MAP[m.name];
                return (
                  <button
                    key={m.name}
                    title={m.kw.split(" ").slice(0, 3).join(" ")}
                    onClick={() => {
                      onSelect(m.name);
                      onClose();
                    }}
                    className="aspect-square flex items-center justify-center rounded-lg border border-[var(--line-strong)] hover:bg-[color-mix(in_srgb,var(--highlight)_18%,transparent)] transition"
                  >
                    <C size={26} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2 py-1 rounded-full border transition"
      style={{
        borderColor: "var(--line-strong)",
        background: active
          ? "color-mix(in srgb, var(--highlight) 22%, transparent)"
          : "transparent",
      }}
    >
      {children}
    </button>
  );
}

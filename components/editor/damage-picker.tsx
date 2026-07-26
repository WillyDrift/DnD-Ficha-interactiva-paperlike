"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { DAMAGE_TYPES, DAMAGE_MAP, DAMAGE_CATS } from "@/lib/damage";

export function DamageIcon({
  typeKey,
  size = 14,
}: {
  typeKey: string;
  size?: number;
}) {
  const d = DAMAGE_MAP[typeKey];
  if (!d) return null;
  const I = d.Icon;
  return <I size={size} title={d.label} />;
}

export default function DamageTypePicker({
  open,
  onClose,
  selected,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onToggle: (key: string) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl bg-[var(--bg)] text-[var(--detail)] shadow-2xl border-2"
        style={{ borderColor: "var(--detail)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-[var(--line-strong)]">
          <h3 className="flabel flabel-sm">Tipo(s) de daño</h3>
          <button className="btn btn-ghost !p-1" onClick={onClose} aria-label="Cerrar">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-3 space-y-4">
          {DAMAGE_CATS.map((cat) => (
            <div key={cat}>
              <div className="flabel flabel-xs opacity-70 mb-1.5">{cat}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DAMAGE_TYPES.filter((d) => d.cat === cat).map((d) => {
                  const on = selected.includes(d.key);
                  const I = d.Icon;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => onToggle(d.key)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg border text-sm transition"
                      style={{
                        borderColor: on ? "var(--highlight)" : "var(--line-strong)",
                        background: on
                          ? "color-mix(in srgb, var(--highlight) 20%, transparent)"
                          : "transparent",
                      }}
                    >
                      <I size={20} style={{ color: "var(--highlight)" }} />
                      <span className="truncate">{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-xs opacity-60">
            Puedes elegir varios. Pulsa fuera o Esc para cerrar.
          </p>
        </div>
      </div>
    </div>
  );
}

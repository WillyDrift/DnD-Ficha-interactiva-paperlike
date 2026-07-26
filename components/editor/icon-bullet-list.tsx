"use client";

import { useEffect, useRef, useState } from "react";
import { FiPlus, FiX, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { GiPlainCircle } from "react-icons/gi";
import type { IconLine } from "@/lib/sheet";
import { newId } from "@/lib/sheet";
import IconPicker, { Icon } from "./icon-picker";

export default function IconBulletList({
  lines,
  onChange,
  onCommitHint,
  placeholder = "Escribe aquí…",
  minRows = 1,
  dense = false,
}: {
  lines: IconLine[];
  onChange: (next: IconLine[], coalesceKey?: string) => void;
  onCommitHint?: string;
  placeholder?: string;
  minRows?: number;
  dense?: boolean;
}) {
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const rows =
    lines.length >= minRows
      ? lines
      : [
          ...lines,
          ...Array.from({ length: minRows - lines.length }, () => ({
            id: newId(),
            icon: null,
            text: "",
          })),
        ];

  useEffect(() => {
    if (focusId && inputs.current[focusId]) {
      inputs.current[focusId]!.focus();
      setFocusId(null);
    }
  }, [focusId]);

  function setText(id: string, text: string) {
    onChange(
      rows.map((l) => (l.id === id ? { ...l, text } : l)),
      `line-${id}`
    );
  }
  function setIcon(id: string, icon: string | null) {
    onChange(rows.map((l) => (l.id === id ? { ...l, icon } : l)));
  }
  function addAfter(index: number) {
    const nl: IconLine = { id: newId(), icon: null, text: "" };
    const next = [...rows];
    next.splice(index + 1, 0, nl);
    onChange(next);
    setFocusId(nl.id);
  }
  function remove(id: string) {
    onChange(rows.filter((l) => l.id !== id));
  }
  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }

  return (
    <div className="w-full">
      {rows.map((line, i) => (
        <div
          key={line.id}
          className={`group flex items-center gap-1.5 ${dense ? "py-0" : "py-0.5"}`}
        >
          <button
            type="button"
            aria-label="Elegir icono"
            onClick={() => setPickerFor(line.id)}
            className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-[color-mix(in_srgb,var(--highlight)_18%,transparent)]"
            style={{ color: "var(--highlight)" }}
          >
            {line.icon ? (
              <Icon name={line.icon} size={18} />
            ) : (
              <GiPlainCircle size={7} style={{ color: "var(--detail)" }} />
            )}
          </button>

          <input
            ref={(el) => {
              inputs.current[line.id] = el;
            }}
            value={line.text}
            placeholder={i === 0 ? placeholder : ""}
            onChange={(e) => setText(line.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAfter(i);
              } else if (
                e.key === "Backspace" &&
                line.text === "" &&
                rows.length > 1
              ) {
                e.preventDefault();
                const prev = rows[i - 1];
                remove(line.id);
                if (prev) setFocusId(prev.id);
              }
            }}
            className="sheet-field text-left flex-1 min-w-0 py-0.5 border-b border-[var(--line)]"
          />

          <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
            <button
              type="button"
              aria-label="Subir"
              onClick={() => move(i, -1)}
              className="p-0.5 opacity-60 hover:opacity-100"
            >
              <FiChevronUp size={14} />
            </button>
            <button
              type="button"
              aria-label="Bajar"
              onClick={() => move(i, 1)}
              className="p-0.5 opacity-60 hover:opacity-100"
            >
              <FiChevronDown size={14} />
            </button>
            <button
              type="button"
              aria-label="Quitar línea"
              onClick={() => remove(line.id)}
              className="p-0.5 opacity-60 hover:opacity-100"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addAfter(rows.length - 1)}
        className="mt-1 text-xs flex items-center gap-1 opacity-60 hover:opacity-100"
      >
        <FiPlus size={13} /> Añadir línea
      </button>

      <IconPicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={(name) => {
          if (pickerFor) setIcon(pickerFor, name);
        }}
      />
    </div>
  );
}

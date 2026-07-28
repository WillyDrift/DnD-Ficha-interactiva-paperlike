"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiRotateCcw,
  FiRotateCw,
  FiDownload,
  FiDroplet,
  FiCheck,
  FiGlobe,
  FiLock,
  FiPrinter,
} from "react-icons/fi";
import { useSheet } from "./sheet-context";
import { COLOR_PRESETS, DEFAULT_COLORS } from "@/lib/sheet";
import type { CharacterExport } from "@/lib/types";

export default function Toolbar({
  page,
  setPage,
  onPrint,
}: {
  page: number;
  setPage: (p: number) => void;
  onPrint: () => void;
}) {
  const { state, setIsPublic, undo, redo, canUndo, canRedo, saveStatus, devMode } =
    useSheet();
  const [showColors, setShowColors] = useState(false);

  async function exportJSON() {
    const s = state;
    let avatarDataUrl: string | null = null;
    if (s.avatar_url && !s.avatar_url.startsWith("blob:")) {
      try {
        const resp = await fetch(s.avatar_url);
        const blob = await resp.blob();
        avatarDataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
      } catch {
        avatarDataUrl = null;
      }
    }
    const payload: CharacterExport = {
      app: "dnd-ficha-paperlike",
      version: 1,
      exportedAt: new Date().toISOString(),
      name: s.name,
      race: s.race,
      class: s.class,
      level: s.level,
      colors: s.colors,
      data: s.data,
      avatarDataUrl,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(s.name || "personaje").replace(/[^\w\-]+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="print-screen sticky top-0 z-30 border-b border-[var(--line-strong)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto max-w-[1120px] px-2 sm:px-4 py-2 flex items-center gap-2">
        <Link href="/" className="btn btn-ghost !px-2" title="Volver">
          <FiArrowLeft />
          <span className="hidden sm:inline">Volver</span>
        </Link>

        {/* Pestañas de página */}
        <div className="flex items-center gap-1 mx-auto">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="h-8 w-8 rounded-md flabel text-sm transition"
              style={{
                background:
                  page === p
                    ? "color-mix(in srgb, var(--highlight) 22%, transparent)"
                    : "transparent",
                border: "1px solid var(--line-strong)",
              }}
              title={`Página ${p}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!canUndo} className="btn btn-ghost !px-2" title="Deshacer (Ctrl+Z)">
            <FiRotateCcw />
          </button>
          <button onClick={redo} disabled={!canRedo} className="btn btn-ghost !px-2" title="Rehacer (Ctrl+Y)">
            <FiRotateCw />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColors((v) => !v)}
              className="btn btn-ghost !px-2"
              title="Colores"
            >
              <FiDroplet />
            </button>
            {showColors && <ColorPopover onClose={() => setShowColors(false)} />}
          </div>

          <button onClick={exportJSON} className="btn btn-ghost !px-2" title="Exportar copia de seguridad (.json)">
            <FiDownload />
          </button>

          <button onClick={onPrint} className="btn btn-ghost !px-2" title="Imprimir (para llevar en papel)">
            <FiPrinter />
          </button>

          <button
            onClick={() => setIsPublic(!state.is_public)}
            className="btn btn-ghost !px-2"
            title={
              state.is_public
                ? "Ficha pública: aparece en «Buscar personajes». Pulsa para hacerla privada."
                : "Ficha privada: solo tú la ves. Pulsa para hacerla pública."
            }
            style={{ color: state.is_public ? "var(--detail)" : "var(--highlight)" }}
          >
            {state.is_public ? <FiGlobe /> : <FiLock />}
          </button>
        </div>

        <div className="w-24 text-right text-xs opacity-70 hidden sm:block">
          {devMode ? (
            "Vista previa"
          ) : saveStatus === "saving" ? (
            "Guardando…"
          ) : saveStatus === "saved" ? (
            <span className="inline-flex items-center gap-1">
              <FiCheck /> Guardado
            </span>
          ) : saveStatus === "error" ? (
            <span style={{ color: "#a11" }}>Error al guardar</span>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

function ColorPopover({ onClose }: { onClose: () => void }) {
  const { state, setColors } = useSheet();
  const c = state.colors;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 mt-2 z-50 w-64 rounded-xl border-2 p-3 shadow-xl bg-[var(--bg)]"
        style={{ borderColor: "var(--detail)" }}
      >
        <h3 className="flabel flabel-sm mb-2">Colores de la ficha</h3>
        <ColorRow label="Fondo" value={c.bg} onChange={(v) => setColors({ ...c, bg: v })} />
        <ColorRow label="Detalles" value={c.detail} onChange={(v) => setColors({ ...c, detail: v })} />
        <ColorRow label="Destacado" value={c.highlight} onChange={(v) => setColors({ ...c, highlight: v })} />

        <button
          type="button"
          onClick={() => setColors(DEFAULT_COLORS)}
          className="btn w-full mt-3 !py-1.5 text-sm"
        >
          Por defecto
        </button>

        <div className="mt-3">
          <span className="flabel flabel-xs opacity-80">Combinaciones</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setColors(p.colors)}
                title={p.name}
                className="h-7 w-7 rounded-full border-2 overflow-hidden flex"
                style={{ borderColor: "var(--detail)" }}
              >
                <span style={{ background: p.colors.bg, width: "50%" }} />
                <span style={{ background: p.colors.highlight, width: "50%" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 py-1">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-xs font-mono opacity-60">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 rounded cursor-pointer border border-[var(--line-strong)] bg-transparent"
        />
      </span>
    </label>
  );
}

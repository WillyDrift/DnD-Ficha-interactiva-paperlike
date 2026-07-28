"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import type { Character } from "@/lib/types";
import { SheetProvider, useSheet, type EditState } from "./sheet-context";
import Page1 from "./page1";
import Page2 from "./page2";
import Page3 from "./page3";

export default function ReadOnlySheet({ initial }: { initial: Character }) {
  const editState: EditState = {
    name: initial.name,
    race: initial.race,
    class: initial.class,
    level: initial.level,
    avatar_url: initial.avatar_url,
    avatar_thumb_url: initial.avatar_thumb_url,
    is_public: initial.is_public,
    colors: initial.colors,
    data: initial.data,
  };
  return (
    <SheetProvider characterId={initial.id} initial={editState} devMode>
      <ReadOnlyInner />
    </SheetProvider>
  );
}

function ReadOnlyInner() {
  const { state } = useSheet();
  const [page, setPage] = useState(1);
  const style = {
    ["--bg" as string]: state.colors.bg,
    ["--detail" as string]: state.colors.detail,
    ["--highlight" as string]: state.colors.highlight,
  } as React.CSSProperties;

  return (
    <div className="paper min-h-screen pb-24" style={style}>
      <div className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto max-w-[1120px] px-2 sm:px-4 py-2 flex items-center gap-2">
          <Link href="/browse" className="btn btn-ghost !px-2" title="Volver">
            <FiArrowLeft />
            <span className="hidden sm:inline">Volver</span>
          </Link>
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
          <span className="text-xs opacity-70 w-20 text-right hidden sm:block">
            Solo lectura
          </span>
        </div>
      </div>

      <fieldset disabled className="ro-sheet">
        <div className="mx-auto max-w-[1120px] px-2 sm:px-4 py-4">
          {page === 1 && <Page1 />}
          {page === 2 && <Page2 />}
          {page === 3 && <Page3 />}
        </div>
      </fieldset>
    </div>
  );
}

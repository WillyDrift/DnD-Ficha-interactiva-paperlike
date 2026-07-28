"use client";

import { useEffect, useState } from "react";
import type { Character } from "@/lib/types";
import { SheetProvider, useSheet, type EditState } from "./sheet-context";
import Toolbar from "./toolbar";
import Page1 from "./page1";
import Page2 from "./page2";
import Page3 from "./page3";

export default function Editor({
  initial,
  devMode = false,
}: {
  initial: Character;
  devMode?: boolean;
}) {
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
    <SheetProvider characterId={initial.id} initial={editState} devMode={devMode}>
      <EditorInner />
    </SheetProvider>
  );
}

function EditorInner() {
  const { state } = useSheet();
  const [page, setPage] = useState(1);
  const [printing, setPrinting] = useState(false);
  const style = {
    ["--bg" as string]: state.colors.bg,
    ["--detail" as string]: state.colors.detail,
    ["--highlight" as string]: state.colors.highlight,
  } as React.CSSProperties;

  // Al imprimir, renderiza las 3 páginas y abre el diálogo del navegador
  useEffect(() => {
    if (!printing) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setPrinting(false);
    };
    window.addEventListener("afterprint", finish);
    const timer = setTimeout(() => {
      // Escala cada página para que quepa en una sola hoja A4
      const PAGE_H = 1030; // alto útil de un A4 vertical (px @96dpi) con holgura
      document
        .querySelectorAll<HTMLElement>(".print-all .print-page")
        .forEach((pageEl) => {
          const scaler = pageEl.querySelector<HTMLElement>(".print-scaler");
          if (!scaler) return;
          const h = scaler.scrollHeight;
          const s = Math.min(1, PAGE_H / h);
          scaler.style.transform = `scale(${s})`;
          pageEl.style.height = Math.ceil(h * s) + "px";
        });
      window.print();
      setTimeout(finish, 800);
    }, 80);
    return () => {
      window.removeEventListener("afterprint", finish);
      clearTimeout(timer);
    };
  }, [printing]);

  return (
    <div className="paper min-h-screen pb-24" style={style}>
      <Toolbar page={page} setPage={setPage} onPrint={() => setPrinting(true)} />
      <div className="print-screen mx-auto max-w-[1120px] px-2 sm:px-4 py-4">
        {page === 1 && <Page1 />}
        {page === 2 && <Page2 />}
        {page === 3 && <Page3 />}
      </div>
      {printing && (
        <div className="print-all">
          <div className="print-page">
            <div className="print-scaler">
              <Page1 />
            </div>
          </div>
          <div className="print-page">
            <div className="print-scaler">
              <Page2 />
            </div>
          </div>
          <div className="print-page">
            <div className="print-scaler">
              <Page3 />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

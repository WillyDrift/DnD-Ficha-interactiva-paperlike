"use client";

import { useState } from "react";
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
  const style = {
    ["--bg" as string]: state.colors.bg,
    ["--detail" as string]: state.colors.detail,
    ["--highlight" as string]: state.colors.highlight,
  } as React.CSSProperties;

  return (
    <div className="paper min-h-screen pb-24" style={style}>
      <Toolbar page={page} setPage={setPage} />
      <div className="mx-auto max-w-[1120px] px-2 sm:px-4 py-4">
        {page === 1 && <Page1 />}
        {page === 2 && <Page2 />}
        {page === 3 && <Page3 />}
      </div>
    </div>
  );
}

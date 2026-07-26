"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { SheetData } from "@/lib/sheet";
import type { Colors } from "@/lib/types";

export type EditState = {
  name: string;
  race: string;
  class: string;
  level: string;
  avatar_url: string | null;
  colors: Colors;
  data: SheetData;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type TopKey = "name" | "race" | "class" | "level" | "avatar_url";

type Ctx = {
  state: EditState;
  setData: (updater: (d: SheetData) => SheetData, coalesceKey?: string) => void;
  setTop: (patch: Partial<Pick<EditState, TopKey>>, coalesceKey?: string) => void;
  setColors: (c: Colors) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  saveNow: () => Promise<void>;
  characterId: string;
  devMode: boolean;
};

const SheetCtx = createContext<Ctx | null>(null);

export function useSheet(): Ctx {
  const c = useContext(SheetCtx);
  if (!c) throw new Error("useSheet fuera de SheetProvider");
  return c;
}

const MAX_HISTORY = 120;
const COALESCE_MS = 700;
const SAVE_DEBOUNCE_MS = 800;

export function SheetProvider({
  characterId,
  initial,
  devMode = false,
  children,
}: {
  characterId: string;
  initial: EditState;
  devMode?: boolean;
  children: React.ReactNode;
}) {
  const [hist, setHist] = useState<{ stack: EditState[]; index: number }>({
    stack: [initial],
    index: 0,
  });
  const state = hist.stack[hist.index];

  const stateRef = useRef(state);
  stateRef.current = state;
  const coalesceRef = useRef<{ key: string; time: number }>({ key: "", time: 0 });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);

  const commit = useCallback((next: EditState, coalesceKey?: string) => {
    const now = Date.now();
    setHist((h) => {
      const atEnd = h.index === h.stack.length - 1;
      const co = coalesceRef.current;
      const coalesce =
        !!coalesceKey && co.key === coalesceKey && now - co.time < COALESCE_MS && atEnd;
      coalesceRef.current = { key: coalesceKey ?? "", time: now };

      const stack = h.stack.slice(0, h.index + 1);
      if (coalesce) {
        stack[h.index] = next;
        return { stack, index: h.index };
      }
      stack.push(next);
      let index = stack.length - 1;
      while (stack.length > MAX_HISTORY) {
        stack.shift();
        index--;
      }
      return { stack, index };
    });
  }, []);

  const setData = useCallback(
    (updater: (d: SheetData) => SheetData, coalesceKey?: string) => {
      const cur = stateRef.current;
      commit({ ...cur, data: updater(cur.data) }, coalesceKey);
    },
    [commit]
  );

  const setTop = useCallback(
    (patch: Partial<Pick<EditState, TopKey>>, coalesceKey?: string) => {
      commit({ ...stateRef.current, ...patch }, coalesceKey);
    },
    [commit]
  );

  const setColors = useCallback(
    (c: Colors) => {
      commit({ ...stateRef.current, colors: c }, "colors");
    },
    [commit]
  );

  const undo = useCallback(() => {
    coalesceRef.current = { key: "", time: 0 };
    setHist((h) => (h.index > 0 ? { ...h, index: h.index - 1 } : h));
  }, []);

  const redo = useCallback(() => {
    coalesceRef.current = { key: "", time: 0 };
    setHist((h) =>
      h.index < h.stack.length - 1 ? { ...h, index: h.index + 1 } : h
    );
  }, []);

  const canUndo = hist.index > 0;
  const canRedo = hist.index < hist.stack.length - 1;

  const saveNow = useCallback(async () => {
    if (devMode) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const s = stateRef.current;
    setSaveStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("characters")
      .update({
        name: s.name,
        race: s.race,
        class: s.class,
        level: s.level,
        avatar_url: s.avatar_url,
        colors: s.colors,
        data: s.data,
      })
      .eq("id", characterId);
    setSaveStatus(error ? "error" : "saved");
  }, [characterId, devMode]);

  // Autoguardado con debounce ante cada cambio de estado
  useEffect(() => {
    if (devMode) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveNow();
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, devMode]);

  // Guardar al salir de la pestaña / cerrar
  useEffect(() => {
    if (devMode) return;
    const handler = () => {
      const s = stateRef.current;
      const supabase = createClient();
      void supabase
        .from("characters")
        .update({
          name: s.name,
          race: s.race,
          class: s.class,
          level: s.level,
          avatar_url: s.avatar_url,
          colors: s.colors,
          data: s.data,
        })
        .eq("id", characterId);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [characterId, devMode]);

  // Atajos de teclado deshacer/rehacer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const value: Ctx = {
    state,
    setData,
    setTop,
    setColors,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    saveNow,
    characterId,
    devMode,
  };

  return <SheetCtx.Provider value={value}>{children}</SheetCtx.Provider>;
}

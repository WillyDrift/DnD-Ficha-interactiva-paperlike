import type { SheetData } from "./sheet";

export type Colors = {
  bg: string;
  detail: string;
  highlight: string;
};

export type Character = {
  id: string;
  user_id: string;
  name: string;
  race: string;
  class: string;
  level: string;
  avatar_url: string | null; // imagen completa (se ve en grande)
  avatar_thumb_url: string | null; // recorte para la miniatura
  is_public: boolean; // visible en el explorador de personajes
  colors: Colors;
  data: SheetData;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
  last_sign_in_at: string | null;
};

// Formato de export/import
export type CharacterExport = {
  app: "dnd-ficha-paperlike";
  version: 1;
  exportedAt: string;
  name: string;
  race: string;
  class: string;
  level: string;
  colors: Colors;
  data: SheetData;
  avatarDataUrl?: string | null;
};

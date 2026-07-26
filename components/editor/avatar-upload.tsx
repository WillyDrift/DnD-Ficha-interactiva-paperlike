"use client";

import { useRef, useState } from "react";
import { FiCamera, FiX } from "react-icons/fi";
import { GiCharacter } from "react-icons/gi";
import { createClient } from "@/lib/supabase/client";
import { useSheet } from "./sheet-context";

// Recorta al centro y redimensiona a un cuadrado (máx 512px), devuelve JPEG blob.
async function toSquareJpeg(file: File, size = 512): Promise<Blob> {
  const img = document.createElement("img");
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("img"));
      img.src = url;
    });
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg", 0.88)
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AvatarUpload({ size = 96 }: { size?: number }) {
  const { state, setTop, characterId, devMode } = useSheet();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const blob = await toSquareJpeg(file);
      if (devMode) {
        setTop({ avatar_url: URL.createObjectURL(blob) });
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no válida");
      const path = `${user.id}/${characterId}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setTop({ avatar_url: `${data.publicUrl}?t=${Date.now()}` });
    } catch {
      setErr("No se pudo subir la imagen.");
    } finally {
      setBusy(false);
    }
  }

  const url = state.avatar_url;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative rounded-full overflow-hidden border-2 group"
        style={{
          width: size,
          height: size,
          borderColor: "var(--detail)",
          background: "color-mix(in srgb, var(--detail) 10%, transparent)",
        }}
        title="Cambiar avatar"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="h-full w-full flex items-center justify-center">
            <GiCharacter size={size * 0.6} style={{ color: "var(--detail)", opacity: 0.5 }} />
          </span>
        )}
        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
          <FiCamera size={size * 0.28} />
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      {url && (
        <button
          type="button"
          onClick={() => setTop({ avatar_url: null })}
          className="text-[10px] mt-1 opacity-60 hover:opacity-100 flex items-center gap-0.5"
        >
          <FiX size={10} /> quitar
        </button>
      )}
      {busy && <span className="text-[10px] mt-1 opacity-70">Subiendo…</span>}
      {err && <span className="text-[10px] mt-1" style={{ color: "#a11" }}>{err}</span>}
    </div>
  );
}

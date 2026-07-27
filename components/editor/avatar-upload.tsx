"use client";

import { useEffect, useRef, useState } from "react";
import { FiCamera, FiX, FiZoomIn } from "react-icons/fi";
import { GiCharacter } from "react-icons/gi";
import { createClient } from "@/lib/supabase/client";
import { useSheet } from "./sheet-context";

// Recorta al centro y redimensiona a un cuadrado (máx 768px), devuelve JPEG blob.
async function toSquareJpeg(file: File, size = 768): Promise<Blob> {
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
      canvas.toBlob((b) => res(b!), "image/jpeg", 0.9)
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
  const [zoom, setZoom] = useState(false);

  const url = state.avatar_url;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
    };
    if (zoom) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  function openFilePicker() {
    fileRef.current?.click();
  }

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

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => (url ? setZoom(true) : openFilePicker())}
        className="relative rounded-full overflow-hidden border-2 group"
        style={{
          width: size,
          height: size,
          borderColor: "var(--detail)",
          background: "color-mix(in srgb, var(--detail) 10%, transparent)",
        }}
        title={url ? "Ver imagen" : "Añadir imagen"}
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
          {url ? <FiZoomIn size={size * 0.26} /> : <FiCamera size={size * 0.26} />}
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />

      <div className="flex items-center gap-3 text-[11px]">
        <button
          type="button"
          onClick={openFilePicker}
          className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
        >
          <FiCamera size={12} /> Cambiar
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setTop({ avatar_url: null })}
            className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <FiX size={12} /> Quitar
          </button>
        )}
      </div>

      {busy && <span className="text-[10px] opacity-70">Subiendo…</span>}
      {err && (
        <span className="text-[10px]" style={{ color: "#a11" }}>
          {err}
        </span>
      )}

      {zoom && url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 text-white/90 hover:text-white"
          >
            <FiX size={30} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Avatar"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] rounded-lg shadow-2xl object-contain"
            style={{ border: "4px solid var(--bg)" }}
          />
        </div>
      )}
    </div>
  );
}

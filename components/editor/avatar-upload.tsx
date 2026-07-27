"use client";

import { useEffect, useRef, useState } from "react";
import { FiCamera, FiCrop, FiX, FiZoomIn } from "react-icons/fi";
import { GiCharacter } from "react-icons/gi";
import { createClient } from "@/lib/supabase/client";
import { useSheet } from "./sheet-context";
import AvatarCropper from "./avatar-cropper";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = document.createElement("img");
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("img"));
    img.src = src;
  });
}

// Redimensiona preservando proporción a `max` px en el lado mayor (imagen completa).
async function toMaxJpeg(file: File, max = 1200): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const cw = Math.max(1, Math.round(img.width * scale));
    const ch = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    canvas.getContext("2d")!.drawImage(img, 0, 0, cw, ch);
    return await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg", 0.9)
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Recorte cuadrado centrado (miniatura por defecto).
async function toSquareJpeg(file: File, size = 256): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    canvas.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, size, size);
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
  const [cropOpen, setCropOpen] = useState(false);

  const full = state.avatar_url;
  const thumb = state.avatar_thumb_url ?? state.avatar_url;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
    };
    if (zoom) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  async function uploadOrLocal(suffix: string, blob: Blob): Promise<string> {
    if (devMode) return URL.createObjectURL(blob);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión no válida");
    const path = `${user.id}/${characterId}${suffix}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const fullBlob = await toMaxJpeg(file, 1200);
      const fullUrl = await uploadOrLocal("-full.jpg", fullBlob);
      const thumbBlob = await toSquareJpeg(file, 256);
      const thumbUrl = await uploadOrLocal(".jpg", thumbBlob);
      setTop({ avatar_url: fullUrl, avatar_thumb_url: thumbUrl });
      setCropOpen(true); // ofrece ajustar el encuadre de inmediato
    } catch {
      setErr("No se pudo subir la imagen.");
    } finally {
      setBusy(false);
    }
  }

  async function onCropConfirm(blob: Blob) {
    setErr(null);
    setBusy(true);
    try {
      const thumbUrl = await uploadOrLocal(".jpg", blob);
      setTop({ avatar_thumb_url: thumbUrl });
      setCropOpen(false);
    } catch {
      setErr("No se pudo guardar la miniatura.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => (full ? setZoom(true) : fileRef.current?.click())}
        className="relative rounded-full overflow-hidden border-2 group"
        style={{
          width: size,
          height: size,
          borderColor: "var(--detail)",
          background: "color-mix(in srgb, var(--detail) 10%, transparent)",
        }}
        title={full ? "Ver imagen completa" : "Añadir imagen"}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="h-full w-full flex items-center justify-center">
            <GiCharacter size={size * 0.6} style={{ color: "var(--detail)", opacity: 0.5 }} />
          </span>
        )}
        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
          {full ? <FiZoomIn size={size * 0.26} /> : <FiCamera size={size * 0.26} />}
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />

      <div className="flex items-center gap-2 text-[11px] flex-wrap justify-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
        >
          <FiCamera size={12} /> Cambiar
        </button>
        {full && (
          <button
            type="button"
            onClick={() => setCropOpen(true)}
            className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <FiCrop size={12} /> Encuadre
          </button>
        )}
        {(full || state.avatar_thumb_url) && (
          <button
            type="button"
            onClick={() => setTop({ avatar_url: null, avatar_thumb_url: null })}
            className="inline-flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <FiX size={12} /> Quitar
          </button>
        )}
      </div>

      {busy && <span className="text-[10px] opacity-70">Procesando…</span>}
      {err && (
        <span className="text-[10px]" style={{ color: "#a11" }}>
          {err}
        </span>
      )}

      {zoom && full && (
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
            src={full}
            alt="Avatar"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] rounded-lg shadow-2xl object-contain"
            style={{ border: "4px solid var(--bg)" }}
          />
        </div>
      )}

      {cropOpen && full && (
        <AvatarCropper
          imageUrl={full}
          onCancel={() => setCropOpen(false)}
          onConfirm={onCropConfirm}
        />
      )}
    </div>
  );
}

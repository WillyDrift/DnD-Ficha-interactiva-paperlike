"use client";

import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";

const V = 260; // tamaño del área de encuadre (cuadrada, círculo inscrito)

export default function AvatarCropper({
  imageUrl,
  onCancel,
  onConfirm,
}: {
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (thumbBlob: Blob) => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Carga la imagen como blob (mismo origen -> canvas sin "taint")
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(imageUrl);
        const blob = await resp.blob();
        url = URL.createObjectURL(blob);
        if (!cancelled) setBlobUrl(url);
      } catch {
        if (!cancelled) setError("No se pudo cargar la imagen.");
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const baseScale = nat ? Math.max(V / nat.w, V / nat.h) : 1;
  const displayScale = baseScale * zoom;
  const dispW = nat ? nat.w * displayScale : V;
  const dispH = nat ? nat.h * displayScale : V;

  function clamp(o: { x: number; y: number }) {
    return {
      x: Math.min(0, Math.max(V - dispW, o.x)),
      y: Math.min(0, Math.max(V - dispH, o.y)),
    };
  }

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const el = e.currentTarget;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    setNat({ w, h });
    const bs = Math.max(V / w, V / h);
    // centrado
    setOffset({ x: (V - w * bs) / 2, y: (V - h * bs) / 2 });
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setOffset(clamp({ x: drag.current.ox + dx, y: drag.current.oy + dy }));
  }
  function onPointerUp() {
    drag.current = null;
  }

  function onZoom(nz: number) {
    const oldScale = displayScale;
    const newScale = baseScale * nz;
    // mantener fijo el punto del centro del recuadro
    const cx = (V / 2 - offset.x) / oldScale;
    const cy = (V / 2 - offset.y) / oldScale;
    const no = { x: V / 2 - cx * newScale, y: V / 2 - cy * newScale };
    setZoom(nz);
    setOffset(clamp(no));
  }

  async function confirm() {
    if (!imgRef.current || !nat) return;
    setSaving(true);
    try {
      const out = 256;
      const canvas = document.createElement("canvas");
      canvas.width = out;
      canvas.height = out;
      const ctx = canvas.getContext("2d")!;
      const srcSize = V / displayScale;
      const srcX = -offset.x / displayScale;
      const srcY = -offset.y / displayScale;
      ctx.drawImage(imgRef.current, srcX, srcY, srcSize, srcSize, 0, 0, out, out);
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.9)
      );
      onConfirm(blob);
    } catch {
      setError("No se pudo generar la miniatura.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-[var(--bg)] text-[var(--detail)] shadow-2xl border-2 p-4"
        style={{ borderColor: "var(--detail)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="flabel flabel-sm">Ajustar miniatura</h3>
          <button className="btn btn-ghost !p-1" onClick={onCancel} aria-label="Cerrar">
            <FiX size={20} />
          </button>
        </div>

        <p className="text-xs opacity-70 mb-3">
          Arrastra la imagen y usa el zoom para elegir qué se ve en el círculo.
        </p>

        <div className="flex justify-center">
          <div
            className="relative overflow-hidden touch-none select-none cursor-move bg-black/10"
            style={{ width: V, height: V }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {blobUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={blobUrl}
                alt="Recorte"
                onLoad={onImgLoad}
                draggable={false}
                style={{
                  position: "absolute",
                  left: offset.x,
                  top: offset.y,
                  width: dispW,
                  height: dispH,
                  maxWidth: "none",
                }}
              />
            )}
            {/* máscara circular */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ border: "2px solid rgba(255,255,255,0.85)" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs opacity-70">Zoom</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoom(parseFloat(e.target.value))}
            className="flex-1"
            aria-label="Zoom"
          />
        </div>

        {error && (
          <p className="text-sm mt-2" style={{ color: "#a11" }}>
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={confirm}
            disabled={saving || !blobUrl || !nat}
          >
            {saving ? "Guardando…" : "Guardar miniatura"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiTrash2, FiUpload, FiAlertTriangle } from "react-icons/fi";
import { GiDiceTwentyFacesTwenty } from "react-icons/gi";
import type { Character } from "@/lib/types";
import { DEFAULT_COLORS } from "@/lib/sheet";
import { createCharacter, deleteCharacter, importCharacter } from "@/app/characters/actions";

type CardChar = Partial<Character> & { id: string };

export default function CharacterList({
  characters,
}: {
  characters: Partial<Character>[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<CardChar | null>(null);
  const [importErr, setImportErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportErr(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      startTransition(async () => {
        await importCharacter({
          name: parsed.name,
          race: parsed.race,
          class: parsed.class,
          level: parsed.level,
          colors: parsed.colors,
          data: parsed.data,
        });
      });
    } catch {
      setImportErr("El archivo no es una ficha válida (.json).");
    }
  }

  return (
    <div>
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="flabel text-2xl">Mis personajes</h1>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
          >
            <FiUpload /> Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onImportFile}
          />
          <form action={createCharacter}>
            <button className="btn btn-primary" disabled={pending} type="submit">
              <FiPlus /> Crear personaje
            </button>
          </form>
        </div>
      </div>

      {importErr && (
        <p className="text-sm mb-4" style={{ color: "#a11" }}>
          {importErr}
        </p>
      )}

      {characters.length === 0 ? (
        <div className="frame p-10 text-center">
          <GiDiceTwentyFacesTwenty className="mx-auto mb-3" size={48} />
          <p className="opacity-75">
            Aún no tienes personajes. Crea el primero con “Crear personaje”.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => {
            const colors = (c.colors as Character["colors"]) ?? DEFAULT_COLORS;
            const style = {
              ["--bg" as string]: colors.bg,
              ["--detail" as string]: colors.detail,
              ["--highlight" as string]: colors.highlight,
            } as React.CSSProperties;
            const name = c.name?.trim() || "Sin nombre";
            const meta = [c.race, c.class, c.level ? `Nivel ${c.level}` : ""]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={c.id}
                style={style}
                className="paper frame p-4 flex items-center gap-4 relative group"
              >
                <Link
                  href={`/character/${c.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <Avatar url={c.avatar_url ?? null} name={name} />
                  <div className="min-w-0">
                    <div className="flabel text-lg leading-tight truncate">
                      {name}
                    </div>
                    <div className="text-sm opacity-75 truncate">
                      {meta || "—"}
                    </div>
                  </div>
                </Link>
                <button
                  aria-label="Eliminar"
                  className="btn btn-ghost !p-2 absolute top-2 right-2 opacity-40 hover:opacity-100"
                  onClick={() => setToDelete(c as CardChar)}
                >
                  <FiTrash2 />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {toDelete && (
        <DeleteModal
          character={toDelete}
          onClose={() => setToDelete(null)}
          onConfirmed={() => {
            setToDelete(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  return (
    <div
      className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-[3px] transition-transform duration-200 ease-out hover:scale-[1.18] hover:shadow-lg"
      style={{
        borderColor: "var(--highlight)",
        background: "color-mix(in srgb, var(--detail) 10%, transparent)",
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="flabel text-2xl">
          {name.charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

function DeleteModal({
  character,
  onClose,
  onConfirmed,
}: {
  character: CardChar;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const name = character.name?.trim() || "";
  const target = name || "ELIMINAR";
  const canDelete = confirmText.trim() === target && !deleting;

  async function doDelete() {
    setDeleting(true);
    await deleteCharacter(character.id);
    onConfirmed();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl border-4 overflow-hidden"
        style={{ borderColor: "#8a1f1f" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#8a1f1f] text-white px-5 py-4 flex items-center gap-3">
          <FiAlertTriangle size={28} />
          <h2 className="text-xl font-bold">¿Eliminar personaje?</h2>
        </div>
        <div className="p-5 text-neutral-800 space-y-4">
          <p className="text-lg">
            Vas a eliminar{" "}
            <strong>{name || "este personaje (sin nombre)"}</strong> de forma{" "}
            <strong>permanente</strong>. Esta acción <strong>no se puede deshacer</strong>{" "}
            y se perderá toda la ficha.
          </p>
          <p className="text-sm">
            Para confirmar, escribe{" "}
            <code className="px-1 py-0.5 bg-neutral-200 rounded font-mono">
              {target}
            </code>{" "}
            abajo:
          </p>
          <input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border-2 border-neutral-400 rounded font-mono"
            placeholder={target}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn" onClick={onClose} disabled={deleting}>
              Cancelar
            </button>
            <button
              className="btn btn-danger disabled:opacity-40"
              onClick={doDelete}
              disabled={!canDelete}
            >
              {deleting ? "Eliminando…" : "Eliminar definitivamente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

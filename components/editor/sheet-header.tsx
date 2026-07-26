"use client";

import AvatarUpload from "./avatar-upload";
import { TInput } from "./connected";

// Cabecera común de la ficha: avatar arriba-izquierda (donde iba el logo D&D),
// bandera del nombre reducida y, a la derecha, el bloque de datos de cada página.
export default function SheetHeader({
  meta,
  bannerLabel = "Nombre del personaje",
  banner,
}: {
  meta: React.ReactNode;
  bannerLabel?: string;
  banner?: React.ReactNode;
}) {
  return (
    <header className="mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex items-stretch gap-3 md:w-[46%]">
          <AvatarUpload size={92} />
          <div className="frame relative flex-1 flex items-center px-3 pt-2 pb-4 min-w-0">
            {banner ?? (
              <TInput
                field="name"
                big
                center
                placeholder="—"
                className="flabel !text-2xl md:!text-3xl w-full"
              />
            )}
            <div className="frame-caption">
              <span className="flabel flabel-xs">{bannerLabel}</span>
            </div>
          </div>
        </div>

        <div className="frame md:flex-1 p-3">{meta}</div>
      </div>
    </header>
  );
}

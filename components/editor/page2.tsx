"use client";

import { Frame } from "./fields";
import { SArea, SList, HField } from "./connected";
import SheetHeader from "./sheet-header";

export default function Page2() {
  return (
    <div>
      <SheetHeader meta={<Page2Meta />} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        <div className="flex flex-col gap-3">
          <Frame title="Aspecto del personaje" className="px-3 pt-2 pb-5">
            <SArea k="appearance" rows={8} placeholder="Altura, complexión, marcas, vestimenta…" />
          </Frame>
          <Frame title="Historia del personaje" className="px-3 pt-2 pb-5">
            <SArea k="backstory" rows={22} />
          </Frame>
        </div>

        <div className="flex flex-col gap-3">
          <Frame title="Aliados y organizaciones" className="px-3 pt-2 pb-5">
            <div className="mb-2">
              <HField k="orgName" label="Nombre de la organización" />
            </div>
            <SList k="allies" minRows={4} dense />
          </Frame>
          <Frame title="Rasgos y atributos adicionales" className="px-3 pt-2 pb-5">
            <SList k="additionalFeatures" minRows={8} dense />
          </Frame>
          <Frame title="Tesoro" className="px-3 pt-2 pb-5">
            <SList k="treasure" minRows={6} dense />
          </Frame>
        </div>
      </div>
    </div>
  );
}

function Page2Meta() {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-2 h-full content-center">
      <HField k="age" label="Edad" />
      <HField k="height" label="Altura" />
      <HField k="weight" label="Peso" />
      <HField k="eyes" label="Ojos" />
      <HField k="skin" label="Piel" />
      <HField k="hair" label="Pelo" />
    </div>
  );
}

"use client";

import React from "react";

/* ---------- Marco tipo cartucho con título ---------- */
export function Frame({
  title,
  titleTop = false,
  className = "",
  bodyClassName = "",
  children,
}: {
  title?: string;
  titleTop?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`frame relative ${className}`}>
      {title && titleTop && (
        <div className="text-center pt-2 pb-1">
          <span className="flabel flabel-sm">{title}</span>
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {title && !titleTop && (
        <div className="frame-caption">
          <span className="flabel flabel-sm">{title}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Input de línea (texto o número) ---------- */
export function LineInput({
  value,
  onChange,
  className = "",
  placeholder,
  numeric = false,
  center = true,
  ariaLabel,
  big = false,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  numeric?: boolean;
  center?: boolean;
  ariaLabel?: string;
  big?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode={numeric ? "numeric" : undefined}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className={`sheet-field ${center ? "text-center" : "text-left"} ${
        big ? "text-2xl" : ""
      } ${className}`}
    />
  );
}

/* ---------- Puntito marcable ---------- */
export function Dot({
  on,
  onToggle,
  title,
}: {
  on: boolean;
  onToggle: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      className="dot"
      data-on={on}
      aria-pressed={on}
      title={title}
      onClick={onToggle}
    />
  );
}

/* ---------- Caja de característica (FUE, DES, ...) ---------- */
export function AbilityBox({
  label,
  mod,
  score,
  onMod,
  onScore,
}: {
  label: string;
  mod: string;
  score: string;
  onMod: (v: string) => void;
  onScore: (v: string) => void;
}) {
  return (
    <div className="frame relative pt-2 pb-5 px-2 flex flex-col items-center">
      <span className="flabel flabel-xs">{label}</span>
      <input
        type="text"
        value={mod}
        onChange={(e) => onMod(e.target.value)}
        aria-label={`${label} modificador`}
        placeholder="+0"
        className="sheet-field text-center text-3xl leading-none mt-1 mb-1"
      />
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-16 rounded-full border-[1.5px] flex items-center justify-center bg-[var(--bg)]"
        style={{ borderColor: "var(--detail)" }}
      >
        <input
          type="text"
          value={score}
          onChange={(e) => onScore(e.target.value)}
          aria-label={`${label} valor`}
          className="sheet-field text-center text-base"
        />
      </div>
    </div>
  );
}

/* ---------- Área de texto con renglones ---------- */
export function RuledTextArea({
  value,
  onChange,
  rows = 6,
  className = "",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`sheet-field ruled resize-none leading-[1.6rem] px-2 py-1 w-full ${className}`}
      style={{ textAlign: "left" }}
    />
  );
}

/* ---------- Campo de cabecera: input con etiqueta debajo ---------- */
export function HeaderField({
  label,
  value,
  onChange,
  numeric = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  numeric?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <input
        type="text"
        inputMode={numeric ? "numeric" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="sheet-field sheet-underline text-center pb-0.5"
      />
      <span className="flabel flabel-xs text-center mt-0.5 opacity-80">
        {label}
      </span>
    </div>
  );
}

/* ---------- Caja con recuadro y valor grande (CA, iniciativa...) ---------- */
export function StatBox({
  label,
  value,
  onChange,
  shape = "box",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  shape?: "box" | "shield";
}) {
  return (
    <div
      className={`frame flex flex-col items-center justify-center px-2 py-2 min-w-[64px] ${
        shape === "shield" ? "rounded-b-[40%]" : ""
      }`}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="sheet-field text-center text-2xl leading-none"
      />
      <span className="flabel flabel-xs text-center mt-1">{label}</span>
    </div>
  );
}

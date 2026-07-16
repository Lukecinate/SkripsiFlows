"use client";
import { useState, useRef, useEffect } from "react";

export type ExportFormat = "pdf" | "docx";

interface FormatPickerProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export default function FormatPicker({ onExport, disabled }: FormatPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="format-picker" ref={ref}>
      <button
        className="primary-button"
        disabled={disabled}
        onClick={() => onExport("pdf")}
      >
        Unduh PDF <span>&darr;</span>
      </button>
      <button
        className="format-picker-toggle"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Pilihan format lain"
      >
        &#9662;
      </button>
      {open && (
        <div className="format-picker-menu" role="menu">
          <button role="menuitem" onClick={() => { onExport("docx"); setOpen(false); }}>
            Unduh DOCX
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import { type DocumentBlock } from "../../lib/document-model";
import { buildOutline } from "../../lib/outline";
import { buildToc } from "../../lib/toc";

interface StructurePanelProps {
  blocks: DocumentBlock[];
  selectedIds: string[];
  activeBlockId: string | null;
  draggedId: string | null;
  dragOverId: string | null;
  onSelect: (id: string) => void;
  onUpdateContent: (block: DocumentBlock, content: string) => void;
  onChangeType: (id: string, type: DocumentBlock["type"]) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (id: string) => void;
  onDragLeave: (id: string) => void;
  onDrop: (id: string) => void;
  onAddBlock: (type: DocumentBlock["type"]) => void;
  selectedCount: number;
  onBulkDelete: () => void;
}

const blockTypeLabels: Record<string, string> = {
  chapter: "Bab", section: "Subbab", subchapter: "Sub-subbab",
  paragraph: "Paragraf", quote: "Kutipan", list: "Daftar",
  table: "Tabel", image: "Gambar", reference: "Referensi",
};

type Tab = "heading" | "tables" | "figures";

const FAKE_DOC_BASE = { schemaVersion: 1 as const, id: "x", title: "x", templateId: "x", citationStyle: "apa-7" as const, references: [] as never[], reviewRequired: false, createdAt: "", updatedAt: "" };

function stripNum(s: string): string {
  if (!s) return "";
  // Remove leading numbering like "1.1 ", "1.1.1 ", "I ", "I.I "
  return s.replace(/^[\d.\sivxlcdm]+/, "");
}

export default function StructurePanel({
  blocks, selectedIds, activeBlockId, draggedId, dragOverId,
  onSelect, onUpdateContent, onChangeType, onDelete, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  onAddBlock, selectedCount, onBulkDelete,
}: StructurePanelProps) {
  const outline = useMemo(() => buildOutline({ ...FAKE_DOC_BASE, blocks }), [blocks]);
  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const blockMap = useMemo(() => new Map(blocks.map((b) => [b.id, b])), [blocks]);
  const [tab, setTab] = useState<Tab>("heading");
  const fakeDoc = useMemo(() => ({ ...FAKE_DOC_BASE, blocks }), [blocks]);
  const toc = useMemo(() => buildToc(fakeDoc), [fakeDoc]);

  return (
    <aside className="structure-panel">
      <div className="structure-panel-header">
        <span className="eyebrow">DAFTAR ISI</span>
        <div className="structure-panel-actions">
          <button type="button" className="block-action" onClick={() => onAddBlock("paragraph")}>+ Paragraf</button>
          <button type="button" className="block-action" onClick={() => onAddBlock("list")}>+ Daftar</button>
          <button type="button" className="block-action" onClick={() => onAddBlock("quote")}>+ Kutipan</button>
        </div>
      </div>
      <div className="toc-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "heading"} className={tab === "heading" ? "is-active" : ""} onClick={() => setTab("heading")}>Daftar Isi</button>
        <button role="tab" aria-selected={tab === "tables"} className={tab === "tables" ? "is-active" : ""} onClick={() => setTab("tables")}>Tabel</button>
        <button role="tab" aria-selected={tab === "figures"} className={tab === "figures" ? "is-active" : ""} onClick={() => setTab("figures")}>Gambar</button>
      </div>
      <nav className="outline-nav" aria-label="Navigasi dokumen">
        {tab === "heading" && (
          <>
            {outline.length === 0 && <p className="outline-empty">Belum ada bab terdeteksi.</p>}
            {outline.map((entry) => {
              const block = blockMap.get(entry.blockId);
              if (!block) return null;
              const title = stripNum(block.content.split(/\n/)[0]?.trim() ?? "");
              return (
                <button key={entry.blockId} type="button"
                  className={`outline-entry outline-level-${entry.level} ${activeBlockId === entry.blockId ? "is-active" : ""} ${selectedIdsSet.has(entry.blockId) ? "is-selected" : ""} ${draggedId === entry.blockId ? "is-dragging" : ""} ${dragOverId === entry.blockId ? "is-drop-target" : ""}`}
                  onClick={() => onSelect(entry.blockId)}
                  draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(entry.blockId); }}
                  onDragEnd={onDragEnd} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(entry.blockId); }}
                  onDragLeave={() => onDragLeave(entry.blockId)} onDrop={() => onDrop(entry.blockId)}>
                  <span className="outline-number">{entry.number}</span>
                  <span className="outline-title">{title}</span>
                </button>
              );
            })}
          </>
        )}
        {tab === "tables" && (
          <>
            {toc.tables.length === 0 && <p className="outline-empty">Belum ada tabel.</p>}
            {toc.tables.map((entry) => (
              <button key={entry.blockId} type="button" className="outline-entry outline-level-1" onClick={() => onSelect(entry.blockId)}>
                <span className="outline-number">{entry.number}</span>
                <span className="outline-title">{entry.title}</span>
              </button>
            ))}
          </>
        )}
        {tab === "figures" && (
          <>
            {toc.figures.length === 0 && <p className="outline-empty">Belum ada gambar.</p>}
            {toc.figures.map((entry) => (
              <button key={entry.blockId} type="button" className="outline-entry outline-level-1" onClick={() => onSelect(entry.blockId)}>
                <span className="outline-number">{entry.number}</span>
                <span className="outline-title">{entry.title}</span>
              </button>
            ))}
          </>
        )}
      </nav>
      {selectedCount > 0 && (
        <div className="selection-toolbar">
          <span>{selectedCount} blok tersorot</span>
          <button type="button" className="block-action danger" onClick={onBulkDelete}>Hapus</button>
        </div>
      )}
      <details className="block-quickedit">
        <summary>Detail blok aktif</summary>
        {activeBlockId && (() => {
          const block = blockMap.get(activeBlockId);
          if (!block) return null;
          return (
            <div className="block-quickedit-body">
              <label className="block-quickedit-field">
                <span>Tipe blok</span>
                <select value={block.type} onChange={(e) => onChangeType(block.id, e.target.value as DocumentBlock["type"])}>
                  {Object.entries(blockTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <textarea value={block.content} onChange={(e) => onUpdateContent(block, e.target.value)} rows={4} aria-label="Edit isi blok" />
              <div className="block-quickedit-actions">
                <button type="button" className="block-action danger" onClick={() => onDelete(block.id)}>Hapus</button>
              </div>
            </div>
          );
        })()}
      </details>
    </aside>
  );
}

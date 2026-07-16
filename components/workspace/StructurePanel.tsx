"use client";
import { type DocumentBlock } from "../../lib/document-model";

const blockTypeLabels: Record<string, string> = {
  chapter: "Bab Utama", section: "Subbab", subchapter: "Sub-subbab",
  paragraph: "Paragraf", quote: "Kutipan", list: "Daftar",
  table: "Tabel", reference: "Referensi",
};

interface StructurePanelProps {
  blocks: DocumentBlock[];
  selectedIds: string[];
  activeBlockId: string | null;
  draggedId: string | null;
  dragOverId: string | null;
  onSelect: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onUpdateContent: (block: DocumentBlock, content: string) => void;
  onChangeType: (id: string, type: DocumentBlock["type"]) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (id: string) => void;
  onDragLeave: (id: string) => void;
  onDrop: (id: string) => void;
  onAddBlock: () => void;
  onBulkDelete: () => void;
}

export default function StructurePanel({
  blocks, selectedIds, activeBlockId, draggedId, dragOverId,
  onSelect, onToggleSelect, onToggleAll, onUpdateContent, onChangeType,
  onDelete, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  onAddBlock, onBulkDelete,
}: StructurePanelProps) {
  const allSelected = blocks.length > 0 && selectedIds.length === blocks.length;
  return (
    <aside className="structure-panel">
      <div className="structure-panel-header">
        <span className="eyebrow">STRUKTUR</span>
        <div className="structure-panel-actions">
          <button type="button" className="block-action" onClick={onAddBlock}>+</button>
          {selectedIds.length > 0 && (
            <button type="button" className="block-action danger" onClick={onBulkDelete}>
              Hapus ({selectedIds.length})
            </button>
          )}
        </div>
      </div>
      <label className="select-all">
        <input type="checkbox" checked={allSelected} onChange={onToggleAll} />
        Pilih semua
      </label>
      <div className="structure-block-list">
        {blocks.map((block) => (
          <article
            key={block.id}
            className={`structure-block ${activeBlockId === block.id ? "is-active" : ""} ${selectedIds.includes(block.id) ? "is-selected" : ""} ${draggedId === block.id ? "is-dragging" : ""} ${dragOverId === block.id ? "is-drop-target" : ""} ${block.needsReview ? "needs-review" : ""}`}
            draggable
            onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(block.id); }}
            onDragEnd={onDragEnd}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(block.id); }}
            onDragLeave={() => onDragLeave(block.id)}
            onDrop={() => onDrop(block.id)}
          >
            <div className="structure-block-row">
              <label className="block-select" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(block.id)}
                  onChange={() => onToggleSelect(block.id)}
                  aria-label={`Pilih ${blockTypeLabels[block.type] || block.type}`}
                />
              </label>
              <span className="drag-handle" aria-label="Geser">
                <svg viewBox="0 0 20 20"><circle cx="7" cy="6" r="1"/><circle cx="13" cy="6" r="1"/><circle cx="7" cy="10" r="1"/><circle cx="13" cy="10" r="1"/><circle cx="7" cy="14" r="1"/><circle cx="13" cy="14" r="1"/></svg>
              </span>
              <button type="button" className="structure-block-content" onClick={() => onSelect(block.id)}>
                <span className={`type-badge type-badge-${block.type}`}>
                  {blockTypeLabels[block.type] || block.type}
                </span>
                <span className="structure-block-snippet">
                  {block.content.slice(0, 60)}{block.content.length > 60 ? "..." : ""}
                </span>
              </button>
              <div className="structure-block-actions">
                <select
                  value={block.type}
                  onChange={(e) => onChangeType(block.id, e.target.value as DocumentBlock["type"])}
                  className="type-picker-select"
                  aria-label={`Tipe blok ${block.id}`}
                >
                  {Object.entries(blockTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button type="button" className="block-action danger" onClick={() => onDelete(block.id)}>
                  Hapus
                </button>
              </div>
            </div>
            {activeBlockId === block.id && (
              <textarea
                className="structure-block-editor"
                value={block.content}
                onChange={(e) => onUpdateContent(block, e.target.value)}
                aria-label={`Edit ${blockTypeLabels[block.type]}`}
              />
            )}
          </article>
        ))}
      </div>
    </aside>
  );
}

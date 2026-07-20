"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { validateDocument } from "../../../lib/validation";
import type { DocumentBlock, SkripsiDocument } from "../../../lib/document-model";
import { renumberDocument } from "../../../lib/renumber";
import ReferencePreview from "../../../components/workspace/ReferencePreview";
import FormatPicker, { type ExportFormat } from "../../../components/workspace/FormatPicker";
import AnalysisModal from "../../../components/workspace/AnalysisModal";
import ConfirmDialog from "../../../components/workspace/ConfirmDialog";
import StructurePanel from "../../../components/workspace/StructurePanel";
import DocumentPreview from "../../../components/workspace/DocumentPreview";
import { useDocumentSession } from "./hooks/useDocumentSession";
import { useCitationAnalysis } from "./hooks/useCitationAnalysis";
import { useExport } from "./hooks/useExport";

const styles = ["APA 7", "IEEE", "Vancouver", "Harvard", "Chicago"];

export default function EditorPage() {
  const {
    document,
    setDocument,
    paste,
    setPaste,
    selectedStyle,
    setSelectedStyle,
    history,
    handleUndo,
    handleRedo,
    message,
    setMessage,
  } = useDocumentSession(null, "", "APA 7");

  const { referenceBlock, citationAnalysis } = useCitationAnalysis(document);
  const { exportDocx, exportPdf } = useExport();

  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisDismissed, setAnalysisDismissed] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  const validation = useMemo(
    () =>
      document
        ? validateDocument(document, citationAnalysis?.references ?? document.references)
        : null,
    [document, citationAnalysis]
  );

  const commitDocument = useCallback(
    (next: SkripsiDocument) => {
      setDocument(renumberDocument(next));
    },
    [setDocument]
  );

  const updateBlockContent = useCallback(
    (blockId: string, content: string) => {
      if (!document) return;
      const next: SkripsiDocument = {
        ...document,
        blocks: document.blocks.map((b) =>
          b.id === blockId
            ? { ...b, content, source: "manual" as const, needsReview: false, confidence: 1, confidenceLevel: "high" as const }
            : b
        ),
        updatedAt: new Date().toISOString(),
      };
      commitDocument(next);
    },
    [document, commitDocument]
  );

  const updateBlockMetadata = useCallback(
    (blockId: string, next: { content?: string; metadata?: Record<string, string> }) => {
      if (!document) return;
      const nextDoc: SkripsiDocument = {
        ...document,
        blocks: document.blocks.map((b) => (b.id === blockId ? { ...b, ...next } : b)),
        updatedAt: new Date().toISOString(),
      };
      commitDocument(nextDoc);
    },
    [document, commitDocument]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (!document) return;
      const next: SkripsiDocument = {
        ...document,
        blocks: document.blocks.filter((b) => b.id !== blockId),
        updatedAt: new Date().toISOString(),
      };
      commitDocument(next);
    },
    [document, commitDocument]
  );

  const reorder = useCallback(
    (targetId: string) => {
      if (!document || !draggedId) return;
      const blocks = [...document.blocks];
      const fromIndex = blocks.findIndex((b) => b.id === draggedId);
      const toIndex = blocks.findIndex((b) => b.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      const draggedBlock = blocks[fromIndex];
      const levels = ["chapter", "section", "subchapter"];
      const draggedLevel = levels.indexOf(draggedBlock.type);
      let endFromIndex = fromIndex;
      if (draggedLevel >= 0) {
        for (let i = fromIndex + 1; i < blocks.length; i++) {
          const nextLevel = levels.indexOf(blocks[i].type);
          if (nextLevel >= 0 && nextLevel <= draggedLevel) break;
          endFromIndex = i;
        }
      }
      const count = endFromIndex - fromIndex + 1;
      const removed = blocks.splice(fromIndex, count);
      let insertAt = toIndex > fromIndex ? toIndex - count + 1 : toIndex;
      if (insertAt < 0) insertAt = 0;
      blocks.splice(insertAt, 0, ...removed);
      commitDocument({ ...document, blocks, updatedAt: new Date().toISOString() });
    },
    [document, draggedId, commitDocument]
  );

  const addBlock = useCallback(
    (type: DocumentBlock["type"]) => {
      if (!document) return;
      const newBlock: DocumentBlock = {
        id: `block-${Date.now()}`,
        type,
        content: "",
        confidence: 0.7,
        confidenceLevel: "low",
        source: "manual",
        needsReview: true,
      };
      const blocks = [...document.blocks, newBlock];
      commitDocument({ ...document, blocks, updatedAt: new Date().toISOString() });
    },
    [document, commitDocument]
  );

  const confirmDelete = useCallback(() => {
    if (!document || selectedBlockIds.length === 0) return;
    const next: SkripsiDocument = {
      ...document,
      blocks: document.blocks.filter((b) => !selectedBlockIds.includes(b.id)),
      updatedAt: new Date().toISOString(),
    };
    commitDocument(next);
    setConfirmDeleteOpen(false);
    setSelectedBlockIds([]);
  }, [document, selectedBlockIds, commitDocument]);

  const downloadDocx = useCallback(async () => {
    if (!document) return;
    try {
      const blob = await exportDocx(document, `${document.title}.docx`);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.title}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("DOCX berhasil diunduh.");
    } catch {
      setMessage("DOCX gagal dibuat. Coba ulangi atau gunakan dokumen yang lebih kecil.");
    }
  }, [document, exportDocx, setMessage]);

  const downloadPdf = useCallback(async () => {
    if (!document) return;
    try {
      const blob = await exportPdf(document, `${document.title}.pdf`);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("PDF berhasil diunduh.");
    } catch {
      setMessage("PDF gagal dibuat. Coba ulangi atau gunakan dokumen yang lebih kecil.");
    }
  }, [document, exportPdf, setMessage]);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (format === "docx") downloadDocx();
      else downloadPdf();
    },
    [downloadDocx, downloadPdf]
  );

  if (!document) return null;

  return (
    <main className="editor-page">
      <header className="workspace-header shell">
        <Link className="brand" href="/">
          <span className="brand-mark small" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M8 5h11a6 6 0 0 1 0 12H13v10H8V5Zm5 5v3h6a1.5 1.5 0 0 0 0-3h-6Z" />
              <path className="mark-cut" d="M13 20h9v5h-9Z" />
            </svg>
          </span>
          <span>Skripsi<span className="brand-accent">Flow</span></span>
        </Link>
        
        <div className="session-actions">
          <Link className="secondary-button" href="/workspace">
            Ganti bahan
          </Link>
          <button className="secondary-button" onClick={handleUndo}>
            Undo
          </button>
          <button className="secondary-button" onClick={handleRedo}>
            Redo
          </button>
          <label className="session-style-select">
            Gaya
            <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
              {styles.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </header>

              <section className="editor-layout shell">
          <StructurePanel
            blocks={document.blocks}
            selectedIds={selectedBlockIds}
            activeBlockId={activeBlockId}
            draggedId={draggedId}
            dragOverId={dragOverId}
            onSelect={setActiveBlockId}
            onUpdateContent={(block, content) => updateBlockContent(block.id, content)}
            onChangeType={(blockId, type) => {
              if (!document) return;
              const next: SkripsiDocument = {
                ...document,
                blocks: document.blocks.map((b) => (b.id === blockId ? { ...b, type } : b)),
                updatedAt: new Date().toISOString(),
              };
              commitDocument(next);
            }}
            onDelete={deleteBlock}
            onDragStart={setDraggedId}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverId(null);
            }}
            onDragOver={setDragOverId}
            onDragLeave={(id) => {
              if (dragOverId === id) setDragOverId(null);
            }}
            onDrop={reorder}
            onAddBlock={addBlock}
            selectedCount={selectedBlockIds.length}
            onBulkDelete={() => setConfirmDeleteOpen(true)}
          />
          <DocumentPreview
            document={document}
            activeBlockId={activeBlockId}
            selectedIds={selectedBlockIds}
            onSelectBlock={setActiveBlockId}
            onUpdateContent={(block, content) => updateBlockContent(block.id, content)}
            onSelectionChange={setSelectedBlockIds}
          />
        </section>
      

      

      <footer className="editor-footer shell">
{citationAnalysis && <ReferencePreview analysis={citationAnalysis} selectedStyle={selectedStyle} />}
        <div className="editor-footer-actions">
          {message && <span className="editor-message">{message}</span>}
          <FormatPicker onExport={handleExport} disabled={!document} />
        </div>
      </footer>

      {analysisOpen && (
        <AnalysisModal validation={validation} onClose={() => { setAnalysisOpen(false); setAnalysisDismissed(true); }} />
      )}
      {confirmDeleteOpen && (
        <ConfirmDialog
          title="Hapus blok terpilih?"
          description={`Perubahan ini akan menghapus ${selectedBlockIds.length} blok dari dokumen. Kamu masih bisa menggunakan Undo setelahnya.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}
    </main>
  );
}

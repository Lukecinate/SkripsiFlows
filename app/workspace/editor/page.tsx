"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ingestSource } from "../../../lib/ingestion";
import { analyzeCitations, parseReferences } from "../../../lib/citation";
import { exportPdf } from "../../../lib/export-pdf";
import { exportDocx } from "../../../lib/export-docx";
import { validateDocument } from "../../../lib/validation";
import type { DocumentBlock, SkripsiDocument } from "../../../lib/document-model";
import {
  createSnapshot, parseSnapshot, pushHistory, redo, SESSION_KEY, serializeSnapshot, undo,
} from "../../../lib/session";
import StructurePanel from "../../../components/workspace/StructurePanel";
import DocumentPreview from "../../../components/workspace/DocumentPreview";
import QualityCheck from "../../../components/workspace/QualityCheck";
import AnalysisModal from "../../../components/workspace/AnalysisModal";
import ConfirmDialog from "../../../components/workspace/ConfirmDialog";
import ReferencePreview from "../../../components/workspace/ReferencePreview";
import FormatPicker from "../../../components/workspace/FormatPicker";
import type { ExportFormat } from "../../../components/workspace/FormatPicker";

const styles = ["APA 7", "IEEE", "Vancouver", "Harvard", "Chicago"];

export default function EditorPage() {
  const [document, setDocument] = useState<SkripsiDocument | null>(null);
  const [paste, setPaste] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("APA 7");
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisDismissed, setAnalysisDismissed] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState({
    past: [] as SkripsiDocument[], present: null as SkripsiDocument | null, future: [] as SkripsiDocument[],
  });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) { window.location.href = "/workspace"; return; }
    const snapshot = parseSnapshot(raw);
    if (!snapshot) { window.localStorage.removeItem(SESSION_KEY); window.location.href = "/workspace"; return; }
    setDocument(snapshot.document);
    setPaste(snapshot.paste);
    setSelectedStyle(snapshot.selectedStyle);
    setHistory({ past: [], present: snapshot.document, future: [] });
    setMessage("");
  }, []);

  useEffect(() => {
    if (!document) return;
    try {
      const snapshot = createSnapshot(document, paste, selectedStyle);
      window.localStorage.setItem(SESSION_KEY, serializeSnapshot(snapshot));
    } catch { /* quota exceeded — silent */ }
  }, [document, paste, selectedStyle]);

  const referenceBlock = useMemo(
    () => document?.blocks.find((b) => b.type === "reference"),
    [document],
  );

  const citationAnalysis = useMemo(
    () => document && referenceBlock
      ? analyzeCitations(document.blocks.map((b) => b.content).join("\n"), parseReferences(referenceBlock.content))
      : null,
    [document, referenceBlock],
  );

  const validation = useMemo(
    () => document
      ? validateDocument(document, citationAnalysis?.references ?? document.references)
      : null,
    [document, citationAnalysis],
  );

  const unresolvedBlocks = useMemo(
    () => new Set(validation?.issues.map((i) => i.blockId).filter(Boolean) as string[]),
    [validation],
  );

  const commitDocument = useCallback((next: SkripsiDocument) => {
    setHistory((current) => pushHistory(current, next));
    setDocument(next);
  }, []);

  const updateBlock = useCallback((block: DocumentBlock, content: string) => {
    if (!document) return;
    commitDocument({
      ...document,
      blocks: document.blocks.map((b) =>
        b.id === block.id ? { ...b, content, source: "manual" as const, needsReview: false, confidence: 1, confidenceLevel: "high" as const } : b
      ),
      updatedAt: new Date().toISOString(),
    });
  }, [document, commitDocument]);

  const changeBlockType = useCallback((blockId: string, type: DocumentBlock["type"]) => {
    if (!document) return;
    commitDocument({
      ...document,
      blocks: document.blocks.map((b) =>
        b.id === blockId ? { ...b, type, source: "manual" as const, needsReview: false, confidence: 1, confidenceLevel: "high" as const } : b
      ),
      updatedAt: new Date().toISOString(),
    });
  }, [document, commitDocument]);

  const deleteBlock = useCallback((blockId: string) => {
    setSelectedBlockIds([blockId]);
    setConfirmDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!document || selectedBlockIds.length === 0) return;
    commitDocument({
      ...document,
      blocks: document.blocks.filter((b) => !selectedBlockIds.includes(b.id)),
      updatedAt: new Date().toISOString(),
    });
    setSelectedBlockIds([]);
    setConfirmDeleteOpen(false);
    setMessage(`${selectedBlockIds.length} blok dihapus.`);
  }, [document, selectedBlockIds, commitDocument]);

  const toggleBlock = useCallback((blockId: string) => {
    setSelectedBlockIds((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  }, []);

  const toggleAllBlocks = useCallback(() => {
    if (!document) return;
    setSelectedBlockIds((prev) =>
      prev.length === document.blocks.length ? [] : document.blocks.map((b) => b.id)
    );
  }, [document]);

  const addBlock = useCallback(() => {
    if (!document) return;
    const newBlock: DocumentBlock = {
      id: `block-${Date.now()}`, type: "paragraph", content: "",
      confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false,
    };
    commitDocument({
      ...document,
      blocks: [...document.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    });
    setActiveBlockId(newBlock.id);
  }, [document, commitDocument]);

  const reorder = useCallback((targetId: string) => {
    if (!document || !draggedId || draggedId === targetId) {
      setDraggedId(null); setDragOverId(null); return;
    }
    const blocks = [...document.blocks];
    const from = blocks.findIndex((b) => b.id === draggedId);
    const to = blocks.findIndex((b) => b.id === targetId);
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    commitDocument({ ...document, blocks, updatedAt: new Date().toISOString() });
    setDraggedId(null); setDragOverId(null);
  }, [document, draggedId, commitDocument]);

  const downloadPdf = useCallback(async () => {
    if (!document) { setMessage("Masukkan bahan terlebih dahulu."); return; }
    try {
      const result = await exportPdf(document, `${document.title || "skripsiflow"}.pdf`);
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url; a.download = result.filename; a.style.display = "none";
      window.document.body.appendChild(a); a.click();
      window.setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
      setMessage("PDF berhasil didownload.");
    } catch { setMessage("PDF gagal dibuat. Coba ulangi atau gunakan dokumen yang lebih kecil."); }
  }, [document]);

  const downloadDocx = useCallback(async () => {
    if (!document) { setMessage("Masukkan bahan terlebih dahulu."); return; }
    try {
      const result = await exportDocx(document, `${document.title || "skripsiflow"}.docx`);
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url; a.download = result.filename; a.style.display = "none";
      window.document.body.appendChild(a); a.click();
      window.setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
      setMessage("DOCX berhasil didownload.");
    } catch { setMessage("DOCX gagal dibuat. Coba ulangi atau gunakan dokumen yang lebih kecil."); }
  }, [document]);

  const handleExport = useCallback((format: ExportFormat) => {
    if (format === "docx") downloadDocx(); else downloadPdf();
  }, [downloadDocx, downloadPdf]);

  if (!document) return null;

  return (
    <main className="editor-page">
      <header className="workspace-header shell">
        <Link className="brand" href="/">
          <span className="brand-mark small" aria-hidden="true">
            <svg viewBox="0 0 32 32"><path d="M8 5h11a6 6 0 0 1 0 12H13v10H8V5Zm5 5v3h6a1.5 1.5 0 0 0 0-3h-6Z"/><path className="mark-cut" d="M13 20h9v5h-9z"/></svg>
          </span>
          <span>Skripsi<span className="brand-accent">Flow</span></span>
        </Link>
        <div className="workspace-title">
          <span className="eyebrow">EDITOR</span>
          <strong>{document.title || "Dokumen baru"}</strong>
        </div>
        <div className="session-actions">
          <Link className="secondary-button" href="/workspace">Ganti bahan</Link>
          <button className="secondary-button" onClick={() => { const next = undo(history); setHistory(next); setDocument(next.present); }}>Undo</button>
          <button className="secondary-button" onClick={() => { const next = redo(history); setHistory(next); setDocument(next.present); }}>Redo</button>
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
          onToggleSelect={toggleBlock}
          onToggleAll={toggleAllBlocks}
          onUpdateContent={updateBlock}
          onChangeType={changeBlockType}
          onDelete={deleteBlock}
          onDragStart={setDraggedId}
          onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
          onDragOver={setDragOverId}
          onDragLeave={(id) => { if (dragOverId === id) setDragOverId(null); }}
          onDrop={reorder}
          onAddBlock={addBlock}
          onBulkDelete={() => setConfirmDeleteOpen(true)}
        />
        <DocumentPreview
          document={document}
          activeBlockId={activeBlockId}
          onSelectBlock={setActiveBlockId}
          onUpdateContent={updateBlock}
        />
      </section>

      <footer className="editor-footer shell">
        <QualityCheck validation={validation} hasDocument={!!document} />
        {citationAnalysis && <ReferencePreview analysis={citationAnalysis} selectedStyle={selectedStyle} />}
        <div className="editor-footer-actions">
          {message && <span className="editor-message">{message}</span>}
          <FormatPicker onExport={handleExport} disabled={!document} />
        </div>
      </footer>

      {analysisOpen && <AnalysisModal validation={validation} onClose={() => { setAnalysisOpen(false); setAnalysisDismissed(true); }} />}
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

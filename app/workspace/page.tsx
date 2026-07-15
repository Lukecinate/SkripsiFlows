"use client";
import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import { ingestSource } from "../../lib/ingestion";
import {
  analyzeCitations,
  formatReference,
  parseReferences,
} from "../../lib/citation";
import { exportDocx } from "../../lib/export-docx";
import { validateDocument } from "../../lib/validation";
import type { DocumentBlock, SkripsiDocument } from "../../lib/document-model";
import {
  createSnapshot,
  parseSnapshot,
  pushHistory,
  redo,
  SESSION_KEY,
  serializeSnapshot,
  undo,
} from "../../lib/session";
const styles = ["APA 7", "IEEE", "Vancouver", "Harvard", "Chicago"];
const blockTypes: Array<{ value: DocumentBlock["type"]; label: string }> = [
  { value: "chapter", label: "Bab utama" },
  { value: "section", label: "Subbab" },
  { value: "subchapter", label: "Sub-subbab" },
  { value: "paragraph", label: "Paragraf" },
  { value: "quote", label: "Kutipan" },
  { value: "list", label: "Daftar" },
  { value: "table", label: "Tabel" },
  { value: "reference", label: "Referensi" },
];
export default function WorkspacePage() {
  const [document, setDocument] = useState<SkripsiDocument | null>(null);
  const [paste, setPaste] = useState("");
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisDismissed, setAnalysisDismissed] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("APA 7");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPulseId, setDropPulseId] = useState<string | null>(null);
  const [message, setMessage] = useState("Belum ada bahan masuk");
  const [history, setHistory] = useState({
    past: [] as SkripsiDocument[],
    present: null as SkripsiDocument | null,
    future: [] as SkripsiDocument[],
  });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const snapshot = parseSnapshot(raw);
    if (!snapshot) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }
    setDocument(snapshot.document);
    setPaste(snapshot.paste);
    setSelectedStyle(snapshot.selectedStyle);
    setHistory({ past: [], present: snapshot.document, future: [] });
    setSavedAt(snapshot.savedAt);
    setMessage("Sesi terakhir berhasil dipulihkan.");
  }, []);
  useEffect(() => {
    if (!document) return;
    try {
      const snapshot = createSnapshot(document, paste, selectedStyle);
      window.localStorage.setItem(SESSION_KEY, serializeSnapshot(snapshot));
      setSavedAt(snapshot.savedAt);
    } catch {
      setMessage("Autosave dihentikan karena ukuran sesi terlalu besar.");
    }
  }, [document, paste, selectedStyle]);
  const reviewCount = useMemo(
    () => document?.blocks.filter((block) => block.needsReview).length ?? 0,
    [document],
  );

  const referenceBlock = document?.blocks.find(
    (block) => block.type === "reference",
  );
  const citationAnalysis = useMemo(
    () =>
      document && referenceBlock
        ? analyzeCitations(
            document.blocks.map((block) => block.content).join("\\n"),
            parseReferences(referenceBlock.content),
          )
        : null,
    [document, referenceBlock],
  );
  const validation = useMemo(
    () =>
      document
        ? validateDocument(
            document,
            citationAnalysis?.references ?? document.references,
          )
        : null,
    [document, citationAnalysis],
  );
  const unresolvedBlocks = useMemo(
    () =>
      new Set(
        validation?.issues
          .map((issue) => issue.blockId)
          .filter(Boolean) as string[],
      ),
    [validation],
  );
  const commitDocument = (next: SkripsiDocument) => {
    setHistory((current) => pushHistory(current, next));
    setDocument(next);
  };
  const parse = (
    content: string,
    kind: "paste" | "markdown" | "plain-text",
    name?: string,
    extension?: string,
  ) => {
    const result = ingestSource({ content, kind, name, extension });
    if (!result.document) {
      setMessage(result.issues.map((issue) => issue.message).join(" "));
      return;
    }
    commitDocument({
      ...result.document,
      citationStyle: selectedStyle.toLowerCase().replaceAll(" ", "-"),
    });
    setAnalysisDismissed(false);
    setAnalysisOpen(true);
    setMessage(
      result.issues.length
        ? `${result.issues.length} hal perlu ditinjau`
        : "Struktur berhasil dikenali",
    );
  };
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (![".md", ".markdown", ".txt"].includes(extension)) {
      setMessage("Gunakan file .md, .markdown, atau .txt");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      parse(
        String(reader.result ?? ""),
        extension === ".txt" ? "plain-text" : "markdown",
        file.name,
        extension,
      );
    reader.readAsText(file);
  };
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (![".md", ".markdown", ".txt"].includes(extension)) {
      setMessage("Gunakan file .md, .markdown, atau .txt");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      parse(
        String(reader.result ?? ""),
        extension === ".txt" ? "plain-text" : "markdown",
        file.name,
        extension,
      );
    reader.readAsText(file);
  };
  const reorder = (targetId: string) => {
    if (!document || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const blocks = [...document.blocks];
    const from = blocks.findIndex((block) => block.id === draggedId);
    const to = blocks.findIndex((block) => block.id === targetId);
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    commitDocument({
      ...document,
      blocks,
      updatedAt: new Date().toISOString(),
    });
    setDraggedId(null);
    setDragOverId(null);
    setDropPulseId(targetId);
    window.setTimeout(() => setDropPulseId(null), 420);
  };
  const downloadDocx = async () => {
    if (!document || !validation?.canExport) {
      setMessage("Export tidak tersedia tanpa dokumen.");
      return;
    }
    try {
      const result = await exportDocx(document, `${document.title || "skripsiflow"}.docx`);
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      window.document.body.appendChild(anchor);
      anchor.click();
      window.setTimeout(() => {
        anchor.remove();
        URL.revokeObjectURL(url);
      }, 1000);
      setMessage("Download DOCX dimulai. Periksa folder Downloads browser-mu.");
    } catch {
      setMessage("DOCX gagal dibuat. Periksa dokumen lalu coba lagi.");
    }
  };  const deleteBlock = (blockId: string) => {
    setSelectedBlockIds([blockId]);
    setConfirmDeleteOpen(true);
  };
  const confirmDelete = () => {
    if (!document || selectedBlockIds.length === 0) return;
    const blocks = document.blocks.filter(
      (block) => !selectedBlockIds.includes(block.id),
    );
    commitDocument({
      ...document,
      blocks,
      updatedAt: new Date().toISOString(),
    });
    setSelectedBlockIds([]);
    setConfirmDeleteOpen(false);
    setMessage(`${selectedBlockIds.length} blok dihapus.`);
  };
  const toggleBlock = (blockId: string) =>
    setSelectedBlockIds((current) =>
      current.includes(blockId)
        ? current.filter((id) => id !== blockId)
        : [...current, blockId],
    );
  const toggleAllBlocks = () => {
    if (!document) return;
    setSelectedBlockIds((current) =>
      current.length === document.blocks.length
        ? []
        : document.blocks.map((block) => block.id),
    );
  };
  const updateSelected = (content: string) => {
    if (!document || selectedBlockIds.length === 0) return;
    commitDocument({
      ...document,
      blocks: document.blocks.map((block) =>
        selectedBlockIds.includes(block.id)
          ? {
              ...block,
              content,
              source: "manual",
              needsReview: false,
              confidence: 1,
              confidenceLevel: "high",
            }
          : block,
      ),
      updatedAt: new Date().toISOString(),
    });
  };
  const closeAnalysis = () => {
    setAnalysisOpen(false);
    setAnalysisDismissed(true);
  };
  const changeBlockType = (blockId: string, type: DocumentBlock["type"]) => {
    if (!document) return;
    commitDocument({
      ...document,
      blocks: document.blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              type,
              source: "manual",
              needsReview: false,
              confidence: 1,
              confidenceLevel: "high",
            }
          : block,
      ),
      updatedAt: new Date().toISOString(),
    });
    setMessage("Tipe section diperbarui.");
  };
  const updateBlock = (block: DocumentBlock, content: string) => {
    if (!document) return;
    commitDocument({
      ...document,
      blocks: document.blocks.map((item) =>
        item.id === block.id
          ? {
              ...item,
              content,
              source: "manual",
              needsReview: false,
              confidence: 1,
              confidenceLevel: "high",
            }
          : item,
      ),
      updatedAt: new Date().toISOString(),
    });
  };
  return (
    <main className="workspace-page">{message.includes("Download DOCX") && <div className="download-toast" role="status">{message}</div>}
      <header className="workspace-header shell">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M8 5h11a6 6 0 0 1 0 12H13v10H8V5Zm5 5v3h6a1.5 1.5 0 0 0 0-3h-6Z" />
              <path className="mark-cut" d="M13 20h9v5h-9z" />
            </svg>
          </span>
          <span>
            Skripsi<span className="brand-accent">Flow</span>
          </span>
        </a>
        <div className="workspace-title">
          <span className="eyebrow">WORKSPACE</span>
          <strong>{document?.title ?? "Dokumen baru"}</strong>
        </div>
        <div className="session-actions">
          <span className="save-status">
            {savedAt ? "Autosave aktif" : "Belum disimpan"}
          </span>
          <button
            className="secondary-button"
            onClick={() => {
              const next = undo(history);
              setHistory(next);
              setDocument(next.present);
            }}
          >
            Undo
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              const next = redo(history);
              setHistory(next);
              setDocument(next.present);
            }}
          >
            Redo
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              window.localStorage.removeItem(SESSION_KEY);
              setDocument(null);
              setHistory({ past: [], present: null, future: [] });
              setSavedAt(null);
            }}
          >
            Mulai ulang
          </button>
        </div>
      </header>
      <section className="workspace shell">
        <aside className="input-panel">
          <p className="eyebrow">LANGKAH 01 / 04</p>
          <h1>
            Masukkan
            <br />
            <em>bahanmu.</em>
          </h1>
          <p className="panel-copy">
            Upload file atau tempel teks dari AI. Struktur akan dibaca otomatis.
          </p>
          <label
            className="dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={drop}
          >
            <span className="upload-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14" />
              </svg>
            </span>
            <strong>Tarik file ke sini</strong>
            <span>Markdown atau TXT</span>
            <input
              type="file"
              accept=".md,.markdown,.txt,text/plain,text/markdown"
              onChange={upload}
            />
          </label>
          <div className="paste-divider">
            <span>atau tempel langsung</span>
          </div>
          <textarea
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder="Tempel hasil AI atau tulisanmu di sini..."
          />
          <button
            className="primary-button full-button"
            onClick={() => parse(paste, "paste")}
          >
            Analisis bahan <span>→</span>
          </button>
          <p className="privacy-note">
            <span aria-hidden="true">✦</span> File diproses sementara dan tidak
            masuk ke log.
          </p>
        </aside>
        <section className="review-panel">
          <div className="review-toolbar">
            <div>
              <p className="eyebrow">LANGKAH 02 / 04</p>
              <h2>Review struktur</h2>
            </div>
            <div className="toolbar-right">
              {document && (
                <div className="selection-tools">
                  <label className="select-all">
                    <input
                      type="checkbox"
                      checked={
                        selectedBlockIds.length === document.blocks.length &&
                        document.blocks.length > 0
                      }
                      onChange={toggleAllBlocks}
                    />{" "}
                    Pilih semua
                  </label>
                  {selectedBlockIds.length > 0 && (
                    <>
                      <span>{selectedBlockIds.length} dipilih</span>
                      <button
                        type="button"
                        className="block-action danger"
                        onClick={() => setConfirmDeleteOpen(true)}
                      >
                        Hapus pilihan
                      </button>
                    </>
                  )}
                </div>
              )}
              <label>
                Gaya referensi
                <select
                  value={selectedStyle}
                  onChange={(event) => setSelectedStyle(event.target.value)}
                >
                  {styles.map((style) => (
                    <option key={style}>{style}</option>
                  ))}
                </select>
              </label>
              <span className={`review-status ${document ? "ready" : ""}`}>
                {document
                  ? `${validation?.reviewCount ?? reviewCount} temuan`
                  : "Menunggu bahan"}
              </span>
            </div>
          </div>
          {confirmDeleteOpen && (
            <div
              className="analysis-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
            >
              <div className="confirm-dialog">
                <div className="confirm-icon" aria-hidden="true">
                  !
                </div>
                <span className="eyebrow">KONFIRMASI</span>
                <h3 id="delete-title">Hapus blok terpilih?</h3>
                <p>
                  Perubahan ini akan menghapus {selectedBlockIds.length} blok
                  dari dokumen. Kamu masih bisa menggunakan Undo setelahnya.
                </p>
                <div className="confirm-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setConfirmDeleteOpen(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={confirmDelete}
                  >
                    Ya, hapus
                  </button>
                </div>
              </div>
            </div>
          )}
          {analysisOpen && document && (
            <div
              className="analysis-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="analysis-title"
            >
              <div className="analysis-dialog">
                <div className="analysis-dialog-head">
                  <div>
                    <span className="eyebrow">HASIL ANALISIS</span>
                    <h3 id="analysis-title">Periksa sebelum lanjut</h3>
                  </div>
                  <button
                    type="button"
                    className="close-button"
                    aria-label="Tutup hasil analisis"
                    onClick={closeAnalysis}
                  >
                    ×
                  </button>
                </div>
                <p>
                  {validation?.reviewCount
                    ? `Ditemukan ${validation.reviewCount} hal yang perlu diperhatikan.`
                    : "Struktur dokumen siap ditinjau."}
                </p>
                {validation?.issues.length ? (
                  <ul>
                    {validation.issues.slice(0, 8).map((issue, index) => (
                      <li key={`${issue.code}-${issue.blockId ?? index}`}>
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="analysis-success">
                    ✓ Tidak ada masalah struktur yang terdeteksi.
                  </p>
                )}
                <button
                  type="button"
                  className="primary-button"
                  onClick={closeAnalysis}
                >
                  Lihat hasil analisis
                </button>
              </div>
            </div>
          )}
          {!document ? (
            <div className="empty-review">
              <span>✦</span>
              <strong>Hasil analisismu akan muncul di sini</strong>
              <p>Mulai dengan upload file atau paste bahan skripsi.</p>
            </div>
          ) : (
            <div className="block-list">
              {document.blocks.map((block) => (
                <article
                  className={`document-block ${draggedId === block.id ? "is-dragging" : ""} ${dragOverId === block.id ? "is-drop-target" : ""} ${dropPulseId === block.id ? "drop-pulse" : ""} ${block.needsReview || (analysisDismissed && unresolvedBlocks.has(block.id)) ? "needs-review" : ""} ${selectedBlockIds.includes(block.id) ? "selected" : ""}`}
                  key={block.id}
                  draggable
                  onDragStart={(event) => {
                    setDraggedId(block.id);
                    setDragOverId(null);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggedId !== block.id) setDragOverId(block.id);
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDragLeave={() => {
                    if (dragOverId === block.id) setDragOverId(null);
                  }}
                  onDrop={() => reorder(block.id)}
                >
                  <label className="block-select">
                    <input
                      type="checkbox"
                      aria-label={`Pilih blok ${block.id}`}
                      checked={selectedBlockIds.includes(block.id)}
                      onChange={() => toggleBlock(block.id)}
                    />
                  </label>
                  <span
                    className="drag-handle"
                    aria-label="Geser blok"
                    role="img"
                  >
                    <svg viewBox="0 0 20 20">
                      <circle cx="7" cy="6" r="1" />
                      <circle cx="13" cy="6" r="1" />
                      <circle cx="7" cy="10" r="1" />
                      <circle cx="13" cy="10" r="1" />
                      <circle cx="7" cy="14" r="1" />
                      <circle cx="13" cy="14" r="1" />
                    </svg>
                  </span>
                  <div className="block-content">
                    <div className="block-meta">
                      <label className="type-picker">
                        <span className="sr-only">Tipe blok {block.id}</span>
                        <select
                          value={block.type}
                          onChange={(event) =>
                            changeBlockType(
                              block.id,
                              event.target.value as DocumentBlock["type"],
                            )
                          }
                        >
                          {blockTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span className="block-type">
                        {block.type} · {Math.round(block.confidence * 100)}%
                      </span>
                    </div>
                    <div className="block-actions">
                      <button
                        type="button"
                        className="block-action"
                        onClick={() =>
                          window.document
                            .getElementById(`block-editor-${block.id}`)
                            ?.focus()
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="block-action danger"
                        onClick={() => deleteBlock(block.id)}
                      >
                        Hapus
                      </button>
                    </div>
                    <textarea
                      id={`block-editor-${block.id}`}
                      aria-label={`Edit blok ${block.id}`}
                      value={block.content}
                      onChange={(event) =>
                        updateBlock(block, event.target.value)
                      }
                    />
                    <small>
                      {block.needsReview
                        ? "Periksa struktur atau isi blok ini"
                        : "Struktur terdeteksi dengan baik"}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="quality-card">
            <div>
              <span className="eyebrow">QUALITY CHECK</span>
              <strong>{validation?.score ?? 0}/100</strong>
            </div>
            <p>
              {validation?.canExport
                ? validation.reviewCount
                  ? "Siap diekspor dengan catatan review."
                  : "Dokumen siap diekspor."
                : "Export tidak tersedia tanpa dokumen."}
            </p>
          </div>
          {validation && !validation.canExport && (
            <div className="review-modal" role="alert">
              <div>
                <span className="eyebrow">MANUAL REVIEW</span>
                <h3>Beberapa bagian perlu perhatianmu</h3>
                <p>
                  Periksa blok yang ditandai kuning. Edit isinya untuk menandai
                  sebagai sudah diverifikasi.
                </p>
                <ul>
                  {validation.issues.slice(0, 5).map((issue, index) => (
                    <li key={`${issue.code}-${issue.blockId ?? index}`}>
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="reference-preview">
            {citationAnalysis && (
              <>
                <div className="reference-heading">
                  <strong>Referensi terdeteksi</strong>
                  <span>{citationAnalysis.issues.length} temuan</span>
                </div>
                {citationAnalysis.references.map((reference, index) => (
                  <p key={reference.id}>
                    {formatReference(
                      reference,
                      selectedStyle.toLowerCase().replaceAll(" ", "-") as
                        | "apa-7"
                        | "ieee"
                        | "vancouver"
                        | "harvard"
                        | "chicago",
                      index,
                    )}
                  </p>
                ))}
              </>
            )}
          </div>
          <div className="review-footer">
            <span>{message}</span>
            <button
              className="primary-button"
              onClick={downloadDocx}
              disabled={!document}
            >
              Unduh DOCX <span>↓</span>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}


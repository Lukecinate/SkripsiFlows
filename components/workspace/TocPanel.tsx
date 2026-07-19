"use client";
import { useMemo, useState } from "react";
import type { SkripsiDocument } from "../../lib/document-model";
import { buildToc } from "../../lib/toc";
import { setCaption, setTocTitle } from "../../lib/renumber";

interface TocPanelProps {
  document: SkripsiDocument;
  onUpdateBlock: (blockId: string, next: { content?: string; metadata?: Record<string, string> }) => void;
  onScrollTo: (blockId: string) => void;
}

type Tab = "heading" | "tables" | "figures";

export default function TocPanel({ document, onUpdateBlock, onScrollTo }: TocPanelProps) {
  const [tab, setTab] = useState<Tab>("heading");
  const toc = useMemo(() => buildToc(document), [document]);
  const blockMap = useMemo(() => new Map(document.blocks.map((b) => [b.id, b])), [document.blocks]);

  const updateTitle = (blockId: string, title: string) => {
    const block = blockMap.get(blockId);
    if (!block) return;
    const next = setTocTitle(block, title);
    onUpdateBlock(blockId, { metadata: next.metadata });
  };

  const updateCaption = (blockId: string, caption: string) => {
    const block = blockMap.get(blockId);
    if (!block) return;
    const next = setCaption(block, caption);
    onUpdateBlock(blockId, { content: block.type === "image" ? caption : block.content, metadata: next.metadata });
  };

  return (
    <section className="toc-panel">
      <div className="toc-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "heading"} className={tab === "heading" ? "is-active" : ""} onClick={() => setTab("heading")}>Daftar Isi</button>
        <button role="tab" aria-selected={tab === "tables"} className={tab === "tables" ? "is-active" : ""} onClick={() => setTab("tables")}>Daftar Tabel</button>
        <button role="tab" aria-selected={tab === "figures"} className={tab === "figures" ? "is-active" : ""} onClick={() => setTab("figures")}>Daftar Gambar</button>
      </div>
      <div className="toc-body">
        {tab === "heading" && (
          <ol className="toc-list">
            {toc.heading.length === 0 && <li className="toc-empty">Belum ada heading.</li>}
            {toc.heading.map((entry) => (
              <li key={entry.blockId} className={`toc-row toc-level-${entry.level}`}>
                <span className="toc-number">{entry.number}</span>
                <input
                  className="toc-title-input"
                  value={entry.title}
                  onChange={(e) => updateTitle(entry.blockId, e.target.value)}
                  aria-label={`Judul ${entry.number}`}
                />
                <button type="button" className="toc-locate" onClick={() => onScrollTo(entry.blockId)} aria-label="Loncat ke blok">→</button>
              </li>
            ))}
          </ol>
        )}
        {tab === "tables" && (
          <ol className="toc-list">
            {toc.tables.length === 0 && <li className="toc-empty">Belum ada tabel. Tambahkan blok tipe tabel untuk membuat daftar otomatis.</li>}
            {toc.tables.map((entry) => (
              <li key={entry.blockId} className="toc-row">
                <span className="toc-number">{entry.number}</span>
                <input
                  className="toc-title-input"
                  value={entry.title}
                  onChange={(e) => updateCaption(entry.blockId, e.target.value)}
                  aria-label={`Judul ${entry.number}`}
                />
                <button type="button" className="toc-locate" onClick={() => onScrollTo(entry.blockId)} aria-label="Lonkat ke blok">→</button>
              </li>
            ))}
          </ol>
        )}
        {tab === "figures" && (
          <ol className="toc-list">
            {toc.figures.length === 0 && <li className="toc-empty">Belum ada gambar. Tambahkan blok tipe gambar untuk membuat daftar otomatis.</li>}
            {toc.figures.map((entry) => (
              <li key={entry.blockId} className="toc-row">
                <span className="toc-number">{entry.number}</span>
                <input
                  className="toc-title-input"
                  value={entry.title}
                  onChange={(e) => updateCaption(entry.blockId, e.target.value)}
                  aria-label={`Judul ${entry.number}`}
                />
                <button type="button" className="toc-locate" onClick={() => onScrollTo(entry.blockId)} aria-label="Lonkat ke blok">→</button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

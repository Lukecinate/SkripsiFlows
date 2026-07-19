"use client";

import { memo, useRef, useEffect, useState, useCallback } from "react";
import type { DocumentBlock, SkripsiDocument } from "../../lib/document-model";
import type { InlineSegment } from "../../lib/ingestion";
import { resolveBlockStyle } from "../../lib/template";

interface DocumentPreviewProps {
  document: SkripsiDocument;
  activeBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateContent: (block: DocumentBlock, content: string) => void;
  onSelectionChange: (ids: string[]) => void;
  selectedIds: string[];
}

import { parseInlineMarkdown } from "../../lib/ingestion";

function parseInline(block: DocumentBlock): InlineSegment[] {
  try {
    const parsed = block.metadata?.inline ? (JSON.parse(block.metadata.inline) as InlineSegment[]) : [];
    if (parsed.length > 0) return parsed;
  } catch {}
  return parseInlineMarkdown(block.content);
}

function stripNum(s){if(!s)return"";return s.replace(/^[\d.\sivxlcdm]+/,"")}
const InlineRun = memo(function InlineRun({ segment }: { segment: InlineSegment }) {
  let node: React.ReactNode = segment.text;
  if (segment.marks.includes("code")) node = <code className="inline-code">{node}</code>;
  if (segment.marks.includes("bold")) node = <strong>{node}</strong>;
  if (segment.marks.includes("italic")) node = <em>{node}</em>;
  if (segment.marks.includes("underline")) node = <u>{node}</u>;
  return <>{node}</>;
});

const WordBlock = memo(function WordBlock(props: {
  block: DocumentBlock; templateId: string; isActive: boolean;
  onSelect: () => void; onUpdate: (content: string) => void;
}) {
  const { block, templateId, isActive, onSelect, onUpdate } = props;
  const style = resolveBlockStyle(block, templateId);
  const segments = parseInline(block);
  const rawLine = block.content.split(/\n/)[0]?.trim() ?? '';
  const firstLine = stripNum(rawLine).replace(/\*\*([^*]+)\*\*/g,'$1')

  if (block.type === "chapter") {
    return (
      <div data-block-id={block.id} onClick={onSelect} style={{ margin: "2.5cm 0 1.2cm", textAlign: "center" }}>
        {isActive ? (
          <textarea value={block.content} onChange={(e) => onUpdate(e.target.value)}
            style={{ width: "100%", fontFamily: style.font, fontSize: "16pt", fontWeight: 700, textAlign: "center", border: "none", background: "transparent", resize: "none", minHeight: 40, outline: "none" }}
            aria-label="Edit bab" />
        ) : (
          <>
            <p style={{ fontFamily: style.font, fontSize: "16pt", fontWeight: 700, textAlign: "center", margin: "0 0 0.3cm", letterSpacing: 1 }}>
              {(block.metadata?.headingNumber || "BAB").toUpperCase()}
            </p>
            <p style={{ fontFamily: style.font, fontSize: "16pt", fontWeight: 700, textAlign: "center", textTransform: "uppercase", margin: 0 }}>
              {segments.map((s, i) => <InlineRun key={i} segment={s} />)}
            </p>
          </>
        )}
      </div>
    );
  }

  if (block.type === "section" || block.type === "subchapter") {
    const margin = block.type === "section" ? "1.2em 0 0.4em" : "0.8em 0 0.3em";
    if (isActive) {
      return (
        <div data-block-id={block.id} onClick={onSelect} style={{ margin }}>
          <textarea value={block.content} onChange={(e) => onUpdate(e.target.value)}
            style={{ width: "100%", fontFamily: style.font, fontSize: "14pt", fontWeight: 700, textAlign: "left", border: "none", background: "transparent", resize: "none", minHeight: 36, outline: "none" }}
            aria-label={"Edit " + block.type} />
        </div>
      );
    }
    const num = block.metadata?.headingNumber?.trim();
    return (
      <p data-block-id={block.id} onClick={onSelect}
        style={{ fontFamily: style.font, fontSize: "14pt", fontWeight: 700, textAlign: "left", margin, cursor: "pointer" }}>
        {num ? <span style={{ color: "#7c9d40", fontWeight: 700, marginRight: 6 }}>{num}</span> : null}
        {firstLine}
      </p>
    );
  }

  if (block.type === "list") {
    const ordered = block.metadata?.listType === "ordered";
    const items = block.content.split(/\n/).filter(Boolean).map((l) => l.replace(/^([-*+]\s+|\d+[.)]\s+|#\s+)/, ""));
    return (
      <div data-block-id={block.id} onClick={onSelect} style={{ margin: "0 0 0.8em 1.5em" }}>
        {ordered ? (
          <ol style={{ fontFamily: style.font, fontSize: "12pt", margin: 0, padding: 0, listStyle: "decimal" }}>
            {items.map((item, i) => <li key={i} style={{ margin: "0.15em 0", lineHeight: 1.5 }}>{item}</li>)}
          </ol>
        ) : (
          <ul style={{ fontFamily: style.font, fontSize: "12pt", margin: 0, padding: 0, listStyle: "disc" }}>
            {items.map((item, i) => <li key={i} style={{ margin: "0.15em 0", lineHeight: 1.5 }}>{item}</li>)}
          </ul>
        )}
      </div>
    );
  }

  if (block.type === "quote") {
    if (isActive) {
      return (
        <div data-block-id={block.id} onClick={onSelect} style={{ margin: "0.6em 0", paddingLeft: "1.27cm" }}>
          <textarea value={block.content} onChange={(e) => onUpdate(e.target.value)}
            style={{ width: "100%", fontFamily: style.font, fontSize: "12pt", fontStyle: "italic", border: "none", background: "transparent", resize: "none", minHeight: 36, outline: "none" }}
            aria-label="Edit kutipan" />
        </div>
      );
    }
    return (
      <blockquote data-block-id={block.id} onClick={onSelect}
        style={{ fontFamily: style.font, fontSize: "12pt", fontStyle: "italic", textAlign: "justify", margin: "0.6em 0", paddingLeft: "1.27cm", cursor: "pointer", lineHeight: 1.5 }}>
        {segments.map((s, i) => <InlineRun key={i} segment={s} />)}
      </blockquote>
    );
  }

  if (block.type === "table") {
    const lines = block.content.split(/\n/).filter(Boolean);
    const dataRows = lines.filter(l => !/^\|?\s*[-:\s|]+\s*\|?$/.test(l.trim()));
    return (
      <div data-block-id={block.id} onClick={onSelect} style={{ margin: "0.8em 0" }}>
        <table className="preview-table" style={{ fontFamily: style.font }}>
          <tbody>
            {dataRows.map((row, ri) => {
              const cells = row.replace(/^\||\|$/g, "").split("|");
              const Tag = ri === 0 ? "th" : "td";
              return (
                <tr key={ri}>
              {cells.map((cell, ci) => {
                const segs = parseInlineMarkdown(cell.trim());
                return (
                  <Tag key={ci}>{segs.map((s, si) => <InlineRun key={si} segment={s} />)}</Tag>
                );
              })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "image") {
    const caption = block.metadata?.caption || block.content;
    return (
      <div data-block-id={block.id} onClick={onSelect} style={{ margin: "1em 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, border: "1px dashed #a3b1a6", background: "#fbfdfd", color: "#68786f", fontStyle: "italic" }}>
          {caption || "Gambar"}
        </div>
        {caption && <p style={{ fontFamily: style.font, fontSize: "11pt", fontStyle: "italic", textAlign: "center", margin: "0.3em 0 1.2em" }}>{caption}</p>}
      </div>
    );
  }

  if (isActive) {
    return (
      <div data-block-id={block.id} onClick={onSelect} style={{ margin: 0 }}>
        <textarea value={block.content} onChange={(e) => onUpdate(e.target.value)}
          style={{ width: "100%", fontFamily: style.font, fontSize: "12pt", lineHeight: 1.5, textAlign: "justify", border: "none", background: "transparent", resize: "none", minHeight: 60, outline: "none" }}
          aria-label="Edit paragraf" />
      </div>
    );
  }

  return (
    <p data-block-id={block.id} onClick={onSelect}
      style={{ fontFamily: style.font, fontSize: "12pt", lineHeight: 1.5, textAlign: "justify", textIndent: "1.27cm", margin: "0.3em 0", cursor: "pointer" }}>
      {segments.map((s, i) => <InlineRun key={i} segment={s} />)}
    </p>
  );
});

export default function DocumentPreview({
  document, activeBlockId, onSelectBlock, onUpdateContent, selectedIds, onSelectionChange
}: DocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeBlockId]);

  const handleSelectBlock = useCallback((id: string) => {
    onSelectionChange([]);
    onSelectBlock(id);
  }, [onSelectionChange, onSelectBlock]);

  const handleUpdateContent = useCallback((block: DocumentBlock, content: string) => {
    onUpdateContent(block, content);
  }, [onUpdateContent]);

  const activeRefCallback = useCallback((el: HTMLDivElement | null) => {
    if (el && el.dataset.blockId === activeBlockId) {
      (activeRef as any).current = el;
    }
  }, [activeBlockId]);

  return (
    <section className="document-preview">
      <div className="preview-page" ref={containerRef}>
        <div className="preview-page-body">
          <div style={{ padding: "24px 56px 48px" }}>
            {document.blocks.map((block) => (
              <div key={block.id} ref={block.id === activeBlockId ? activeRef : undefined} data-block-id={block.id}>
                <WordBlock
                  block={block}
                  templateId={document.templateId}
                  isActive={block.id === activeBlockId}
                  onSelect={() => handleSelectBlock(block.id)}
                  onUpdate={(content) => handleUpdateContent(block, content)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

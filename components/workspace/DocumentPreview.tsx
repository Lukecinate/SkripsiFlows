"use client";
import { useRef, useEffect } from "react";
import type { DocumentBlock, SkripsiDocument } from "../../lib/document-model";
import { resolveBlockStyle } from "../../lib/template";
import CampusLogo from "./CampusLogo";

interface DocumentPreviewProps {
  document: SkripsiDocument;
  activeBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateContent: (block: DocumentBlock, content: string) => void;
}

function PreviewBlock({
  block, document, isActive, onSelect, onUpdate,
}: {
  block: DocumentBlock;
  document: SkripsiDocument;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (content: string) => void;
}) {
  const style = resolveBlockStyle(block, document.templateId);
  const fontSize = `${style.size * 1.33}pt`;
  const lineHeight = block.type === "paragraph" || block.type === "reference" ? "1.8" : "1.4";
  const textAlign = style.alignment || "left";

  if (block.type === "table") {
    const rows = block.content.split(/\n/).filter(Boolean).map((r) =>
      r.split("|").map((c) => c.trim()).filter(Boolean)
    );
    return (
      <div
        className={`preview-block preview-block-table ${isActive ? "is-active" : ""}`}
        onClick={onSelect}
      >
        <table className="preview-table">
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      className={`preview-block preview-block-${block.type} ${isActive ? "is-active" : ""}`}
      onClick={onSelect}
    >
      {isActive ? (
        <textarea
          className="preview-block-editor"
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          style={{
            fontFamily: style.font,
            fontSize,
            lineHeight,
            textAlign: textAlign as "left" | "center" | "right" | "justify",
            fontWeight: style.bold ? 700 : 400,
            fontStyle: style.italic ? "italic" : "normal",
          }}
          aria-label={`Edit ${block.type}`}
        />
      ) : (
        <p
          style={{
            fontFamily: style.font,
            fontSize,
            lineHeight,
            textAlign: textAlign as "left" | "center" | "right" | "justify",
            fontWeight: style.bold ? 700 : 400,
            fontStyle: style.italic ? "italic" : "normal",
            margin: 0,
          }}
        >
          {block.content}
        </p>
      )}
    </div>
  );
}

export default function DocumentPreview({
  document, activeBlockId, onSelectBlock, onUpdateContent,
}: DocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeBlockId]);

  return (
    <section className="document-preview">
      <div className="preview-page" ref={containerRef}>
        <div className="preview-page-header">
          <CampusLogo className="preview-campus-logo" />
        </div>
        <div className="preview-page-body">
          {document.blocks.map((block) => (
            <div key={block.id} ref={block.id === activeBlockId ? activeRef : undefined}>
              <PreviewBlock
                block={block}
                document={document}
                isActive={block.id === activeBlockId}
                onSelect={() => onSelectBlock(block.id)}
                onUpdate={(content) => onUpdateContent(block, content)}
              />
            </div>
          ))}
        </div>
        <div className="preview-page-footer">
          <span className="preview-page-number">1</span>
        </div>
      </div>
    </section>
  );
}

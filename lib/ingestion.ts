import type { DocumentBlock, SkripsiDocument } from "./document-model";

export type InputKind = "markdown" | "plain-text" | "paste";
export interface SourceInput { kind: InputKind; name?: string; extension?: string; content: string; }
export interface IngestionIssue { code: "EMPTY_CONTENT" | "UNSUPPORTED_EXTENSION" | "CONTENT_TOO_LARGE" | "AMBIGUOUS_STRUCTURE"; message: string; line?: number; severity: "error" | "warning"; }
export interface IngestionResult { document: SkripsiDocument | null; issues: IngestionIssue[]; }

const MAX_CONTENT_LENGTH = 2_000_000;
const SUPPORTED_EXTENSIONS = new Set([".md", ".markdown", ".txt"]);

function normalizeLineEndings(content: string): string { return content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n"); }
function confidenceFor(type: DocumentBlock["type"], content: string): number {
  if (type === "chapter") return 0.98;
  if (type === "section") return 0.96;
  if (type === "paragraph") return content.trim().length > 30 ? 0.96 : 0.78;
  if (type === "list" || type === "quote") return 0.94;
  if (type === "table") return 0.86;
  return 0.7;
}
function createBlock(type: DocumentBlock["type"], content: string, source: InputKind, index: number, line: number): DocumentBlock {
  const confidence = confidenceFor(type, content);
  return { id: `block-${index + 1}`, type, content, confidence, confidenceLevel: confidence >= 0.9 ? "high" : confidence >= 0.8 ? "medium" : "low", source, needsReview: confidence < 0.9, metadata: { sourceLine: String(line) } };
}
function detectHeading(line: string): { type: "chapter" | "section"; content: string } | null {
  const trimmed = line.trim();
  if (/^#{1,2}\s+/.test(trimmed)) { const heading = trimmed.replace(/^#{1,2}\s+/, "").trim(); return /^BAB\s+[IVXLCDM0-9]+\b/i.test(heading) ? { type: "chapter", content: heading } : { type: "section", content: heading }; }
  if (/^BAB\s+[IVXLCDM0-9]+(?:\s*[-:.].*)?$/i.test(trimmed)) return { type: "chapter", content: trimmed };
  if (/^\d+(?:\.\d+)+[.)]?\s+.+/.test(trimmed)) return { type: "section", content: trimmed };
  return null;
}
function parseBlocks(input: SourceInput): { blocks: DocumentBlock[]; issues: IngestionIssue[] } {
  const lines = normalizeLineEndings(input.content).split("\n"); const blocks: DocumentBlock[] = []; const issues: IngestionIssue[] = []; let paragraph: string[] = []; let paragraphLine = 1; let index = 0;
  const flushParagraph = () => { const content = paragraph.join(" ").replace(/\s+/g, " ").trim(); if (!content) return; const type = /^[-*+]\s+|^\d+[.)]\s+/.test(content) ? "list" : "paragraph"; blocks.push(createBlock(type, content.replace(/^([-*+]\s+|\d+[.)]\s+)/, ""), input.kind, index++, paragraphLine)); paragraph = []; };
  for (let cursor = 0; cursor < lines.length; cursor += 1) { const line = lines[cursor]; const trimmed = line.trim(); if (!trimmed) { flushParagraph(); continue; } const heading = detectHeading(line); if (heading) { flushParagraph(); blocks.push(createBlock(heading.type, heading.content, input.kind, index++, cursor + 1)); continue; } if (/^\|.*\|$/.test(trimmed)) { flushParagraph(); blocks.push(createBlock("table", trimmed, input.kind, index++, cursor + 1)); continue; } if (/^>\s+/.test(trimmed)) { flushParagraph(); blocks.push(createBlock("quote", trimmed.replace(/^>\s+/, ""), input.kind, index++, cursor + 1)); continue; } if (!paragraph.length) paragraphLine = cursor + 1; paragraph.push(trimmed.replace(/^```.*|```$/g, "").trim()); }
  flushParagraph(); if (blocks.some((block) => block.needsReview)) issues.push({ code: "AMBIGUOUS_STRUCTURE", message: "Beberapa bagian perlu dikonfirmasi sebelum diekspor.", severity: "warning" }); return { blocks, issues };
}
export function ingestSource(input: SourceInput): IngestionResult {
  const content = normalizeLineEndings(input.content); const issues: IngestionIssue[] = [];
  if (!content.trim()) issues.push({ code: "EMPTY_CONTENT", message: "Dokumen masih kosong.", severity: "error" });
  if (content.length > MAX_CONTENT_LENGTH) issues.push({ code: "CONTENT_TOO_LARGE", message: "Ukuran dokumen melebihi batas 2 MB.", severity: "error" });
  if (input.extension && !SUPPORTED_EXTENSIONS.has(input.extension.toLowerCase())) issues.push({ code: "UNSUPPORTED_EXTENSION", message: "Format file harus .md, .markdown, atau .txt.", severity: "error" });
  if (issues.some((issue) => issue.severity === "error")) return { document: null, issues };
  const parsed = parseBlocks({ ...input, content }); const allIssues = [...issues, ...parsed.issues]; const now = new Date().toISOString();
  return { issues: allIssues, document: { schemaVersion: 1, id: `session-${Date.now()}`, title: input.name?.replace(/\.(md|markdown|txt)$/i, "") || "Dokumen baru", templateId: "indonesia-standard-v1", citationStyle: "apa-7", blocks: parsed.blocks, references: [], reviewRequired: parsed.blocks.some((block) => block.needsReview), createdAt: now, updatedAt: now } };
}

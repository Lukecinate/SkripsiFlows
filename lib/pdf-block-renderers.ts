/**
 * PDF Block Renderers
 * 
 * Fungsi-fungsi untuk merender block dokumen ke PDF.
 * Table renderer ada di ./pdf-table-renderer.ts
 * 
 * @module pdf-block-renderers
 */

import type { PDFFont, PDFPage } from "pdf-lib";
import type { DocumentBlock, ReferenceEntry, SkripsiDocument } from "./document-model";
import type { InlineSegment } from "./ingestion";
import { formatReference, type CitationStyle } from "./citation";
import { resolveBlockStyle } from "./template";
import {
  sanitizeForPdf, parseInlineSegments, selectFont,
  drawCenteredText, buildLines, drawWrapped, ensurePageSpace,
  type PageCursor,
} from "./pdf-helpers";

// ─── Constants ──────────────────────────────────────────────────────────────

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 113.39;
const MARGIN_TOP = 70.87;
const MARGIN_BOTTOM = 70.87;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - 70.87;
const BODY_LINE = 18;
const PARAGRAPH_LINE = 18;

// ─── Helpers ────────────────────────────────────────────────────────────────

function ensureSpace(
  cursor: PageCursor,
  needed: number,
  fonts: Record<string, PDFFont>,
  pageLabel: string | null
): PageCursor {
  return ensurePageSpace(
    cursor.pdf, cursor, needed, fonts,
    PAGE_WIDTH, PAGE_HEIGHT, MARGIN_TOP, MARGIN_BOTTOM,
    TEXT_WIDTH, MARGIN_LEFT, pageLabel
  );
}

// ─── Chapter Renderer ───────────────────────────────────────────────────────

/** Render chapter (BAB) - selalu di halaman baru */
export function renderChapter(
  block: DocumentBlock,
  chapterNumber: number,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  bodyPageCount: number
): { cursor: PageCursor; bodyPageCount: number } {
  if (cursor.y !== PAGE_HEIGHT - MARGIN_TOP) {
    bodyPageCount++;
    cursor = { pdf: cursor.pdf, page: cursor.page, y: PAGE_HEIGHT - MARGIN_TOP, index: bodyPageCount };
  }

  const chapterY = PAGE_HEIGHT - 200;
  const numLine = block.metadata?.headingNumber?.toUpperCase() ?? `BAB ${chapterNumber}`;
  drawCenteredText(cursor.page, numLine, fonts.bold, 12, chapterY, TEXT_WIDTH, MARGIN_LEFT);

  const segments = parseInlineSegments(block);
  const titleText = (block.metadata?.tocTitle?.trim() || segments.map((s) => s.text).join("").trim()).toUpperCase();
  drawCenteredText(cursor.page, titleText, fonts.bold, 12, chapterY - BODY_LINE * 2, TEXT_WIDTH, MARGIN_LEFT);

  cursor.y = chapterY - BODY_LINE * 5;
  return { cursor, bodyPageCount };
}

// ─── Section Renderers ──────────────────────────────────────────────────────

/** Render section heading (contoh: 1.1 Pendahuluan) */
export function renderSection(
  block: DocumentBlock,
  chapterNum: number,
  sectionNum: number,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  pageLabel: string
): PageCursor {
  cursor = ensureSpace(cursor, BODY_LINE * 3, fonts, pageLabel);
  const heading = `${chapterNum > 0 ? chapterNum : ""}.${sectionNum} ${
    block.metadata?.tocTitle?.trim() || block.content.split(/\n/)[0]?.trim() || ""
  }`.trim();

  cursor.page.drawText(sanitizeForPdf(heading, fonts), { x: MARGIN_LEFT, y: cursor.y, size: 12, font: fonts.bold });
  cursor.y -= BODY_LINE * 2;
  return cursor;
}

/** Render subchapter heading (contoh: 1.1.1 Latar Belakang) */
export function renderSubchapter(
  block: DocumentBlock,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  pageLabel: string
): PageCursor {
  cursor = ensureSpace(cursor, BODY_LINE * 3, fonts, pageLabel);
  const heading = block.metadata?.tocTitle?.trim() || block.content.split(/\n/)[0]?.trim() || "";

  cursor.page.drawText(sanitizeForPdf(heading, fonts), { x: MARGIN_LEFT, y: cursor.y, size: 12, font: fonts.bold });
  cursor.y -= BODY_LINE * 1.5;
  return cursor;
}

// ─── Image Renderer ─────────────────────────────────────────────────────────

/** Render gambar (placeholder) dengan caption */
export function renderImage(
  block: DocumentBlock,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  pageLabel: string
): PageCursor {
  const caption = block.metadata?.caption?.trim() || block.content.trim() || "Gambar";
  const number = block.metadata?.figureNumber ?? "";
  const captionText = number ? `Gambar ${number} ${caption}` : caption;

  cursor = ensureSpace(cursor, 220, fonts, pageLabel);
  const boxHeight = 180;

  cursor.page.drawRectangle({
    x: MARGIN_LEFT, y: cursor.y - boxHeight, width: TEXT_WIDTH, height: boxHeight, borderWidth: 0.5,
  });
  cursor.page.drawText(sanitizeForPdf("[ Gambar ]", fonts), {
    x: MARGIN_LEFT + TEXT_WIDTH / 2 - 25, y: cursor.y - boxHeight / 2, size: 12, font: fonts.italic,
  });

  cursor.y -= boxHeight + 6;
  const capW = fonts.italic.widthOfTextAtSize(sanitizeForPdf(captionText, fonts), 12);
  cursor.page.drawText(sanitizeForPdf(captionText, fonts), {
    x: MARGIN_LEFT + (TEXT_WIDTH - capW) / 2, y: cursor.y, size: 12, font: fonts.italic,
  });
  cursor.y -= BODY_LINE * 2;
  return cursor;
}

// ─── List Renderer ──────────────────────────────────────────────────────────

/** Render list (ordered atau bullet) */
export function renderList(
  block: DocumentBlock,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  templateId: string,
  pageLabel: string
): PageCursor {
  const style = resolveBlockStyle(block, templateId);
  const ordered = block.metadata?.listType === "ordered";
  const items = block.content.split(/\n/).filter(Boolean);
  let n = 1;

  for (const line of items) {
    cursor = ensureSpace(cursor, BODY_LINE, fonts, pageLabel);
    const text = line.replace(/^([-*+]\s+|\d+[.)]\s+|#\s+)/, "");
    const marker = ordered ? `${n}.` : "•";
    const segments: InlineSegment[] = [{ text: `${marker} ${text}`, marks: [] }];
    const { lines } = buildLines(segments, style, fonts, TEXT_WIDTH - 18);
    cursor.y = drawWrapped(cursor.page, lines, fonts, style, cursor.y, TEXT_WIDTH - 18, MARGIN_LEFT, TEXT_WIDTH);
    n++;
  }

  cursor.y -= 6;
  return cursor;
}

// ─── Quote Renderer ─────────────────────────────────────────────────────────

/** Render kutipan/blockquote */
export function renderQuote(
  block: DocumentBlock,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  templateId: string,
  pageLabel: string
): PageCursor {
  const style = resolveBlockStyle(block, templateId);
  const { lines } = buildLines(parseInlineSegments(block), style, fonts, TEXT_WIDTH - 28);

  cursor = ensureSpace(cursor, lines.length * PARAGRAPH_LINE, fonts, pageLabel);
  cursor.y = drawWrapped(cursor.page, lines, fonts, style, cursor.y, TEXT_WIDTH - 28, MARGIN_LEFT, TEXT_WIDTH);
  cursor.y -= 6;
  return cursor;
}

// ─── Reference Renderer ─────────────────────────────────────────────────────

/** Render daftar pustaka */
export function renderReferences(
  block: DocumentBlock,
  document: SkripsiDocument,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  templateId: string,
  pageLabel: string
): PageCursor {
  cursor = ensureSpace(cursor, BODY_LINE * 2, fonts, pageLabel);
  const title = (block.metadata?.tocTitle?.trim() || "DAFTAR PUSTAKA").toUpperCase();
  drawCenteredText(cursor.page, title, fonts.bold, 12, cursor.y, TEXT_WIDTH, MARGIN_LEFT);
  cursor.y -= BODY_LINE * 2;

  const style = resolveBlockStyle(block, templateId);
  const citationStyle: CitationStyle = (document.citationStyle as CitationStyle) || "apa-7";
  const entries = block.content.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const refs: ReferenceEntry[] = document.references ?? [];
  const items = entries.length ? entries : refs.map((ref, idx) => formatReference(ref, citationStyle, idx));

  for (const entry of items) {
    const segments: InlineSegment[] = [{ text: entry, marks: [] }];
    const { lines } = buildLines(segments, style, fonts, TEXT_WIDTH - 18);
    cursor = ensureSpace(cursor, lines.length * PARAGRAPH_LINE, fonts, pageLabel);
    cursor.y = drawWrapped(cursor.page, lines, fonts, style, cursor.y, TEXT_WIDTH - 18, MARGIN_LEFT, TEXT_WIDTH);
    cursor.y -= 4;
  }

  return cursor;
}

// ─── Paragraph Renderer ─────────────────────────────────────────────────────

/** Render paragraf biasa (default block type) */
export function renderParagraph(
  block: DocumentBlock,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  templateId: string,
  pageLabel: string
): PageCursor {
  const style = resolveBlockStyle(block, templateId);
  const firstLineIndent = (style.spacing?.firstLine ?? 709) / 2.835;
  const leftIndent = (style.spacing?.left ?? 0) / 2.835;
  const usable = TEXT_WIDTH - leftIndent;

  const segments = parseInlineSegments(block);
  const { lines, totalLines } = buildLines(segments, style, fonts, usable);

  cursor = ensureSpace(cursor, totalLines * PARAGRAPH_LINE, fonts, pageLabel);
  cursor.y = drawWrapped(cursor.page, lines, fonts, style, cursor.y, usable, MARGIN_LEFT, TEXT_WIDTH, firstLineIndent);
  cursor.y -= 4;
  return cursor;
}

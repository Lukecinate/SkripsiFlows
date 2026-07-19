/**
 * PDF Export - Konversi SkripsiDocument ke PDF
 * 
 * File ini mengorkestrasi proses export PDF:
 * 1. Validasi dokumen
 * 2. Setup PDF dan font
 * 3. Render cover, front matter, dan body
 * 4. Serialize ke ArrayBuffer
 * 
 * Block renderers ada di ./pdf-block-renderers.ts
 * Helper functions ada di ./pdf-helpers.ts
 * 
 * @module export-pdf
 */

import { PDFDocument, StandardFonts } from "pdf-lib";
import type { DocumentMetadata, SkripsiDocument } from "./document-model";
import { getTemplate } from "./template";
import { buildToc } from "./toc";
import { safeFilename, drawCenteredText, drawPageNumber, roman, drawTocEntries, type PageCursor } from "./pdf-helpers";
import {
  renderChapter, renderSection, renderSubchapter,
  renderImage, renderReferences,
  renderList, renderQuote, renderParagraph,
} from "./pdf-block-renderers";
import { renderTable } from "./pdf-table-renderer";

// ─── Export Types ───────────────────────────────────────────────────────────

export interface PdfExportResult {
  filename: string;
  mimeType: "application/pdf";
  data: ArrayBuffer;
}

// ─── Page Layout Constants ──────────────────────────────────────────────────

/** Standar BINUS: A4 portrait */
const PAGE_WIDTH = 595.28;  // ~21 cm
const PAGE_HEIGHT = 841.89; // ~29.7 cm

/** Standar BINUS: margin kiri 4 cm, lainnya ~2.5 cm */
const MARGIN_LEFT = 113.39;
const MARGIN_TOP = 70.87;
const MARGIN_BOTTOM = 70.87;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - 70.87;

/** Standar BINUS: spasi 1.5 = 18pt */
const BODY_LINE = 18;

// ─── Cover Renderer ─────────────────────────────────────────────────────────

/**
 * Render halaman cover (sampul) sesuai template BINUS
 */
function renderCover(
  pdf: Awaited<ReturnType<typeof PDFDocument.create>>,
  document: SkripsiDocument,
  fonts: Record<string, import("pdf-lib").PDFFont>,
  meta: DocumentMetadata
): void {
  const cover = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN_TOP - 40;

  // Judul dokumen
  for (const line of document.title.split(/\n/).filter(Boolean)) {
    y = drawCenteredText(cover, line.toUpperCase(), fonts.bold, 14, y, TEXT_WIDTH, MARGIN_LEFT);
    y -= 4;
  }
  y -= 30;

  // Judul bahasa Inggris (opsional)
  if (meta.englishTitle) {
    y = drawCenteredText(cover, meta.englishTitle, fonts.italic, 12, y, TEXT_WIDTH, MARGIN_LEFT);
    y -= 12;
  }
  y -= 30;

  // Subtitle standar
  y = drawCenteredText(cover, "LAPORAN SKRIPSI", fonts.bold, 12, y, TEXT_WIDTH, MARGIN_LEFT);
  y = drawCenteredText(cover, "Diajukan untuk memenuhi salah satu persyaratan", fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT);
  y = drawCenteredText(cover, "dalam menyelesaikan program sarjana", fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT);
  y -= 40;

  // Info penulis
  if (meta.authors?.length) {
    const nim = meta.nim?.length ? ` (${meta.nim.join(", ")})` : "";
    y = drawCenteredText(cover, `Oleh: ${meta.authors.join(", ")}${nim}`, fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT);
    y -= 6;
  }
  if (meta.program) { y = drawCenteredText(cover, meta.program, fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT); y -= 6; }
  if (meta.faculty) { y = drawCenteredText(cover, meta.faculty, fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT); y -= 6; }
  y = drawCenteredText(cover, meta.institution ?? "Universitas Bina Nusantara", fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT);
  if (meta.campus) { y = drawCenteredText(cover, meta.campus, fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT); }
  y -= 40;

  // Logo placeholder dan lokasi
  y = drawCenteredText(cover, `(Logo Universitas)`, fonts.italic, 10, y, TEXT_WIDTH, MARGIN_LEFT);
  y -= 30;
  drawCenteredText(cover, `${meta.city ?? "Jakarta"}, ${meta.year ?? new Date().getFullYear()}`, fonts.normal, 12, y, TEXT_WIDTH, MARGIN_LEFT);
}

// ─── Front Matter Renderer ─────────────────────────────────────────────────

/**
 * Render Daftar Isi, Daftar Tabel, dan Daftar Gambar
 */
function renderFrontMatter(
  pdf: Awaited<ReturnType<typeof PDFDocument.create>>,
  toc: ReturnType<typeof buildToc>,
  fonts: Record<string, import("pdf-lib").PDFFont>,
  startPage: number
): number {
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageNum = startPage + 1;
  let y = PAGE_HEIGHT - MARGIN_TOP;

  // Daftar Isi
  y = drawCenteredText(page, "DAFTAR ISI", fonts.bold, 12, y, TEXT_WIDTH, MARGIN_LEFT);
  y -= BODY_LINE;
  y = drawTocEntries(page, toc.heading.map((e) => ({ number: e.number, title: e.title, level: e.level })), fonts, y, MARGIN_LEFT, BODY_LINE);
  drawPageNumber(page, roman(pageNum), fonts, TEXT_WIDTH, MARGIN_LEFT, MARGIN_BOTTOM);

  // Daftar Tabel
  if (toc.tables.length > 0) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum++;
    y = PAGE_HEIGHT - MARGIN_TOP;
    y = drawCenteredText(page, "DAFTAR TABEL", fonts.bold, 12, y, TEXT_WIDTH, MARGIN_LEFT);
    y -= BODY_LINE;
    y = drawTocEntries(page, toc.tables, fonts, y, MARGIN_LEFT, BODY_LINE);
    drawPageNumber(page, roman(pageNum), fonts, TEXT_WIDTH, MARGIN_LEFT, MARGIN_BOTTOM);
  }

  // Daftar Gambar
  if (toc.figures.length > 0) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum++;
    y = PAGE_HEIGHT - MARGIN_TOP;
    y = drawCenteredText(page, "DAFTAR GAMBAR", fonts.bold, 12, y, TEXT_WIDTH, MARGIN_LEFT);
    y -= BODY_LINE;
    y = drawTocEntries(page, toc.figures, fonts, y, MARGIN_LEFT, BODY_LINE);
    drawPageNumber(page, roman(pageNum), fonts, TEXT_WIDTH, MARGIN_LEFT, MARGIN_BOTTOM);
  }

  return pageNum - startPage;
}

// ─── Main Export Function ───────────────────────────────────────────────────

/**
 * Export SkripsiDocument ke PDF
 * 
 * @param document - Dokumen yang akan di-export
 * @param filename - Nama file output (akan di-sanitize)
 * @returns PdfExportResult dengan filename, mimeType, dan data
 * @throws Error jika dokumen belum memiliki judul
 */
export async function exportPdf(
  document: SkripsiDocument,
  filename = "skripsiflow-document.pdf"
): Promise<PdfExportResult> {
  if (!document.title.trim()) {
    throw new Error("Dokumen belum memiliki judul.");
  }

  // Setup
  const pdf = await PDFDocument.create();
  const fonts = {
    normal: await pdf.embedFont(StandardFonts.TimesRoman),
    bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
    italic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
    boldItalic: await pdf.embedFont(StandardFonts.TimesRomanBoldItalic),
  };
  void getTemplate(document.templateId);

  const toc = buildToc(document);
  const meta: DocumentMetadata = document.documentMetadata ?? {};

  // 1) Cover
  renderCover(pdf, document, fonts, meta);

  // 2) Front matter
  renderFrontMatter(pdf, toc, fonts, 1);

  // 3) Body
  let cursor: PageCursor = {
    pdf,
    page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - MARGIN_TOP,
    index: 1,
  };
  let bodyPageCount = 1;
  let chapterNumber = 0;
  let sectionNumber = 0;

  for (const block of document.blocks) {
    const label = String(bodyPageCount);

    switch (block.type) {
      case "chapter": {
        chapterNumber++;
        sectionNumber = 0;
        const result = renderChapter(block, chapterNumber, cursor, fonts, bodyPageCount);
        cursor = result.cursor;
        bodyPageCount = result.bodyPageCount;
        break;
      }
      case "section":
        sectionNumber++;
        cursor = renderSection(block, chapterNumber, sectionNumber, cursor, fonts, label);
        break;
      case "subchapter":
        cursor = renderSubchapter(block, cursor, fonts, label);
        break;
      case "table":
        cursor = renderTable(block, cursor, fonts, label);
        break;
      case "image":
        cursor = renderImage(block, cursor, fonts, label);
        break;
      case "list":
        cursor = renderList(block, cursor, fonts, document.templateId, label);
        break;
      case "quote":
        cursor = renderQuote(block, cursor, fonts, document.templateId, label);
        break;
      case "reference":
        cursor = renderReferences(block, document, cursor, fonts, document.templateId, label);
        break;
      default:
        cursor = renderParagraph(block, cursor, fonts, document.templateId, label);
        break;
    }
  }

  // Serialize
  const data = await pdf.save();
  return {
    filename: safeFilename(filename),
    mimeType: "application/pdf",
    data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
  };
}

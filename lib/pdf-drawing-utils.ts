/**
 * PDF Drawing Utilities
 * 
 * Fungsi-fungsi untuk menggambar teks dan lines di PDF.
 * Dipisah untuk mematuhi batas 300 baris per file.
 * 
 * @module pdf-drawing-utils
 */

import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TemplateStyle } from "./template";
import type { InlineSegment } from "./ingestion";
import { sanitizeForPdf, selectFont } from "./pdf-text-utils";

// ─── Constants ──────────────────────────────────────────────────────────────

/** Warna default untuk semua teks PDF */
const TEXT_COLOR = rgb(0.09, 0.13, 0.11);

// ─── Types ──────────────────────────────────────────────────────────────────

/** Satu kata yang sudah di-sanitize dan siap di-draw */
export interface SanitizedWord {
  text: string;
  sanitized: string;
  font: PDFFont;
}

/** Satu baris yang berisi kumpulan kata */
export interface DrawLine {
  items: SanitizedWord[];
}

/** Tipe alignment untuk text */
export type TextAlignment = "center" | "right" | "left";

// ─── Text Drawing ───────────────────────────────────────────────────────────

/**
 * Draw teks yang di-center secara horizontal
 * 
 * @returns Y position setelah teks (untuk teks berikutnya)
 */
export function drawCenteredText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  textWidth: number,
  marginLeft: number
): number {
  const clean = sanitizeForPdf(text, { normal: font } as Record<string, PDFFont>);
  const width = font.widthOfTextAtSize(clean, size);
  const x = marginLeft + (textWidth - width) / 2;
  
  page.drawText(clean, { x, y, size, font, color: TEXT_COLOR });
  return y - size - 8;
}

/**
 * Draw nomor halaman di posisi yang ditentukan
 */
export function drawPageNumber(
  page: PDFPage,
  label: string,
  fonts: Record<string, PDFFont>,
  textWidth: number,
  marginLeft: number,
  marginBottom: number,
  position: TextAlignment = "center"
): void {
  const text = sanitizeForPdf(label, fonts);
  const width = fonts.normal.widthOfTextAtSize(text, 11);
  
  let x: number;
  switch (position) {
    case "center":
      x = marginLeft + (textWidth - width) / 2;
      break;
    case "right":
      x = marginLeft + textWidth - width;
      break;
    case "left":
    default:
      x = marginLeft;
      break;
  }
  
  page.drawText(text, {
    x,
    y: marginBottom - 16,
    size: 11,
    font: fonts.normal,
    color: TEXT_COLOR,
  });
}

// ─── Line Building ──────────────────────────────────────────────────────────

/**
 * Build lines dari segments untuk word-wrapping
 * 
 * @returns Array of DrawLine dan totalLines count
 */
export function buildLines(
  segments: InlineSegment[],
  style: TemplateStyle,
  fonts: Record<string, PDFFont>,
  maxWidth: number
): { lines: DrawLine[]; totalLines: number } {
  // 1) Split segments menjadi kata-kata
  const words: SanitizedWord[] = [];
  for (const segment of segments) {
    const font = selectFont(fonts, segment.marks);
    for (const part of segment.text.split(/(\s+)/)) {
      if (part === "") continue;
      words.push({
        text: part,
        sanitized: sanitizeForPdf(part, fonts),
        font,
      });
    }
  }
  
  // 2) Kelompokkan kata ke baris berdasarkan lebar
  const lines: DrawLine[] = [];
  let currentLine: SanitizedWord[] = [];
  let currentWidth = 0;
  const lineHeight = (style.spacing?.line ?? 360) / 360;
  
  for (const word of words) {
    const wordWidth = word.font.widthOfTextAtSize(word.sanitized, style.size);
    
    // Spasi selalu masuk ke baris saat ini
    if (/^\s+$/.test(word.text)) {
      currentLine.push(word);
      currentWidth += wordWidth;
      continue;
    }
    
    // Jika melebihi maxWidth, mulai baris baru
    if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
      lines.push({ items: currentLine });
      currentLine = [];
      currentWidth = 0;
    }
    
    currentLine.push(word);
    currentWidth += wordWidth;
  }
  
  // Jangan lupa baris terakhir
  if (currentLine.length > 0) {
    lines.push({ items: currentLine });
  }
  
  return {
    lines,
    totalLines: lines.length * lineHeight,
  };
}

/**
 * Draw wrapped text dengan alignment dan justification
 * 
 * @returns Y position setelah semua baris di-draw
 */
export function drawWrapped(
  page: PDFPage,
  lines: DrawLine[],
  fonts: Record<string, PDFFont>,
  style: TemplateStyle,
  y: number,
  maxWidth: number,
  marginLeft: number,
  textWidth: number,
  firstLineIndent = 0
): number {
  const align = style.alignment ?? "justify";
  const isJustified = align === "justify";
  
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx].items;
    const isLastLine = lineIdx === lines.length - 1;
    
    // Hitung total lebar baris
    let totalWidth = 0;
    for (const word of line) {
      totalWidth += word.font.widthOfTextAtSize(word.sanitized, style.size);
    }
    
    // Hitung extra spacing untuk justification
    let extraSpace = 0;
    if (isJustified && !isLastLine) {
      const spaceCount = line.filter((w) => /^\s+$/.test(w.text)).length;
      if (spaceCount > 0) {
        extraSpace = (maxWidth - totalWidth) / spaceCount;
      }
    }
    
    // Hitung posisi X awal berdasarkan alignment
    const indent = lineIdx === 0 ? firstLineIndent : 0;
    let cursorX = marginLeft + indent;
    
    if (align === "center") {
      cursorX = marginLeft + (textWidth - totalWidth) / 2;
    } else if (align === "right") {
      cursorX = marginLeft + textWidth - totalWidth;
    }
    
    // Draw setiap kata
    for (const word of line) {
      page.drawText(word.sanitized, {
        x: cursorX,
        y,
        size: style.size,
        font: word.font,
        color: TEXT_COLOR,
      });
      
      const wordWidth = word.font.widthOfTextAtSize(word.sanitized, style.size);
      const isSpace = /^\s+$/.test(word.text);
      cursorX += wordWidth + (extraSpace && isSpace ? extraSpace : 0);
    }
    
    y -= style.size * 1.5;
  }
  
  return y;
}

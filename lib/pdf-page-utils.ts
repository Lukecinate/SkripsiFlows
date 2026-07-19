/**
 * PDF Page Utilities
 * 
 * Fungsi-fungsi untuk manajemen halaman PDF.
 * Dipisah untuk mematuhi batas 300 baris per file.
 * 
 * @module pdf-page-utils
 */

import type { PDFFont, PDFDocument, PDFPage } from "pdf-lib";
import { sanitizeForPdf } from "./pdf-text-utils";
import { drawPageNumber, type TextAlignment } from "./pdf-drawing-utils";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Posisi cursor di halaman PDF */
export interface PageCursor {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  index: number;
}

// ─── Page Management ────────────────────────────────────────────────────────

/**
 * Pastikan ada cukup space di halaman, atau buat halaman baru
 * 
 * @param pdf - PDFDocument instance (atau object dengan addPage method)
 * @param cursor - Posisi cursor saat ini
 * @param needed - Space yang dibutuhkan (dalam points)
 * @param fonts - Font yang tersedia
 * @param pageWidth - Lebar halaman
 * @param pageHeight - Tinggi halaman
 * @param marginTop - Margin atas
 * @param marginBottom - Margin bawah
 * @param textWidth - Lebar area teks
 * @param marginLeft - Margin kiri
 * @param pageLabel - Label halaman (untuk nomor halaman), null jika tidak perlu
 * @param pageNumberPosition - Posisi nomor halaman
 * @returns Cursor yang sudah di-update
 */
export function ensurePageSpace(
  pdf: PDFDocument,
  cursor: PageCursor,
  needed: number,
  fonts: Record<string, PDFFont>,
  pageWidth: number,
  pageHeight: number,
  marginTop: number,
  marginBottom: number,
  textWidth: number,
  marginLeft: number,
  pageLabel: string | null,
  pageNumberPosition: TextAlignment = "center"
): PageCursor {
  // Masih ada cukup space
  if (cursor.y - needed >= marginBottom) {
    return cursor;
  }
  
  // Draw nomor halaman sebelum buat halaman baru
  if (pageLabel) {
    drawPageNumber(cursor.page, pageLabel, fonts, textWidth, marginLeft, marginBottom, pageNumberPosition);
  }
  
  // Buat halaman baru
  return {
    pdf,
    page: pdf.addPage([pageWidth, pageHeight]),
    y: pageHeight - marginTop,
    index: cursor.index + 1,
  };
}

// ─── Number Formatting ──────────────────────────────────────────────────────

/**
 * Convert angka ke romawi (lowercase)
 * 
 * @example roman(1) → "i", roman(4) → "iv", roman(9) → "ix"
 */
export function roman(num: number): string {
  const pairs: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  
  let result = "";
  let remaining = num;
  
  for (const [value, symbol] of pairs) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  
  return result.toLowerCase();
}

// ─── ToC Rendering ──────────────────────────────────────────────────────────

/**
 * Draw daftar ToC (Daftar Isi, Daftar Tabel, Daftar Gambar)
 * 
 * @returns Y position setelah semua entry di-draw
 */
export function drawTocEntries(
  page: PDFPage,
  entries: Array<{ number: string; title: string; level?: number }>,
  fonts: Record<string, PDFFont>,
  startY: number,
  marginLeft: number,
  bodyLineHeight: number
): number {
  let y = startY;
  
  for (const entry of entries) {
    const levelIndent = entry.level && entry.level > 1
      ? (entry.level - 1) * 16
      : 0;
    
    const label = `${entry.number} ${entry.title}`.trim();
    const clean = sanitizeForPdf(label, fonts);
    
    page.drawText(clean, {
      x: marginLeft + levelIndent,
      y,
      size: 12,
      font: fonts.normal,
    });
    
    y -= bodyLineHeight;
  }
  
  return y;
}

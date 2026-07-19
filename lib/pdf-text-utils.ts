/**
 * PDF Text Utilities
 * 
 * Fungsi-fungsi untuk sanitasi teks dan parsing inline segments.
 * Dipisah untuk mematuhi batas 300 baris per file.
 * 
 * @module pdf-text-utils
 */

import type { PDFFont } from "pdf-lib";
import type { DocumentBlock } from "./document-model";
import type { InlineSegment } from "./ingestion";

// ─── Font Selection ─────────────────────────────────────────────────────────

/**
 * Pilih font berdasarkan marks (bold, italic, dll)
 * 
 * @param fonts - Map font yang tersedia
 * @param marks - Array marks seperti ["bold", "italic"]
 * @returns Font yang sesuai
 */
export function selectFont(
  fonts: Record<string, PDFFont>,
  marks: string[]
): PDFFont {
  const hasBold = marks.includes("bold");
  const hasItalic = marks.includes("italic");
  
  if (hasBold && hasItalic) return fonts.boldItalic;
  if (hasBold) return fonts.bold;
  if (hasItalic) return fonts.italic;
  return fonts.normal;
}

// ─── Inline Segment Parsing ─────────────────────────────────────────────────

/**
 * Parse inline segments dari block metadata
 * 
 * @param block - Document block yang akan di-parse
 * @returns Array InlineSegment
 */
export function parseInlineSegments(block: DocumentBlock): InlineSegment[] {
  try {
    const raw = block.metadata?.inline;
    if (!raw) return [{ text: block.content, marks: [] }];
    
    const parsed = JSON.parse(raw) as InlineSegment[];
    return parsed.length > 0 ? parsed : [{ text: block.content, marks: [] }];
  } catch {
    return [{ text: block.content, marks: [] }];
  }
}

// ─── Text Sanitization ─────────────────────────────────────────────────────

/** Cache untuk code points yang didukung font */
let supportedCodePoints: Set<number> | null = null;

/** 
 * Substitusi karakter yang tidak didukung Times New Roman
 * Mapping dari Unicode code point ke representasi ASCII
 */
const FALLBACK_SUBSTITUTIONS: Record<number, string> = {
  // Zero-width dan invisible characters
  0x0000: "", 0x200B: "", 0xFEFF: "", 0x00AD: "", 0x00A0: " ",
  0x2007: " ", 0x2008: " ", 0x2009: " ", 0x202F: " ",
  
  // Dashes → hyphen
  0x2010: "-", 0x2011: "-", 0x2012: "-", 0x2015: "-", 0x2013: "-", 0x2212: "-",
  
  // Smart quotes → ASCII quotes
  0x2018: "'", 0x2019: "'", 0x201A: "'", 0x201B: "'",
  0x201C: '"', 0x201D: '"', 0x201E: '"', 0x2033: '"',
  
  // Symbols → ASCII equivalents
  0x2026: "...", 0x2039: "<", 0x203A: ">", 0x02C6: "^", 0x02DC: "~",
  0x2020: "+", 0x2021: "+", 0x00B7: ".",
  0x2122: "(TM)", 0x00A9: "(c)", 0x00AE: "(R)",
  
  // Arrows → text
  0x2190: "<-", 0x2192: "->", 0x2194: "<->",
  0x21D2: "=>", 0x21D0: "<=", 0x21D4: "<=>",
  
  // Bullets → dash
  0x2022: "-", 0x25CF: "-",
  
  // Math symbols
  0x221E: "infinity", 0x2260: "!=", 0x2264: "<=", 0x2265: ">=",
  
  // Box drawing → simple chars
  0x2191: "^", 0x2193: "v", 0x2500: "-", 0x2502: "|",
};

/**
 * Sanitize text untuk PDF - ganti karakter yang tidak didukung font
 * 
 * SECURITY: Mencegah character encoding attacks dan memastikan
 * output PDF konsisten tanpa karakter yang corrupt.
 * 
 * @param text - Teks asli dari user
 * @param fonts - Font yang tersedia
 * @returns Teks yang sudah di-sanitize
 */
export function sanitizeForPdf(
  text: string,
  fonts: Record<string, PDFFont>
): string {
  if (!text) return "";
  
  // Lazy-init supported code points cache
  if (!supportedCodePoints) {
    supportedCodePoints = new Set(fonts.normal.getCharacterSet());
  }
  
  let result = "";
  
  for (const char of text) {
    const code = char.codePointAt(0)!;
    
    // 1) Karakter didukung → langsung pakai
    if (supportedCodePoints.has(code)) {
      result += char;
      continue;
    }
    
    // 2) Ada substitusi → pakai substitusi
    const fallback = FALLBACK_SUBSTITUTIONS[code];
    if (fallback !== undefined) {
      result += fallback;
      continue;
    }
    
    // 3) Coba decompose (NFKD) dan ambil karakter yang didukung
    const decomposed = char.normalize("NFKD");
    if (decomposed !== char) {
      let kept = "";
      for (const d of decomposed) {
        if (supportedCodePoints.has(d.codePointAt(0)!)) {
          kept += d;
        }
      }
      result += kept || "?";
      continue;
    }
    
    // 4) Fallback terakhir
    result += "?";
  }
  
  return result;
}

// ─── Filename Sanitization ─────────────────────────────────────────────────

/** Ekstensi yang dianggap berbahaya dan harus dihapus */
const DANGEROUS_EXTENSIONS = /\.(pdf|docx?|exe|bat|cmd|sh|js|ts)$/gi;

/**
 * Sanitize filename untuk PDF export
 * 
 * SECURITY: Mencegah path traversal dan filename injection
 * 
 * @param filename - Filename dari user
 * @returns Filename yang aman
 */
export function safeFilename(filename: string): string {
  const normalized = filename
    .normalize("NFKC")
    .replace(/[^\w .-]/g, "-")
    .trim();
  
  const base = normalized.replace(DANGEROUS_EXTENSIONS, "");
  const safe = (base || "skripsiflow-document").slice(0, 120);
  
  return `${safe}.pdf`;
}

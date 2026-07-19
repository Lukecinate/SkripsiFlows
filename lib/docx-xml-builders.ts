/**
 * DOCX XML Builders
 * 
 * Fungsi-fungsi untuk membangun XML elements untuk DOCX export.
 * Dipisah untuk mematuhi batas 300 baris per file.
 * 
 * @module docx-xml-builders
 */

import type { TemplateStyle } from "./template";

// ─── XML Escaping ───────────────────────────────────────────────────────────

/** Map karakter yang perlu di-escape dalam XML */
const XML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

/** Regex untuk mencari karakter yang perlu di-escape */
const XML_ESCAPE_RE = /[&<>"']/g;

/** Cache untuk hasil escaping (menghindari re-escape string yang sama) */
const xmlEscapeCache = new Map<string, string>();

/**
 * Escape karakter khusus dalam XML
 * 
 * SECURITY: Mencegah XML injection dengan meng-escape karakter
 * yang bisa mengubah struktur XML.
 * 
 * @param value - String yang akan di-escape
 * @returns String yang sudah aman untuk XML
 */
export function escapeXml(value: string): string {
  let cached = xmlEscapeCache.get(value);
  if (cached !== undefined) return cached;
  
  cached = value.replace(XML_ESCAPE_RE, (c) => XML_ESCAPE_MAP[c]);
  
  // Batasi cache size untuk mencegah memory leak
  if (xmlEscapeCache.size < 2048) {
    xmlEscapeCache.set(value, cached);
  }
  
  return cached;
}

/**
 * Hapus control characters yang tidak valid dalam XML
 * 
 * @param value - String yang akan dibersihkan
 * @returns String tanpa control characters
 */
export function safeText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

// ─── Spacing XML ────────────────────────────────────────────────────────────

/**
 * Generate XML attributes untuk paragraph spacing
 * 
 * @param spacing - Spacing configuration dari template
 * @returns XML string untuk spacing dan indentation
 */
export function spacingXml(spacing?: TemplateStyle["spacing"]): string {
  if (!spacing) return "";
  
  const attrs: string[] = [];
  if (typeof spacing.line === "number") attrs.push(`w:line="${spacing.line}"`);
  if (spacing.lineRule) attrs.push(`w:lineRule="${spacing.lineRule}"`);
  if (typeof spacing.before === "number") attrs.push(`w:before="${spacing.before}"`);
  if (typeof spacing.after === "number") attrs.push(`w:after="${spacing.after}"`);
  
  // Handle indentation
  const hasIndent = typeof spacing.firstLine === "number" 
    || typeof spacing.left === "number" 
    || typeof spacing.right === "number" 
    || typeof spacing.hanging === "number";
  
  if (hasIndent) {
    const ind: string[] = [];
    if (typeof spacing.left === "number") ind.push(`w:left="${spacing.left}"`);
    if (typeof spacing.right === "number") ind.push(`w:right="${spacing.right}"`);
    if (typeof spacing.firstLine === "number") ind.push(`w:firstLine="${spacing.firstLine}"`);
    if (typeof spacing.hanging === "number") ind.push(`w:hanging="${spacing.hanging}"`);
    return `<w:spacing ${attrs.join(" ")}/><w:ind ${ind.join(" ")}/>`;
  }
  
  if (!attrs.length) return "";
  return `<w:spacing ${attrs.join(" ")}/>`;
}

// ─── Run XML ────────────────────────────────────────────────────────────────

/**
 * Generate XML untuk satu run (teks dengan formatting)
 * 
 * @param text - Teks yang akan di-render
 * @param style - Style yang digunakan
 * @param marks - Formatting marks (bold, italic, underline)
 * @param forceUpper - Paksa uppercase
 * @returns XML string untuk run
 */
export function runXml(
  text: string,
  style: TemplateStyle,
  marks: string[] = [],
  forceUpper = false
): string {
  const b = marks.includes("bold") || style.bold ? '<w:b/>' : "";
  const i = marks.includes("italic") || style.italic ? '<w:i/>' : "";
  const u = marks.includes("underline") ? '<w:u w:val="single"/>' : "";
  const out = forceUpper ? text.toUpperCase() : text;
  
  return `<w:r><w:rPr><w:rFonts w:ascii="${escapeXml(style.font)}" w:hAnsi="${escapeXml(style.font)}"/>` +
    `<w:sz w:val="${style.size * 2}"/><w:szCs w:val="${style.size * 2}"/>` +
    `${b}${i}${u}</w:rPr>` +
    `<w:t xml:space="preserve">${escapeXml(safeText(out))}</w:t></w:r>`;
}

// ─── Paragraph XML ──────────────────────────────────────────────────────────

/**
 * Generate XML untuk satu paragraph
 * 
 * @param content - Konten paragraph
 * @param style - Style yang digunakan
 * @param forceUpper - Paksa uppercase
 * @param segments - Inline segments (opsional, jika tidak ada akan dibuat dari content)
 * @returns XML string untuk paragraph
 */
export function paragraphXml(
  content: string,
  style: TemplateStyle,
  forceUpper = false,
  segments?: Array<{ text: string; marks: string[] }>
): string {
  const segs = segments ?? [{ text: content, marks: [] }];
  const runs = segs.map((s) => runXml(s.text, style, s.marks, forceUpper)).join("");
  const jc = style.alignment ? `<w:jc w:val="${style.alignment}"/>` : "";
  
  return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/>` +
    `${jc}${spacingXml(style.spacing)}</w:pPr>${runs}</w:p>`;
}

// ─── Page Break XML ─────────────────────────────────────────────────────────

/** Generate XML untuk page break */
export function pageBreakXml(): string {
  return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
}

// ─── Table Grid XML ─────────────────────────────────────────────────────────

/**
 * Generate XML untuk table grid columns
 * 
 * @param colCount - Jumlah kolom
 * @returns XML string untuk table grid
 */
export function tableGridXml(colCount: number): string {
  const cols = Array.from({ length: colCount }, () => '<w:gridCol w:w="2400"/>').join("");
  return `<w:tblGrid>${cols}</w:tblGrid>`;
}

// ─── Alignment Row Detection ────────────────────────────────────────────────

/**
 * Cek apakah baris adalah alignment row (separator dalam tabel Markdown)
 * 
 * @param line - Baris yang akan dicek
 * @returns true jika baris adalah alignment row
 */
export function isAlignmentRow(line: string): boolean {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("---");
}

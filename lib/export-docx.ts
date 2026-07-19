/**
 * DOCX Export - Konversi SkripsiDocument ke DOCX
 * 
 * File ini mengekspor dokumen skripsi ke format DOCX (OOXML).
 * XML builders ada di ./docx-xml-builders.ts
 * Static templates ada di ./docx-templates.ts
 * 
 * @module export-docx
 */

import JSZip from "jszip";
import type { DocumentBlock, SkripsiDocument } from "./document-model";
import type { InlineSegment } from "./ingestion";
import { formatReference, type CitationStyle } from "./citation";
import { getTemplate, resolveBlockStyle, type TemplateStyle } from "./template";
import { buildToc } from "./toc";
import {
  escapeXml, safeText, spacingXml, runXml, paragraphXml,
  pageBreakXml, tableGridXml, isAlignmentRow,
} from "./docx-xml-builders";
import {
  W_NS, R_NS, CONTENT_TYPES, ROOT_RELS, WORD_RELS,
  NUMBERING_XML, SETTINGS_XML, FONT_TABLE_XML,
  FOOTER_FRONT_XML, FOOTER_BODY_XML,
  CORE_XML, APP_XML,
} from "./docx-templates";

// ========== Export Types ==========

export interface ExportResult {
  filename: string;
  mimeType: string;
  data: ArrayBuffer;
}

// ========== Inline Segment Helpers ==========

/** Parse inline segments dari block metadata */
function parseInline(block: DocumentBlock): InlineSegment[] {
  try {
    const raw = block.metadata?.inline;
    if (!raw) return [{ text: block.content, marks: [] }];
    const parsed = JSON.parse(raw) as InlineSegment[];
    return parsed.length > 0 ? parsed : [{ text: block.content, marks: [] }];
  } catch {
    return [{ text: block.content, marks: [] }];
  }
}

// ========== Filename Sanitization ==========

const DANGEROUS_EXTENSIONS = /\.(docx?|pdf|exe|bat|cmd|sh|js|ts)$/gi;

/** Sanitize filename untuk DOCX export */
export function safeFilename(filename: string): string {
  const normalized = filename.normalize("NFKC").replace(/[^\w .-]/g, "-").trim();
  const base = normalized.replace(DANGEROUS_EXTENSIONS, "");
  return `${(base || "skripsiflow-document").slice(0, 120)}.docx`;
}

// ========== Block XML Generators ==========

/** Generate XML untuk chapter block */
function chapterBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const numberStyle = template.styles.chapterNumber;
  const titleStyle = template.styles.chapterTitle;

  const numberText = block.metadata?.headingNumber?.trim() || block.content.split(/\n/)[0]?.trim() || "";
  const titleText = block.metadata?.tocTitle?.trim() || block.content.split(/\n/)[0]?.trim() || "";
  const numberLine = numberText.toUpperCase();

  const segments = parseInline(block);
  const titleSegments = segments.filter((s) => s.text.trim().length > 0);
  const titleRun = titleSegments.map((s) => runXml(s.text, titleStyle, s.marks, true)).join("");

  return [
    paragraphXml(numberLine, numberStyle, true),
    `<w:p><w:pPr><w:pStyle w:val="${escapeXml(titleStyle.styleId)}"/><w:jc w:val="center"/>${spacingXml(titleStyle.spacing)}</w:pPr>${titleRun || runXml(titleText, titleStyle, [], true)}</w:p>`,
  ].join("");
}

/** Generate XML untuk table block */
function tableBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const cellStyle = template.styles.table;
  const titleStyle = template.styles.tableTitle;

  const lines = block.content.split(/\n/).filter((l) => l.trim());
  const hasAlignment = lines.length > 1 && isAlignmentRow(lines[1]);
  const dataStart = hasAlignment ? 2 : 1;
  const headers = lines[0].split("|").filter(Boolean).map((h) => h.trim());
  const rows = lines.slice(dataStart).map((line) => line.split("|").filter(Boolean).map((c) => c.trim()));
  const colCount = headers.length;

  const tableNumber = block.metadata?.tableNumber || "";
  const tocTitle = block.metadata?.tocTitle || `Tabel ${tableNumber}`;

  const titleXml = paragraphXml(`Tabel ${tableNumber}. ${tocTitle}`, titleStyle);
  const gridXml = tableGridXml(colCount);

  const headerRow = headers
    .map((h) => `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>${paragraphXml(h, cellStyle)}</w:tc>`)
    .join("");

  const bodyRows = rows
    .map((row) =>
      row
        .map((cell) => `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>${paragraphXml(cell, cellStyle)}</w:tc>`)
        .join("")
    )
    .map((cells) => `<w:tr>${cells}</w:tr>`)
    .join("");

  return [titleXml, `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="100%" w:type="pct"/></w:tblPr>${gridXml}<w:tr>${headerRow}</w:tr>${bodyRows}</w:tbl>`, pageBreakXml()].join("");
}

/** Generate XML untuk image block */
function imageBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const titleStyle = template.styles.figureTitle;

  const figureNumber = block.metadata?.figureNumber || "";
  const caption = block.metadata?.caption || block.content || "Gambar";

  const titleXml = paragraphXml(`Gambar ${figureNumber}. ${caption}`, titleStyle);
  const placeholder = paragraphXml("[Gambar: " + (block.content || "image.png") + "]", resolveBlockStyle({ ...block, type: "paragraph" }, document.templateId));

  return [titleXml, placeholder, pageBreakXml()].join("");
}

/** Generate XML untuk list block */
function listBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const style = template.styles.list;
  const ordered = block.metadata?.listType === "ordered";

  const items = block.content.split(/\n/).filter(Boolean).map((l) => l.replace(/^([-*+]\s+|\d+[.)]\s+|#\s+)/, ""));
  const listXml = items.map((item, i) => {
    const numXml = ordered ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>';
    return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/><w:ind w:left="720" w:hanging="360"/>${numXml}</w:pPr>${runXml(item, style, [], false)}</w:p>`;
  }).join("");

  return listXml;
}

/** Generate XML untuk quote block */
function quoteBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const style = resolveBlockStyle(block, document.templateId);
  const segments = parseInline(block);
  const runs = segments.map((s) => runXml(s.text, style, s.marks, false)).join("");
  return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/><w:ind w:left="709"/><w:jc w:val="justify"/>${spacingXml(style.spacing)}</w:pPr>${runs}</w:p>`;
}

/** Generate XML untuk reference block */
function referenceBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const style = template.styles.reference;
  const citationStyle = document.citationStyle as CitationStyle;

  const lines = block.content.split(/\n+/).filter(Boolean);
  const refsXml = lines.map((line, i) => {
    const numRun = runXml(`[${i + 1}]`, style, [], false);
    const textRun = runXml(line, style, [], false);
    return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/><w:ind w:left="709" w:hanging="709"/>${spacingXml(style.spacing)}</w:pPr>${numRun}${textRun}</w:p>`;
  }).join("");

  const titleXml = paragraphXml("DAFTAR PUSTAKA", template.styles.tocTitle);
  return titleXml + refsXml;
}

/** Generate XML untuk generic paragraph block */
function paragraphBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const style = resolveBlockStyle(block, document.templateId);
  const segments = parseInline(block);
  const runs = segments.map((s) => runXml(s.text, style, s.marks, false)).join("");
  return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/>${spacingXml(style.spacing)}</w:pPr>${runs}</w:p>`;
}

/** Generate XML untuk section/subchapter block */
function headingBlockXml(block: DocumentBlock, document: SkripsiDocument): string {
  const style = resolveBlockStyle(block, document.templateId);
  const number = block.metadata?.headingNumber?.trim();
  const content = block.content.split(/\n/)[0] || "";
  const displayText = number ? `${number} ${content}` : content;
  const segments = parseInline({ ...block, content: displayText });
  const runs = segments.map((s) => runXml(s.text, style, s.marks, false)).join("");
  return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/>${spacingXml(style.spacing)}</w:pPr>${runs}</w:p>`;
}

/** Dispatch block to appropriate XML generator */
function blockXml(block: DocumentBlock, document: SkripsiDocument): string {
  switch (block.type) {
    case "chapter": return chapterBlockXml(block, document);
    case "section":
    case "subchapter": return headingBlockXml(block, document);
    case "paragraph": return paragraphBlockXml(block, document);
    case "list": return listBlockXml(block, document);
    case "table": return tableBlockXml(block, document);
    case "image": return imageBlockXml(block, document);
    case "quote": return quoteBlockXml(block, document);
    case "reference": return referenceBlockXml(block, document);
    case "page-break": return pageBreakXml();
    default: return paragraphBlockXml(block, document);
  }
}

// ========== Front Matter Generators ==========

/** Cover page XML */
function coverXml(document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const meta = document.documentMetadata ?? {};
  const title = document.title.toUpperCase();
  const subtitle = "LAPORAN SKRIPSI";
  const institution = meta.institution || "Universitas Bina Nusantara";
  const city = meta.city || "Jakarta";
  const year = meta.year || new Date().getFullYear();

  return [
    paragraphXml(title, template.styles.cover),
    paragraphXml(subtitle, template.styles.coverSub),
    paragraphXml(institution, template.styles.coverSub),
    paragraphXml(city, template.styles.coverSub),
    paragraphXml(String(year), template.styles.coverSub),
  ].join("");
}

/** TOC entry XML */
function tocEntryXml(entry: { number: string; title: string; level: number }, template: ReturnType<typeof getTemplate>): string {
  const indent = (entry.level - 1) * 720;
  const style = template.styles.tocEntry;
  return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/><w:ind w:left="${indent}"/>${spacingXml(style.spacing)}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="${escapeXml(style.font)}" w:hAnsi="${escapeXml(style.font)}"/><w:sz w:val="${style.size * 2}"/></w:rPr><w:t xml:space="preserve">${escapeXml(safeText(`${entry.number} ${entry.title}`))}</w:t></w:r></w:p>`;
}

/** Generate list of TOC entries */
function tocListXml(entries: Array<{ number: string; title: string; level: number }>, template: ReturnType<typeof getTemplate>): string {
  return entries.map((e) => tocEntryXml(e, template)).join("");
}

/** Full front matter including cover, ToC, tables, figures */
function frontMatterXml(document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const toc = buildToc(document);

  const cover = coverXml(document);
  const tocTitle = paragraphXml("DAFTAR ISI", template.styles.tocTitle);
  const tocList = tocListXml(toc.heading.map((e) => ({ number: e.number, title: e.title, level: e.level })), template);
  const tableTitle = paragraphXml("DAFTAR TABEL", template.styles.tocTitle);
  const tableList = tocListXml(toc.tables.map((e) => ({ number: e.number, title: e.title, level: 1 })), template);
  const figureTitle = paragraphXml("DAFTAR GAMBAR", template.styles.tocTitle);
  const figureList = tocListXml(toc.figures.map((e) => ({ number: e.number, title: e.title, level: 1 })), template);

  const sectionBreak = `<w:p><w:pPr><w:sectPr><w:footerReference w:type="default" r:id="rId4"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="2268" w:header="720" w:footer="720" w:gutter="0"/><w:pgNumType w:fmt="lowerRoman" w:start="1"/></w:sectPr></w:pPr></w:p>`;

  return [cover, pageBreakXml(), tocTitle, tocList, pageBreakXml(), tableTitle, tableList, pageBreakXml(), figureTitle, figureList, sectionBreak].join("");
}

function buildStylesXml(templateId: string): string {
  const template = getTemplate(templateId);
  const styles = Object.values(template.styles).map((style) => {
    const b = style.bold ? '<w:b/>' : "";
    const i = style.italic ? '<w:i/>' : "";
    return `<w:style w:type="paragraph" w:styleId="${escapeXml(style.styleId)}">` +
      `<w:name w:val="${escapeXml(style.styleId)}"/><w:basedOn w:val="Normal"/>` +
      `<w:pPr>${spacingXml(style.spacing)}${style.alignment ? `<w:jc w:val="${style.alignment}"/>` : ""}</w:pPr>` +
      `<w:rPr><w:rFonts w:ascii="${escapeXml(style.font)}" w:hAnsi="${escapeXml(style.font)}"/>` +
      `<w:sz w:val="${style.size * 2}"/><w:szCs w:val="${style.size * 2}"/>${b}${i}</w:rPr></w:style>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:styles xmlns:w="${W_NS}">` +
    `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>` +
    `<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault>` +
    `<w:pPrDefault><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` +
    `<w:style w:type="paragraph" w:styleId="Normal" w:default="1"><w:name w:val="Normal"/><w:qFormat/></w:style>` +
    `${styles}</w:styles>`;
}

function buildDocumentXml(document: SkripsiDocument): string {
  const front = frontMatterXml(document);
  const body = document.blocks.map((block) => blockXml(block, document)).join("");
  const sectionProps = `<w:sectPr><w:footerReference w:type="default" r:id="rId5"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="2268" w:header="720" w:footer="720" w:gutter="0"/><w:pgNumType w:fmt="decimal" w:start="1"/></w:sectPr>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="${W_NS}" xmlns:r="${R_NS}">` +
    `<w:body>${front}${body}${sectionProps}</w:body></w:document>`;
}

export async function assembleDocx(document: SkripsiDocument, filename: string): Promise<ExportResult> {
  if (!document.title.trim() || !document.templateId) {
    throw new Error("Dokumen belum memiliki metadata wajib.");
  }

  const outputFilename = safeFilename(filename);
  const zip = new JSZip();

  const documentXml = buildDocumentXml(document);
  const stylesXml = buildStylesXml(document.templateId);

  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", ROOT_RELS);
  zip.file("word/_rels/document.xml.rels", WORD_RELS);
  zip.file("word/document.xml", documentXml);
  zip.file("word/styles.xml", stylesXml);
  zip.file("word/numbering.xml", NUMBERING_XML);
  zip.file("word/settings.xml", SETTINGS_XML);
  zip.file("word/fontTable.xml", FONT_TABLE_XML);
  zip.file("word/footer_front.xml", FOOTER_FRONT_XML);
  zip.file("word/footer_body.xml", FOOTER_BODY_XML);
  zip.file("docProps/core.xml", CORE_XML);
  zip.file("docProps/app.xml", APP_XML);

  const data = await zip.generateAsync({ type: "arraybuffer" });
  return { filename: outputFilename, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", data };
}

export async function exportDocx(document: SkripsiDocument, filename = "skripsiflow-document.docx"): Promise<ExportResult> {
  return assembleDocx(document, filename);
}

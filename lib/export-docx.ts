import JSZip from "jszip";
import type { DocumentBlock, SkripsiDocument } from "./document-model";
import type { InlineSegment } from "./ingestion";
import { getTemplate, resolveBlockStyle } from "./template";

export interface ExportResult { filename: string; mimeType: string; data: ArrayBuffer; }

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function parseInline(block: DocumentBlock): InlineSegment[] {
  try {
    const parsed = block.metadata?.inline ? JSON.parse(block.metadata.inline) as InlineSegment[] : [];
    return parsed.length ? parsed : [{ text: block.content, marks: [] }];
  } catch { return [{ text: block.content, marks: [] }]; }
}

function runXml(text: string, style: { font: string; size: number }, marks: string[] = []): string {
  const b = marks.includes("bold") ? '<w:b/>' : "";
  const i = marks.includes("italic") ? '<w:i/>' : "";
  const u = marks.includes("underline") ? '<w:u w:val="single"/>' : "";
  return `<w:r><w:rPr><w:rFonts w:ascii="${escapeXml(style.font)}" w:hAnsi="${escapeXml(style.font)}"/><w:sz w:val="${style.size * 2}"/><w:szCs w:val="${style.size * 2}"/>${b}${i}${u}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

function paragraphXml(block: DocumentBlock, document: SkripsiDocument): string {
  const style = resolveBlockStyle(block, document.templateId);
  const segments = parseInline(block);
  const runs = segments.map((s) => runXml(s.text, style, s.marks)).join("");
  const jc = style.alignment ? `<w:jc w:val="${style.alignment}"/>` : "";
  return `<w:p><w:pPr><w:pStyle w:val="${escapeXml(style.styleId)}"/>${jc}</w:pPr>${runs}</w:p>`;
}

function tableGridXml(colCount: number): string {
  const cols = Array.from({ length: colCount }, () => '<w:gridCol w:w="9000"/>').join("");
  return `<w:tblGrid>${cols}</w:tblGrid>`;
}

function tableXml(block: DocumentBlock): string {
  const rows = block.content.split(/\n/).filter(Boolean).map((row) =>
    row.split("|").map((cell) => cell.trim()).filter(Boolean)
  );
  if (!rows.length) return "";
  const grid = tableGridXml(rows[0].length);
  const trs = rows.map((row) => {
    const tcs = row.map((cell) => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`).join("");
    return `<w:tr>${tcs}</w:tr>`;
  }).join("");
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr>${grid}${trs}</w:tbl>`;
}

function documentBodyXml(document: SkripsiDocument): string {
  const body = document.blocks.map((block) =>
    block.type === "table" ? tableXml(block) : paragraphXml(block, document)
  ).join("");
  const sectPr = `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1800" w:header="720" w:footer="720"/><w:cols w:space="720"/></w:sectPr>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${body}${sectPr}</w:body></w:document>`;
}

function stylesXml(document: SkripsiDocument): string {
  const template = getTemplate(document.templateId);
  const styles = Object.values(template.styles).map((style) => {
    const b = style.bold ? '<w:b/>' : "";
    const i = style.italic ? '<w:i/>' : "";
    return `<w:style w:type="paragraph" w:styleId="${escapeXml(style.styleId)}"><w:name w:val="${escapeXml(style.styleId)}"/><w:rPr><w:rFonts w:ascii="${escapeXml(style.font)}" w:hAnsi="${escapeXml(style.font)}"/><w:sz w:val="${style.size * 2}"/><w:szCs w:val="${style.size * 2}"/>${b}${i}</w:rPr></w:style>`;
  }).join("");
  const tableStyle = `<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr></w:style>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
${styles}${tableStyle}</w:styles>`;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

function wordRels(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function safeFilename(filename: string): string {
  const normalized = filename.normalize("NFKC").replace(/[^\w .-]/g, "-").trim();
  return `${(normalized || "skripsiflow-document").slice(0, 120).replace(/\.docx$/i, "")}.docx`;
}

export async function exportDocx(document: SkripsiDocument, filename = "skripsiflow-document.docx"): Promise<ExportResult> {
  if (!document.title.trim() || !document.templateId) throw new Error("Dokumen belum memiliki metadata wajib.");
  const outputFilename = safeFilename(filename);
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", ROOT_RELS);
  zip.file("word/_rels/document.xml.rels", wordRels());
  zip.file("word/document.xml", documentBodyXml(document));
  zip.file("word/styles.xml", stylesXml(document));
  const data = await zip.generateAsync({ type: "arraybuffer" });
  return { filename: outputFilename, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", data };
}

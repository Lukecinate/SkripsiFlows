import type { DocumentBlock, SkripsiDocument } from "./document-model";

export type TemplateRole =
  | "cover"
  | "coverSub"
  | "tocTitle"
  | "tocEntry"
  | "chapterNumber"
  | "chapterTitle"
  | "heading"
  | "subheading"
  | "paragraph"
  | "quote"
  | "list"
  | "table"
  | "tableTitle"
  | "figureTitle"
  | "reference"
  | "pageNumber"
  | "pageNumberRoman";

export interface TemplateSpacing {
  line?: number;
  lineRule?: "auto" | "exact" | "atLeast";
  before?: number;
  after?: number;
  firstLine?: number;
  left?: number;
  right?: number;
  hanging?: number;
}

export interface TemplateStyle {
  role: TemplateRole;
  styleId: string;
  font: string;
  size: number;
  bold?: boolean;
  italic?: boolean;
  alignment?: "left" | "center" | "right" | "justify";
  upperCase?: boolean;
  spacing?: TemplateSpacing;
}

export interface ThesisTemplate {
  id: string;
  name: string;
  description: string;
  styles: Record<TemplateRole, TemplateStyle>;
}

export const BINUS_MANAGEMENT_TEMPLATE: ThesisTemplate = {
  id: "binus-management-v1",
  name: "BINUS Management 2021/2022",
  description: "Template sesuai Petunjuk Penulisan Skripsi BINUS Management 2021/2022: Times New Roman 12pt, spasi 1.5, margin kiri 4 cm.",
  styles: {
    cover: { role: "cover", styleId: "Cover", font: "Times New Roman", size: 14, bold: true, alignment: "center", upperCase: true, spacing: { line: 360, lineRule: "auto", before: 0, after: 240 } },
    coverSub: { role: "coverSub", styleId: "CoverSub", font: "Times New Roman", size: 12, alignment: "center", spacing: { line: 360, lineRule: "auto" } },
    tocTitle: { role: "tocTitle", styleId: "TocTitle", font: "Times New Roman", size: 12, bold: true, alignment: "center", upperCase: true, spacing: { line: 360, lineRule: "auto", before: 0, after: 240 } },
    tocEntry: { role: "tocEntry", styleId: "TocEntry", font: "Times New Roman", size: 12, alignment: "left", spacing: { line: 360, lineRule: "auto" } },
    chapterNumber: { role: "chapterNumber", styleId: "ChapterNumber", font: "Times New Roman", size: 12, bold: true, alignment: "center", spacing: { line: 360, lineRule: "auto", before: 0, after: 480 } },
    chapterTitle: { role: "chapterTitle", styleId: "ChapterTitle", font: "Times New Roman", size: 12, bold: true, alignment: "center", upperCase: true, spacing: { line: 360, lineRule: "auto", before: 0, after: 480 } },
    heading: { role: "heading", styleId: "Heading1", font: "Times New Roman", size: 12, bold: true, alignment: "left", spacing: { line: 360, lineRule: "auto", before: 480, after: 240 } },
    subheading: { role: "subheading", styleId: "Heading2", font: "Times New Roman", size: 12, bold: true, alignment: "left", spacing: { line: 360, lineRule: "auto", before: 240, after: 120 } },
    paragraph: { role: "paragraph", styleId: "Normal", font: "Times New Roman", size: 12, alignment: "justify", spacing: { line: 360, lineRule: "auto", firstLine: 709 } },
    quote: { role: "quote", styleId: "Quote", font: "Times New Roman", size: 12, italic: true, alignment: "justify", spacing: { line: 360, lineRule: "auto", left: 709, firstLine: 0 } },
    list: { role: "list", styleId: "List", font: "Times New Roman", size: 12, alignment: "justify", spacing: { line: 360, lineRule: "auto", left: 709, hanging: 360 } },
    table: { role: "table", styleId: "TableGrid", font: "Times New Roman", size: 11, alignment: "left", spacing: { line: 240, lineRule: "auto" } },
    tableTitle: { role: "tableTitle", styleId: "TableTitle", font: "Times New Roman", size: 12, alignment: "left", spacing: { line: 360, lineRule: "auto", before: 240, after: 60 } },
    figureTitle: { role: "figureTitle", styleId: "FigureTitle", font: "Times New Roman", size: 12, italic: true, alignment: "center", spacing: { line: 360, lineRule: "auto", before: 60, after: 240 } },
    reference: { role: "reference", styleId: "Bibliography", font: "Times New Roman", size: 12, alignment: "left", spacing: { line: 360, lineRule: "auto", left: 709, hanging: 709 } },
    pageNumber: { role: "pageNumber", styleId: "PageNumber", font: "Times New Roman", size: 11, alignment: "center" },
    pageNumberRoman: { role: "pageNumberRoman", styleId: "PageNumberRoman", font: "Times New Roman", size: 11, alignment: "center" },
  },
};

const registry = new Map<string, ThesisTemplate>([[BINUS_MANAGEMENT_TEMPLATE.id, BINUS_MANAGEMENT_TEMPLATE]]);

export function getTemplate(templateId = BINUS_MANAGEMENT_TEMPLATE.id): ThesisTemplate {
  return registry.get(templateId) ?? BINUS_MANAGEMENT_TEMPLATE;
}

export function registerTemplate(template: ThesisTemplate): void {
  registry.set(template.id, template);
}

export function mapBlockRole(block: DocumentBlock): TemplateRole {
  if (block.type === "chapter") return "chapterTitle";
  if (block.type === "section") return "heading";
  if (block.type === "subchapter") return "subheading";
  if (block.type === "quote") return "quote";
  if (block.type === "list") return "list";
  if (block.type === "table") return "table";
  if (block.type === "image") return "figureTitle";
  if (block.type === "reference") return "reference";
  return "paragraph";
}

export function resolveBlockStyle(block: DocumentBlock, templateId?: string): TemplateStyle {
  const template = getTemplate(templateId);
  return template.styles[mapBlockRole(block)];
}

export function buildTemplatePreview(document: SkripsiDocument): Array<{ blockId: string; role: TemplateRole; styleId: string }> {
  return document.blocks.map((block) => ({ blockId: block.id, role: mapBlockRole(block), styleId: resolveBlockStyle(block, document.templateId).styleId }));
}

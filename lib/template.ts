import type { DocumentBlock, SkripsiDocument } from "./document-model";

export type TemplateRole = "cover" | "heading" | "paragraph" | "quote" | "table" | "reference" | "header" | "footer";
export interface TemplateStyle { role: TemplateRole; styleId: string; font: string; size: number; bold?: boolean; italic?: boolean; alignment?: "left" | "center" | "right" | "justify"; }
export interface ThesisTemplate { id: string; name: string; description: string; styles: Record<TemplateRole, TemplateStyle>; }

export const standardIndonesiaTemplate: ThesisTemplate = {
  id: "indonesia-standard-v1", name: "Skripsi Indonesia — Standar", description: "Template baseline untuk skripsi mahasiswa Indonesia.",
  styles: {
    cover: { role: "cover", styleId: "Cover", font: "Times New Roman", size: 14, bold: true, alignment: "center" },
    heading: { role: "heading", styleId: "Heading1", font: "Times New Roman", size: 12, bold: true, alignment: "left" },
    paragraph: { role: "paragraph", styleId: "Normal", font: "Times New Roman", size: 12, alignment: "justify" },
    quote: { role: "quote", styleId: "Quote", font: "Times New Roman", size: 11, italic: true, alignment: "justify" },
    table: { role: "table", styleId: "TableGrid", font: "Times New Roman", size: 11, alignment: "left" },
    reference: { role: "reference", styleId: "Bibliography", font: "Times New Roman", size: 12, alignment: "left" },
    header: { role: "header", styleId: "Header", font: "Times New Roman", size: 10, alignment: "right" },
    footer: { role: "footer", styleId: "Footer", font: "Times New Roman", size: 10, alignment: "center" }
  }
};

const registry = new Map([[standardIndonesiaTemplate.id, standardIndonesiaTemplate]]);
export function getTemplate(templateId = standardIndonesiaTemplate.id): ThesisTemplate { return registry.get(templateId) ?? standardIndonesiaTemplate; }
export function registerTemplate(template: ThesisTemplate): void { registry.set(template.id, template); }
export function mapBlockRole(block: DocumentBlock): TemplateRole { if (block.type === "chapter" || block.type === "section") return "heading"; if (block.type === "quote") return "quote"; if (block.type === "table") return "table"; if (block.type === "reference") return "reference"; return "paragraph"; }
export function resolveBlockStyle(block: DocumentBlock, templateId?: string): TemplateStyle { const template = getTemplate(templateId); return template.styles[mapBlockRole(block)]; }
export function buildTemplatePreview(document: SkripsiDocument): Array<{ blockId: string; role: TemplateRole; styleId: string }> { return document.blocks.map((block) => ({ blockId: block.id, role: mapBlockRole(block), styleId: resolveBlockStyle(block, document.templateId).styleId })); }

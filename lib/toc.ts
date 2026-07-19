import type { DocumentBlock, SkripsiDocument } from "./document-model";
import { buildFigureOutline, buildOutline, buildTableOutline } from "./outline";

export interface DocTocEntry { blockId: string; level: 1 | 2 | 3; number: string; title: string; page: number | null; }
export interface TableTocEntry { blockId: string; number: string; title: string; level: number; page: number | null; }
export interface FigureTocEntry { blockId: string; number: string; title: string; level: number; page: number | null; }
export interface ReferenceTocEntry { title: string; page: number | null; }
export interface DocumentToc { heading: DocTocEntry[]; tables: TableTocEntry[]; figures: FigureTocEntry[]; references: ReferenceTocEntry[]; }

function titleFromBlock(block: DocumentBlock): string {
  const override = block.metadata?.tocTitle?.trim();
  if (override) return override;
  return block.content.split(/\n/)[0]?.trim() ?? "";
}

export function buildToc(document: SkripsiDocument, pageMap: Map<string, number> = new Map()): DocumentToc {
  const heading: DocTocEntry[] = buildOutline(document).map((entry) => ({
    blockId: entry.blockId,
    level: entry.level,
    number: entry.number,
    title: titleFromBlock(document.blocks.find((b) => b.id === entry.blockId) ?? { content: "" } as DocumentBlock),
    page: pageMap.get(entry.blockId) ?? null,
  }));
  const tables: TableTocEntry[] = buildTableOutline(document).map((entry) => ({
    blockId: entry.blockId,
    number: entry.number,
    title: entry.title,
    level: 1,
    page: pageMap.get(entry.blockId) ?? null,
  }));
  const figures: FigureTocEntry[] = buildFigureOutline(document).map((entry) => ({
    blockId: entry.blockId,
    number: entry.number,
    title: entry.title,
    level: 1,
    page: pageMap.get(entry.blockId) ?? null,
  }));
  const referenceBlock = document.blocks.find((b) => b.type === "reference");
  const references: ReferenceTocEntry[] = referenceBlock
    ? [{ title: titleFromBlock(referenceBlock), page: pageMap.get(referenceBlock.id) ?? null }]
    : [];
  return { heading, tables, figures, references };
}

export function getTocTitles(document: SkripsiDocument): Map<string, string> {
  const map = new Map<string, string>();
  for (const block of document.blocks) {
    const override = block.metadata?.tocTitle?.trim();
    if (override) map.set(block.id, override);
  }
  return map;
}

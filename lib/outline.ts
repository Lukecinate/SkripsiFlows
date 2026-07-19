import type { DocumentBlock, SkripsiDocument } from "./document-model";

export interface OutlineEntry {
  blockId: string;
  level: 1 | 2 | 3;
  label: string;
  number: string;
}

export function buildOutline(document: SkripsiDocument): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  let chapterNumber = 0;
  let sectionNumber = 0;
  let subNumber = 0;
  for (const block of document.blocks) {
    if (block.type === "chapter") {
      chapterNumber += 1;
      sectionNumber = 0;
      subNumber = 0;
      const firstLine = block.content.split(/\n/)[0]?.trim() ?? "";
      entries.push({ blockId: block.id, level: 1, number: `BAB ${chapterNumber}`, label: `BAB ${chapterNumber} ${firstLine}`.trim() });
      continue;
    }
    if (block.type === "section") {
      if (chapterNumber === 0) continue;
      sectionNumber += 1;
      subNumber = 0;
      const firstLine = block.content.split(/\n/)[0]?.trim() ?? "";
      entries.push({ blockId: block.id, level: 2, number: `${chapterNumber}.${sectionNumber}`, label: `${chapterNumber}.${sectionNumber} ${firstLine}`.trim() });
      continue;
    }
    if (block.type === "subchapter") {
      if (chapterNumber === 0 || sectionNumber === 0) continue;
      subNumber += 1;
      const firstLine = block.content.split(/\n/)[0]?.trim() ?? "";
      entries.push({ blockId: block.id, level: 3, number: `${chapterNumber}.${sectionNumber}.${subNumber}`, label: `${chapterNumber}.${sectionNumber}.${subNumber} ${firstLine}`.trim() });
    }
  }
  return entries;
}

export interface TableOutlineEntry { blockId: string; number: string; title: string; }
export function buildTableOutline(document: SkripsiDocument): TableOutlineEntry[] {
  const entries: TableOutlineEntry[] = [];
  let counter = 0;
  let currentChapter = 0;
  for (const block of document.blocks) {
    if (block.type === "table") {
      counter += 1;
      const firstLine = block.content.split(/\n/)[0]?.replace(/\|/g, " ").trim() ?? "";
      entries.push({
        blockId: block.id,
        number: `Tabel ${counter}`,
        title: firstLine.slice(0, 120),
      });
    }
  }
  return entries;
}

export interface FigureOutlineEntry { blockId: string; number: string; title: string; }
export function buildFigureOutline(document: SkripsiDocument): FigureOutlineEntry[] {
  const entries: FigureOutlineEntry[] = [];
  let counter = 0;
  let currentChapter = 0;
  for (const block of document.blocks) {
    if (block.type === "image") {
      counter += 1;
      const caption = block.metadata?.caption?.trim() || block.content.split(/\n/)[0]?.trim() || "Gambar";
      entries.push({
        blockId: block.id,
        number: `Gambar ${counter}`,
        title: caption.slice(0, 120),
      });
    }
  }
  return entries;
}

export function toRoman(num: number): string {
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [value, sym] of map) {
    while (n >= value) { result += sym; n -= value; }
  }
  return result.toLowerCase();
}



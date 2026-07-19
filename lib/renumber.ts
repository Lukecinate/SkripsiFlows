import type { DocumentBlock, SkripsiDocument } from "./document-model";

function withMeta(block: DocumentBlock, key: string, value: string): DocumentBlock {
  return { ...block, metadata: { ...(block.metadata ?? {}), [key]: value } };
}

export function renumberDocument(document: SkripsiDocument): SkripsiDocument {
  let chapterNumber = 0;
  let sectionNumber = 0;
  let subNumber = 0;
  let tableCounter = 0;
  let figureCounter = 0;
  const blocks = document.blocks.map((block) => {
    if (block.type === "chapter") {
      chapterNumber += 1;
      sectionNumber = 0;
      subNumber = 0;
      return withMeta(block, "headingNumber", `BAB ${chapterNumber}`);
    }
    if (block.type === "section") {
      if (chapterNumber === 0) return block;
      sectionNumber += 1;
      subNumber = 0;
      return withMeta(block, "headingNumber", `${chapterNumber}.${sectionNumber}`);
    }
    if (block.type === "subchapter") {
      if (chapterNumber === 0 || sectionNumber === 0) return block;
      subNumber += 1;
      return withMeta(block, "headingNumber", `${chapterNumber}.${sectionNumber}.${subNumber}`);
    }
    if (block.type === "table") {
      tableCounter += 1;
      return withMeta(block, "tableNumber", String(tableCounter));
    }
    if (block.type === "image") {
      figureCounter += 1;
      return withMeta(block, "figureNumber", String(figureCounter));
    }
    return block;
  });
  return { ...document, blocks };
}

export function setTocTitle(block: DocumentBlock, title: string): DocumentBlock {
  return { ...block, metadata: { ...(block.metadata ?? {}), tocTitle: title } };
}

export function setCaption(block: DocumentBlock, caption: string): DocumentBlock {
  return { ...block, metadata: { ...(block.metadata ?? {}), caption } };
}



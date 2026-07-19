import test from "node:test";
import assert from "node:assert/strict";
import { buildToc, getTocTitles } from "./toc";
import { renumberDocument } from "./renumber";
import type { SkripsiDocument } from "./document-model";

const base: SkripsiDocument = {
  schemaVersion: 1,
  id: "t",
  title: "T",
  templateId: "binus-management-v1",
  citationStyle: "apa-7",
  blocks: [
    { id: "c1", type: "chapter", content: "Pendahuluan", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "s1", type: "section", content: "Latar Belakang", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "sub1", type: "subchapter", content: "Fenomena", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "p1", type: "paragraph", content: "Isi", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "tbl1", type: "table", content: "| A | B |\n| - | - |\n| 1 | 2 |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "img1", type: "image", content: "image.png", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { caption: "Tampilan" } },
    { id: "c2", type: "chapter", content: "Tinjauan Pustaka", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "tbl2", type: "table", content: "| X | Y |\n| - | - |\n| 3 | 4 |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
  ],
  references: [],
  reviewRequired: false,
  createdAt: "",
  updatedAt: "",
};

test("buildToc enumerates heading, tables, figures", () => {
  const renumbered = renumberDocument(base);
  const toc = buildToc(renumbered);
  assert.equal(toc.heading.length, 4);
  assert.equal(toc.heading[0].number, "BAB 1");
  assert.equal(toc.heading[1].number, "1.1");
  assert.equal(toc.heading[2].number, "1.1.1");
  assert.equal(toc.heading[3].number, "BAB 2");
  assert.equal(toc.tables.length, 2);
  assert.equal(toc.tables[0].number, "Tabel 1");
  assert.equal(toc.tables[1].number, "Tabel 2");
  assert.equal(toc.figures.length, 1);
  assert.equal(toc.figures[0].number, "Gambar 1");
});

test("buildToc honors page map", () => {
  const renumbered = renumberDocument(base);
  const pageMap = new Map<string, number>([["c1", 5]]);
  const toc = buildToc(renumbered, pageMap);
  assert.equal(toc.heading[0].page, 5);
  assert.equal(toc.heading[1].page, null);
});

test("getTocTitles returns overrides", () => {
  const doc: SkripsiDocument = {
    ...base,
    blocks: base.blocks.map((b) => (b.id === "c1" ? { ...b, metadata: { ...(b.metadata ?? {}), tocTitle: "Pendahuluan Khusus" } } : b)),
  };
  const titles = getTocTitles(doc);
  assert.equal(titles.get("c1"), "Pendahuluan Khusus");
});


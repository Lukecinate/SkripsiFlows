import test from "node:test";
import assert from "node:assert/strict";
import { renumberDocument, setCaption, setTocTitle } from "./renumber";
import type { SkripsiDocument } from "./document-model";

const base: SkripsiDocument = {
  schemaVersion: 1,
  id: "r",
  title: "R",
  templateId: "binus-management-v1",
  citationStyle: "apa-7",
  blocks: [
    { id: "c1", type: "chapter", content: "Pendahuluan", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "s1", type: "section", content: "Latar Belakang", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "sub1", type: "subchapter", content: "Fenomena", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "t1", type: "table", content: "| A | B |\n| - | - |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "i1", type: "image", content: "img.png", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "c2", type: "chapter", content: "Tinjauan Pustaka", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "t2", type: "table", content: "| X | Y |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
  ],
  references: [],
  reviewRequired: false,
  createdAt: "",
  updatedAt: "",
};

test("renumber assigns heading and table/figure numbers", () => {
  const result = renumberDocument(base);
  const blocks = result.blocks;
  assert.equal(blocks[0].metadata?.headingNumber, "BAB 1");
  assert.equal(blocks[1].metadata?.headingNumber, "1.1");
  assert.equal(blocks[2].metadata?.headingNumber, "1.1.1");
  assert.equal(blocks[3].metadata?.tableNumber, "1");
  assert.equal(blocks[4].metadata?.figureNumber, "1");
  assert.equal(blocks[5].metadata?.headingNumber, "BAB 2");
  assert.equal(blocks[6].metadata?.tableNumber, "2");
});

test("setCaption updates metadata", () => {
  const block = base.blocks.find((b) => b.id === "i1");
  if (!block) throw new Error("missing");
  const next = setCaption(block, "Baru");
  assert.equal(next.metadata?.caption, "Baru");
});

test("setTocTitle updates metadata", () => {
  const block = base.blocks.find((b) => b.id === "c1");
  if (!block) throw new Error("missing");
  const next = setTocTitle(block, "Edit");
  assert.equal(next.metadata?.tocTitle, "Edit");
});




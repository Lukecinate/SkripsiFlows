import test from "node:test";
import assert from "node:assert/strict";
import { buildFigureOutline, buildOutline, buildTableOutline, toRoman } from "./outline";
import type { SkripsiDocument } from "./document-model";

const sample: SkripsiDocument = {
  schemaVersion: 1,
  id: "t", title: "T", templateId: "binus-management-v1", citationStyle: "apa-7",
  blocks: [
    { id: "1", type: "chapter", content: "Pendahuluan", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "2", type: "section", content: "Latar Belakang", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "3", type: "subchapter", content: "Fenomena", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "4", type: "paragraph", content: "Isi", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "5", type: "table", content: "| A | B |\n| 1 | 2 |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "6", type: "image", content: "img.png", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { caption: "Tampilan" } },
    { id: "7", type: "chapter", content: "Tinjauan Pustaka", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "8", type: "table", content: "| X | Y |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
  ],
  references: [], reviewRequired: false, createdAt: "", updatedAt: "",
};

test("buildOutline skips paragraphs and numbers chapter/section/subchapter", () => {
  const out = buildOutline(sample);
  assert.equal(out.length, 4);
  assert.equal(out[0].level, 1);
  assert.equal(out[0].number, "BAB 1");
  assert.equal(out[1].level, 2);
  assert.equal(out[1].number, "1.1");
  assert.equal(out[2].level, 3);
  assert.equal(out[2].number, "1.1.1");
  assert.equal(out[3].number, "BAB 2");
});

test("buildTableOutline numbers tables per chapter", () => {
  const out = buildTableOutline(sample);
  assert.equal(out.length, 2);
  assert.equal(out[0].number, "Tabel 1");
  assert.equal(out[1].number, "Tabel 2");
});

test("buildFigureOutline numbers images per chapter", () => {
  const out = buildFigureOutline(sample);
  assert.equal(out.length, 1);
  assert.equal(out[0].number, "Gambar 1");
  assert.equal(out[0].title, "Tampilan");
});

test("toRoman converts numbers", () => {
  assert.equal(toRoman(1), "i");
  assert.equal(toRoman(4), "iv");
  assert.equal(toRoman(9), "ix");
  assert.equal(toRoman(40), "xl");
  assert.equal(toRoman(2023), "mmxxiii");
});


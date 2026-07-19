import test from "node:test";
import assert from "node:assert/strict";
import { exportPdf } from "./export-pdf";
import { renumberDocument } from "./renumber";
import type { SkripsiDocument } from "./document-model";

const document: SkripsiDocument = {
  schemaVersion: 1,
  id: "test",
  title: "Demo Skripsi",
  templateId: "binus-management-v1",
  citationStyle: "apa-7",
  documentMetadata: { institution: "Universitas Bina Nusantara", city: "Jakarta", year: 2026 },
  blocks: [
    { id: "b1", type: "chapter", content: "PENDAHULUAN", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { headingNumber: "BAB 1" } },
    { id: "b2", type: "paragraph", content: "Teks miring dan garis bawah.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { inline: JSON.stringify([{ text: "Teks ", marks: [] }, { text: "miring", marks: ["italic"] }, { text: " dan ", marks: [] }, { text: "garis bawah", marks: ["underline"] }, { text: ".", marks: [] }]) } },
    { id: "b3", type: "table", content: "| A | B |\n| - | - |\n| 1 | 2 |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { tableNumber: "1", tocTitle: "Distribusi frekuensi" } },
    { id: "b4", type: "image", content: "image.png", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { figureNumber: "1", caption: "Tampilan aplikasi" } },
  ],
  references: [],
  reviewRequired: false,
  createdAt: "",
  updatedAt: "",
};

test("exports a readable PDF with cover, ToC, daftar tabel, daftar gambar, body", async () => {
  const renumbered = renumberDocument(document);
  const result = await exportPdf(renumbered, "skripsiflow.pdf");
  assert.equal(result.mimeType, "application/pdf");
  assert.equal(new Uint8Array(result.data).slice(0, 5).toString(), "37,80,68,70,45");
  assert.ok(result.data.byteLength > 1000);
  const loaded = await (await import("pdf-lib")).PDFDocument.load(result.data);
  assert.ok(loaded.getPageCount() >= 4, "should have at least 4 pages (cover + ToC + body)");
});

test("exports a PDF without throwing on non-WinAnsi characters", async () => {
  const unicodeDocument: SkripsiDocument = {
    ...document,
    title: "Unicode test",
    blocks: [{ id: "u1", type: "paragraph", content: "Tanda panah arrow, bintang star, garis line, dan emoji heart", confidence: 1, confidenceLevel: "high", source: "paste", needsReview: false, metadata: { inline: JSON.stringify([{ text: "Tanda panah arrow, bintang star, garis line, dan emoji heart", marks: [] }]) } }],
  };
  const result = await exportPdf(unicodeDocument, "unicode.pdf");
  assert.equal(result.mimeType, "application/pdf");
  assert.ok(result.data.byteLength > 500);
});

test("sanitizes non-WinAnsi characters in table rows", async () => {
  const tableDocument: SkripsiDocument = { ...document, blocks: [{ id: "t1", type: "table", content: "| A B |\n| C D |", confidence: 1, confidenceLevel: "high", source: "paste", needsReview: false, metadata: {} }] };
  const result = await exportPdf(tableDocument, "table.pdf");
  assert.ok(result.data.byteLength > 500);
});


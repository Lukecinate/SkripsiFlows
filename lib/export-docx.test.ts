import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { exportDocx } from "./export-docx";
import { renumberDocument } from "./renumber";
import { inspectDocx, printInspectionReport } from "./export-docx/inspect";
import { binusFixtureDocument, binusFixtureExpectations } from "./template/fixtures/binus-management-v1.fixture";
import type { SkripsiDocument } from "./document-model";

const baseDoc: SkripsiDocument = {
  schemaVersion: 1, id: "test", title: "Analisis Pengaruh UI", templateId: "binus-management-v1",
  citationStyle: "apa-7",
  documentMetadata: { institution: "Universitas Bina Nusantara", city: "Jakarta", year: 2026 },
  blocks: [
    { id: "b1", type: "chapter", content: "PENDAHULUAN", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { headingNumber: "BAB 1" } },
    { id: "b2", type: "paragraph", content: "Isi paragraf pertama.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "b3", type: "table", content: "| A | B |\n| - | - |\n| 1 | 2 |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { tableNumber: "1" } },
    { id: "b4", type: "image", content: "image.png", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { figureNumber: "1", caption: "Tampilan aplikasi" } },
    { id: "b5", type: "reference", content: "Andi, A. (2024). Buku referensi.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
  ],
  references: [], reviewRequired: false, createdAt: "", updatedAt: "",
};

test("exports valid OOXML with required parts and inline marks", async () => {
  const result = await exportDocx(baseDoc);
  const zip = await JSZip.loadAsync(result.data);
  const doc = await zip.file("word/document.xml")?.async("string");
  const ct = await zip.file("[Content_Types].xml")?.async("string");
  const styles = await zip.file("word/styles.xml")?.async("string");
  const settings = await zip.file("word/settings.xml")?.async("string");
  const footerFront = await zip.file("word/footer_front.xml")?.async("string");
  const footerBody = await zip.file("word/footer_body.xml")?.async("string");
  assert.ok(doc, "document.xml must exist");
  assert.ok(ct, "Content_Types must exist");
  assert.ok(styles, "styles.xml must exist");
  assert.ok(settings, "settings.xml must exist");
  assert.ok(footerFront, "front footer must exist");
  assert.ok(footerBody, "body footer must exist");
  assert.ok(doc!.includes("BAB 1"), "must include BAB 1 chapter number");
  assert.ok(doc!.includes("PENDAHULUAN"), "must include chapter title");
  assert.ok(doc!.includes("DAFTAR ISI"), "must include Daftar Isi heading");
  assert.ok(doc!.includes("DAFTAR TABEL"), "must include Daftar Tabel heading");
  assert.ok(doc!.includes("DAFTAR GAMBAR"), "must include Daftar Gambar heading");
  assert.ok(doc!.includes("DAFTAR PUSTAKA"), "must include Daftar Pustaka heading");
  assert.ok(doc!.includes("Tabel 1"), "must include table caption");
  assert.ok(doc!.includes("Gambar 1"), "must include figure caption");
  assert.ok(doc!.includes("ANALISIS PENGARUH UI"), "must uppercase title on cover");
  assert.ok(doc!.includes("LAPORAN SKRIPSI"), "must include Laporan Skripsi subtitle");
  assert.ok(doc!.includes("Universitas Bina Nusantara"), "must include institution");
  assert.ok(doc!.includes("<w:tbl"), "must contain table");
  assert.ok(doc!.includes("<w:tblGrid"), "must contain table grid");
  assert.ok(doc!.includes('w:line="360"'), "must apply 1.5 line spacing");
  assert.ok(doc!.includes('w:left="2268"'), "must use BINUS left margin 4cm");
  assert.ok(doc!.includes('w:fmt="lowerRoman"'), "must declare lowerRoman numbering for front matter");
  assert.ok(doc!.includes('w:fmt="decimal"'), "must declare decimal numbering for body");
  assert.ok(footerFront!.includes("LOWER ROMAN"), "front footer uses lower roman");
  assert.ok(footerBody!.includes("ARABIC"), "body footer uses arabic numerals");
});

test("exports filename is sanitized", async () => {
  const result = await exportDocx(baseDoc, "Bad<Name>.docx");
  assert.ok(result.filename.endsWith(".docx"));
  assert.ok(!result.filename.includes("<"));
});

test("renumber assigns headingNumber and tableNumber", () => {
  const result = renumberDocument(baseDoc);
  const chapter = result.blocks.find((b) => b.type === "chapter");
  assert.equal(chapter?.metadata?.headingNumber, "BAB 1");
  const table = result.blocks.find((b) => b.type === "table");
  assert.equal(table?.metadata?.tableNumber, "1");
  const figure = result.blocks.find((b) => b.type === "image");
  assert.equal(figure?.metadata?.figureNumber, "1");
});

test("DOCX fixture passes full inspection", async () => {
  const result = await exportDocx(binusFixtureDocument);
  const inspection = await inspectDocx(result);
  printInspectionReport(inspection);
  assert.ok(inspection.valid, `DOCX inspection failed: ${inspection.errors.join("; ")}`);
});

test("BINUS fixture document exports with all expected content", async () => {
  const result = await exportDocx(binusFixtureDocument);
  const zip = await JSZip.loadAsync(result.data);
  const doc = await zip.file("word/document.xml")?.async("string") ?? "";
  const docUpper = doc.toUpperCase();
  
  // Verify cover content (case-insensitive)
  for (const expected of binusFixtureExpectations.coverMustContain) {
    assert.ok(docUpper.includes(expected.toUpperCase()), `Cover must contain: ${expected}`);
  }
  
  // Verify front matter
  for (const expected of binusFixtureExpectations.frontMatterMustContain) {
    assert.ok(docUpper.includes(expected.toUpperCase()), `Front matter must contain: ${expected}`);
  }
  
  // Verify body content
  for (const expected of binusFixtureExpectations.bodyMustContain) {
    assert.ok(docUpper.includes(expected.toUpperCase()), `Body must contain: ${expected}`);
  }
  
  // Verify page setup
  assert.ok(doc.includes('w:left="2268"'), "Must have BINUS 4cm left margin");
  assert.ok(doc.includes('w:line="360"'), "Must have 1.5 line spacing");
  
  // Verify numbering - check numbering.xml for the formats
  const numberingXml = await zip.file("word/numbering.xml")?.async("string") ?? "";
  assert.ok(numberingXml.includes('w:numFmt w:val="lowerRoman"'), "Must have lowerRoman numbering");
  assert.ok(numberingXml.includes('w:numFmt w:val="decimal"'), "Must have decimal numbering");
  
  // Verify footers
  const footerFront = await zip.file("word/footer_front.xml")?.async("string") ?? "";
  const footerBody = await zip.file("word/footer_body.xml")?.async("string") ?? "";
  assert.ok(footerFront.includes("LOWER ROMAN"), "Front footer must have LOWER ROMAN");
  assert.ok(footerBody.includes("ARABIC"), "Body footer must have ARABIC");
});

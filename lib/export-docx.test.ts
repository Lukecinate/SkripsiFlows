import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { exportDocx } from "./export-docx";
import type { SkripsiDocument } from "./document-model";

const baseDoc: SkripsiDocument = {
  schemaVersion: 1, id: "test", title: "Demo", templateId: "indonesia-standard-v1",
  citationStyle: "apa-7",
  blocks: [
    { id: "b1", type: "chapter", content: "BAB I", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false,
      metadata: { inline: JSON.stringify([{ text: "BAB I ", marks: [] }, { text: "PENDAHULUAN", marks: ["bold"] }]) } },
    { id: "b2", type: "paragraph", content: "Isi paragraf.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "b3", type: "table", content: "| A | B |\n| 1 | 2 |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
  ],
  references: [], reviewRequired: false, createdAt: "", updatedAt: "",
};

test("exports valid OOXML with required parts and inline marks", async () => {
  const result = await exportDocx(baseDoc);
  const zip = await JSZip.loadAsync(result.data);
  const doc = await zip.file("word/document.xml")?.async("string");
  const ct = await zip.file("[Content_Types].xml")?.async("string");
  const rels = await zip.file("word/_rels/document.xml.rels")?.async("string");
  const styles = await zip.file("word/styles.xml")?.async("string");
  assert.ok(doc, "document.xml must exist");
  assert.ok(ct, "Content_Types must exist");
  assert.ok(rels, "document.xml.rels must exist");
  assert.ok(styles, "styles.xml must exist");
  assert.ok(doc!.includes("<w:b/>"), "must contain bold run property");
  assert.ok(doc!.includes("PENDAHULUAN"), "must contain inline bold text");
  assert.ok(doc!.includes("Isi paragraf"), "must contain paragraph content");
  assert.ok(doc!.includes("<w:tbl"), "must contain table");
  assert.ok(doc!.includes("<w:tblGrid"), "must contain table grid");
  assert.ok(doc!.includes("<w:sectPr"), "must contain section properties");
  assert.ok(rels!.includes("styles.xml"), "rels must reference styles.xml");
  assert.ok(styles!.includes("TableGrid"), "styles must include table style");
  assert.ok(ct!.includes("word/document.xml"), "Content_Types must reference document.xml");
  assert.ok(ct!.includes("word/styles.xml"), "Content_Types must reference styles.xml");
});

test("exports filename is sanitized", async () => {
  const result = await exportDocx(baseDoc, "Bad<Name>.docx");
  assert.ok(result.filename.endsWith(".docx"));
  assert.ok(!result.filename.includes("<"));
});

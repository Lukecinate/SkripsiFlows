import test from "node:test";
import assert from "node:assert/strict";
import { validateDocument } from "./validation";
import type { SkripsiDocument } from "./document-model";
const base: SkripsiDocument = { schemaVersion: 1, id: "x", title: "Demo", templateId: "indonesia-standard-v1", citationStyle: "apa-7", blocks: [{ id: "b1", type: "paragraph", content: "Isi", confidence: 0.7, confidenceLevel: "low", source: "paste", needsReview: true }], references: [], reviewRequired: true, createdAt: "", updatedAt: "" };
test("allows export while warnings remain", () => { const report = validateDocument(base); assert.equal(report.canExport, true); assert.ok(report.issues.some((issue) => issue.code === "LOW_CONFIDENCE_BLOCK")); });
test("allows a clean document", () => { const clean = { ...base, blocks: [{ ...base.blocks[0], confidence: 1, confidenceLevel: "high" as const, needsReview: false, content: "Isi dokumen yang sudah diverifikasi." }], reviewRequired: false }; const report = validateDocument(clean); assert.equal(report.canExport, true); assert.equal(report.score, 100); });


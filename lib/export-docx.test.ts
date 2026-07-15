import test from "node:test";
import assert from "node:assert/strict";
import { exportDocx } from "./export-docx";
import { buildTemplatePreview } from "./template";
import type { SkripsiDocument } from "./document-model";
const document: SkripsiDocument = { schemaVersion: 1, id: "test", title: "Demo", templateId: "indonesia-standard-v1", citationStyle: "apa-7", blocks: [{ id: "b1", type: "chapter", content: "BAB I PENDAHULUAN", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false }, { id: "b2", type: "paragraph", content: "Isi dokumen.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false }], references: [], reviewRequired: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
test("maps document blocks to template roles", () => { assert.deepEqual(buildTemplatePreview(document).map((item) => item.role), ["heading", "paragraph"]); });
test("exports a valid docx package", async () => { const result = await exportDocx(document); assert.equal(result.mimeType, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); assert.ok(result.data.byteLength > 500); assert.equal(String.fromCharCode(...new Uint8Array(result.data).slice(0, 2)), "PK"); });



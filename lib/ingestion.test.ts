import test from "node:test";
import assert from "node:assert/strict";
import { ingestSource } from "./ingestion";

test("accepts Markdown and recognizes Indonesian chapter headings", () => { const result = ingestSource({ kind: "markdown", extension: ".md", name: "skripsi.md", content: "# BAB I PENDAHULUAN\n\n## 1.1 Latar Belakang\n\nIsi latar belakang penelitian ini cukup panjang untuk melewati confidence threshold." }); assert.ok(result.document); assert.equal(result.document.blocks[0].type, "chapter"); assert.equal(result.document.blocks[1].type, "section"); assert.equal(result.document.reviewRequired, false); });
test("accepts plain TXT and flags short ambiguous paragraphs", () => { const result = ingestSource({ kind: "plain-text", extension: ".txt", content: "BAB II\n\nCatatan" }); assert.ok(result.document); assert.equal(result.document.blocks[0].type, "chapter"); assert.equal(result.document.blocks[1].needsReview, true); assert.equal(result.document.reviewRequired, true); });
test("rejects unsupported, empty, and oversized input", () => { assert.equal(ingestSource({ kind: "paste", extension: ".doc", content: "text" }).document, null); assert.equal(ingestSource({ kind: "paste", content: "   " }).document, null); assert.equal(ingestSource({ kind: "paste", content: "x".repeat(2_000_001) }).document, null); });

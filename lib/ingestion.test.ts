import test from "node:test";
import assert from "node:assert/strict";
import { ingestSource, parseInlineMarkdown } from "./ingestion";

test("parses inline Markdown marks", () => {
  assert.deepEqual(parseInlineMarkdown("Normal **bold** *italic* ~~under~~"), [
    { text: "Normal ", marks: [] },
    { text: "bold", marks: ["bold"] },
    { text: " ", marks: [] },
    { text: "italic", marks: ["italic"] },
    { text: " ", marks: [] },
    { text: "under", marks: ["underline"] },
  ]);
});

test("maps Markdown heading levels to thesis structure", () => {
  const result = ingestSource({ kind: "markdown", extension: ".md", content: "# BAB I PENDAHULUAN\n\n## 1.1 Latar Belakang\n\n### 1.1.1 Konteks" });
  assert.ok(result.document);
  assert.deepEqual(result.document.blocks.map((block) => block.type), ["chapter", "section", "subchapter"]);
});

test("accepts plain TXT and flags short ambiguous paragraphs", () => {
  const result = ingestSource({ kind: "plain-text", extension: ".txt", content: "BAB II\n\nCatatan" });
  assert.ok(result.document);
  assert.equal(result.document.blocks[1].needsReview, true);
});

test("groups list items into a single list block", () => {
  const result = ingestSource({ kind: "markdown", extension: ".md", content: "- satu\n- dua\n- tiga" });
  assert.ok(result.document);
  const listBlock = result.document.blocks.find((b) => b.type === "list");
  assert.ok(listBlock);
  assert.match(listBlock.content, /satu/);
  assert.match(listBlock.content, /tiga/);
});

test("parses Markdown image with caption", () => {
  const result = ingestSource({ kind: "markdown", extension: ".md", content: '![Gambar UI](image.png "Tampilan aplikasi")' });
  assert.ok(result.document);
  const image = result.document.blocks.find((b) => b.type === "image");
  assert.ok(image);
  assert.equal(image.metadata?.caption, "Tampilan aplikasi");
});

test("parses Markdown table with alignment row", () => {
  const result = ingestSource({ kind: "markdown", extension: ".md", content: "| No | Nilai |\n| - | - |\n| 1 | 90 |\n| 2 | 80 |" });
  assert.ok(result.document);
  const table = result.document.blocks.find((b) => b.type === "table");
  assert.ok(table);
  assert.equal(table.content.split(/\n/).length, 4);
});

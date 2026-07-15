import test from "node:test";
import assert from "node:assert/strict";
import { createSnapshot, parseSnapshot, pushHistory, redo, undo } from "./session";
import type { SkripsiDocument } from "./document-model";
const document: SkripsiDocument = { schemaVersion: 1, id: "x", title: "Demo", templateId: "indonesia-standard-v1", citationStyle: "apa-7", blocks: [], references: [], reviewRequired: false, createdAt: "", updatedAt: "" };
test("expires and rejects malformed session snapshots", () => { const snapshot = createSnapshot(document, "draft", "APA 7", 1000); assert.ok(parseSnapshot(JSON.stringify(snapshot), 1001)); assert.equal(parseSnapshot(JSON.stringify(snapshot), snapshot.expiresAt), null); assert.equal(parseSnapshot("{broken"), null); });
test("bounds document undo and redo history", () => { const first = document; const second = { ...document, title: "Second" }; const third = { ...document, title: "Third" }; let history = pushHistory({ past: [], present: null, future: [] }, first); history = pushHistory(history, second); history = pushHistory(history, third); assert.equal(undo(history).present?.title, "Second"); assert.equal(redo(undo(history)).present?.title, "Third"); });

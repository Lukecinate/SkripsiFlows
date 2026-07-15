import type { SkripsiDocument } from "./document-model";

export interface SessionSnapshot { version: 1; savedAt: number; expiresAt: number; document: SkripsiDocument; paste: string; selectedStyle: string; }
export interface SessionHistory { past: SkripsiDocument[]; present: SkripsiDocument | null; future: SkripsiDocument[]; }
export const SESSION_KEY = "skripsiflow.session.v1";
export const SESSION_TTL_MS = 60 * 60 * 1000;
export const SESSION_MAX_BYTES = 4_000_000;

function isDocument(value: unknown): value is SkripsiDocument { if (!value || typeof value !== "object") return false; const candidate = value as Partial<SkripsiDocument>; return candidate.schemaVersion === 1 && typeof candidate.id === "string" && typeof candidate.title === "string" && Array.isArray(candidate.blocks) && Array.isArray(candidate.references); }
export function createSnapshot(document: SkripsiDocument, paste: string, selectedStyle: string, now = Date.now()): SessionSnapshot { return { version: 1, savedAt: now, expiresAt: now + SESSION_TTL_MS, document, paste: paste.slice(0, 2_000_000), selectedStyle }; }
export function serializeSnapshot(snapshot: SessionSnapshot): string { const serialized = JSON.stringify(snapshot); if (serialized.length > SESSION_MAX_BYTES) throw new Error("Ukuran session terlalu besar."); return serialized; }
export function parseSnapshot(serialized: string, now = Date.now()): SessionSnapshot | null { try { const parsed = JSON.parse(serialized) as Partial<SessionSnapshot>; if (parsed.version !== 1 || typeof parsed.savedAt !== "number" || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= now || !isDocument(parsed.document) || typeof parsed.paste !== "string" || typeof parsed.selectedStyle !== "string") return null; return { version: 1, savedAt: parsed.savedAt, expiresAt: parsed.expiresAt, document: parsed.document, paste: parsed.paste.slice(0, 2_000_000), selectedStyle: parsed.selectedStyle }; } catch { return null; } }
export function pushHistory(history: SessionHistory, next: SkripsiDocument, limit = 30): SessionHistory { if (!history.present) return { past: [], present: next, future: [] }; return { past: [...history.past, history.present].slice(-limit), present: next, future: [] }; }
export function undo(history: SessionHistory): SessionHistory { const previous = history.past.at(-1); if (!previous || !history.present) return history; return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] }; }
export function redo(history: SessionHistory): SessionHistory { const next = history.future[0]; if (!next || !history.present) return history; return { past: [...history.past, history.present], present: next, future: history.future.slice(1) }; }

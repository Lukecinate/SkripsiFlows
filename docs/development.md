# Development Guide

Panduan teknis untuk kontributor dan agent AI yang bekerja pada codebase ini.

## Arsitektur Modul (lib/)

```text
lib/
??? ingestion.ts      # Parsing input Markdown/TXT ? SkripsiDocument
??? citation.ts       # Analisis referensi & sitasi (APA 7, IEEE, Vancouver, Harvard, Chicago)
??? validation.ts     # Quality score, export gate, review requirement
??? template.ts       # Semantic template registry & role mapping
??? export-docx.ts    # Generator DOCX berbasis OOXML
??? session.ts        # Autosave, expiry, undo/redo (localStorage)
??? rate-limit.ts     # In-memory rate limiter (shared API routes)
??? document-model.ts # Type definitions: SkripsiDocument, DocumentBlock, dll.
??? ingestion.test.ts # Unit tests (node:test)
```

## Perintah Development

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan development server (Turbopack) |
| `npm test` | Jalankan seluruh test TypeScript (node:test) |
| `npm run build` | Validasi production build (TypeScript + Next.js) |
| `npm start` | Jalankan production server setelah build |
| `npm audit --omit=dev` | Cek advisory dependency production |

### Sebelum Push

```bash
git fetch origin
git pull --ff-only origin master
npm test
npm run build
git diff --check
git push origin master
```

## Struktur Dokumentasi Internal

- `docs/` ? Produk, arsitektur, keamanan, UX, testing, template, citation, document model
- `doc-logs/` ? Catatan perubahan auditable per-tanggal
- `doc-nexts/` ? Konteks decision-complete untuk agent berikutnya

## API Routes (App Router)

- `app/api/export/docx/route.ts` ? Export DOCX dengan rate-limit (10 req/menit/IP)
- `app/api/export/pdf/route.ts` ? Export PDF (placeholder) dengan rate-limit

Kedua route menggunakan `lib/rate-limit.ts` (shared in-memory `Map`).

> **Known limitation**: In-memory `Map` hanya akurat di single instance/process. Deploy ke serverless/horizontal scaling (Vercel Functions) memerlukan Redis/distributed store.

## Modul Utama ? Ringkasan

### ingestion.ts
- `ingestSource(input)` ? `IngestionResult`
- Deteksi heading (`BAB I`, `1.1`, Markdown `#`)
- Blok: chapter, section, subchapter, paragraph, list, quote, table, image
- Confidence score per blok + `needsReview` flag

### citation.ts
- `extractReferences(doc)`, `extractCitations(doc)`, `analyzeCitations(doc)`
- Style preset: APA 7, IEEE, Vancouver, Harvard, Chicago

### validation.ts
- `validateDocument(doc)` ? `ValidationResult` (quality score, issues, exportAllowed)

### template.ts
- Template registry dengan role mapping blok ke style DOCX

### export-docx.ts
- `exportDocx(doc, filename)` ? `{ data: Uint8Array, mimeType, filename }`
- OOXML generator, XML-escaped text, sanitized filename

### session.ts
- `saveSession`, `loadSession`, `clearSession`
- TTL 60 menit, max 4 MB, undo/redo 30 state

## Testing

- Framework: `node:test` + `node:assert/strict`
- File: `lib/ingestion.test.ts` (baseline 12 passing, 2 failing pre-existing)
- Tambah test baru di sebelah `.test.ts` yang relevan

## Convensi Kode

- `strict: true` di `tsconfig.json` ? tidak boleh ada `any` implisit.
- Hindari `dangerouslySetInnerHTML`, `eval`, dynamic code execution.
- Semua input divalidasi schema sebelum diproses.
- Filename export disanitasi (hanya alfanumerik, `-`, `_`, `.`).

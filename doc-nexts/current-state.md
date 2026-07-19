# Current State

## Product
- Name: SkripsiFlow.
- Purpose: convert Markdown, TXT, and paste into Indonesian thesis documents (BINUS-compliant).
- Primary routes: `/workspace` (input) and `/workspace/editor` (canonical editor with Document / ToC tabs).
- Git: `master` tracks `origin/master` at the latest pushed commit.

## Implemented
- Heuristic heading inference: inferHeading() detects structure from plain text (BAB, numbering, ALL CAPS, keywords).
- Daftar Isi integrated ke panel kiri (tabs: Heading/Tabel/Gambar).
- Word-like document preview: continuous flow, Times New Roman, justify, click-to-edit tanpa border textarea.
- Hierarchical drag & drop: reordering heading juga memindahkan konten di bawahnya.
- Table rendering: proper HTML table dengan thead/tbody, skip alignment row.
- Inline markdown conversion: *italic*, **bold**, code, underline ter-render di semua konten termasuk tabel.
- Canvas tanpa batas: document-preview tanpa max-height, scroll natural.
- Parser Markdown kaya: heading 1/2/3, list, table, image, inline formatting.
- BINUS template (binus-management-v1).
- Auto-ToC + auto-numbering.
- DOCX export OOXML dua-section.
- PDF export spes BINUS.
- Citation/reference parsing.
- Format picker: PDF/DOCX.
- Local autosave, undo/redo.
- Quality Check dihapus.
## Code Organization
- Package manager: pnpm.
- Code style: max 300 lines per file; files exceeding 300 lines refactored with OOP/YAGNI/KISS/SOLID.
- DOCX export split: `export-docx.ts` (orchestrator), `docx-xml-builders.ts` (XML helpers), `docx-templates.ts` (static OOXML parts).
- PDF export split: `export-pdf.ts` (orchestrator), `pdf-text-utils.ts`, `pdf-drawing-utils.ts`, `pdf-page-utils.ts`, `pdf-block-renderers.ts`, `pdf-table-renderer.ts`, `pdf-helpers.ts` (barrel).
- Security hardening: ReDoS bounded quantifiers, single-pass XML escaping with cache, safeFilename, sanitizeForPdf, control char filtering.
- Performance: React.memo on preview components, useMemo on outline/toc chains, ref pattern to break dependency cycles, startTransition for non-urgent updates.

## Not Implemented
- Server-side persistence atau accounts.
- Legacy binary `.doc` export.
- Render gambar biner asli (saat ini text placeholder di DOCX/PDF).
- Campus logo non-placeholder.

## Validation Baseline
- `pnpm test`: 30 tests passing.
- `pnpm build`: passing.
- `git diff --check`: passing (hanya warning CRLF).
- Smoke test: DOCX 35 KB dengan semua elemen BINUS; PDF 7 halaman (cover + daftar isi/tabel/gambar + 2 bab).

## Documentation Integrity
- Complete history mapping: `doc-logs/2026-07-15-complete-history.md`.
- Latest change log: `doc-logs/2026-07-20-heuristic-infer-heading-and-word-preview.md`.
- Product/architecture truth: `docs/`.
- Next-agent execution context: `doc-nexts/agent-context.md` dan `doc-nexts/next-task.md`.

## Version
- `1.0.0-beta` (incremental dari `0.2.0-Prototype`).
- Format: V[Major].[Minor].[Minimal]-beta.

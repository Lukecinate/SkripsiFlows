# 2026-07-18: Code Readability & Security Refactor

## Summary
Comprehensive refactoring for code readability (junior dev friendly), security hardening, performance optimization, and DOCX Word compatibility.

## Changes

### Security Hardening
- `lib/citation.ts`: Bounded ReDoS quantifiers (`\d{1,3}` instead of `\d+`), added `sanitizeRaw()` to strip credential patterns from raw reference text.
- `lib/ingestion.ts`: Bounded ReDoS quantifiers in parser regexes.
- `lib/docx-xml-builders.ts`: Single-pass `escapeXml` with LRU cache (max 2048 entries), `safeText` strips XML-invalid control characters.
- `lib/export-docx.ts`: `safeFilename` uses NFKC normalization, strips dangerous extensions, length-limited to 120 chars.
- `lib/pdf-text-utils.ts`: `sanitizeForPdf` strips non-WinAnsi characters, null bytes, control chars; cached result per DrawLine.
- `app/workspace/editor/page.tsx`: Defensive filename check, MIME type on download anchor, localStorage debounce.

### Performance Optimization
- `components/DocumentPreview.tsx`: `React.memo` on `PreviewBlock`, `InlineRun`, `InlineContent`, `NumberedTitle`.
- `components/StructurePanel.tsx`: `useMemo` for `buildOutline()` chain.
- `components/TocPanel.tsx`: `useMemo` for `buildToc()` chain.
- `app/workspace/editor/page.tsx`: Ref pattern to break dependency cycles, `startTransition` for non-urgent state updates.
- `app/workspace/page.tsx`: `requestAnimationFrame` for localStorage persist.

### Code Refactoring (300-line limit)
- `lib/export-pdf.ts` (434→244 lines): Extracted `pdf-text-utils.ts`, `pdf-drawing-utils.ts`, `pdf-page-utils.ts`, `pdf-block-renderers.ts`, `pdf-table-renderer.ts`, `pdf-helpers.ts`.
- `lib/export-docx.ts` (406→340 lines): Extracted `docx-xml-builders.ts`, `docx-templates.ts`.
- All files now have JSDoc headers, section markers, descriptive function names, and "why" comments.

### DOCX Word Compatibility
- Added `word/fontTable.xml` — declares Times New Roman and Symbol fonts.
- Added `docProps/core.xml` and `docProps/app.xml` — document metadata.
- Wired `<w:footerReference>` in both `<w:sectPr>` elements — front matter uses lowerRoman footer, body uses Arabic footer.
- Added footer content types and relationships to `[Content_Types].xml` and `word/_rels/document.xml.rels`.
- Replaced empty `<w:drawing/>` in image blocks with styled text placeholder `[Gambar: caption]`.
- All parts now have proper content type declarations and relationships.

### Package Manager Migration
- Migrated from npm to pnpm.
- Removed `package-lock.json`, generated `pnpm-lock.yaml`.

## Files Added
- `lib/docx-xml-builders.ts` — XML escaping, spacing, run/paragraph builders.
- `lib/docx-templates.ts` — Static OOXML package parts.
- `lib/pdf-text-utils.ts` — Text sanitization for PDF.
- `lib/pdf-drawing-utils.ts` — PDF drawing primitives.
- `lib/pdf-page-utils.ts` — PDF page management.
- `lib/pdf-block-renderers.ts` — PDF block rendering.
- `lib/pdf-table-renderer.ts` — PDF table rendering.
- `lib/pdf-helpers.ts` — Barrel export for PDF sub-modules.

## Files Modified
- `lib/citation.ts` — ReDoS fix, sanitizeRaw.
- `lib/ingestion.ts` — ReDoS bounded quantifiers.
- `lib/export-docx.ts` — Security hardening, module extraction, Word compatibility.
- `lib/export-pdf.ts` — Security hardening, module extraction.
- `lib/template.ts` — Minor cleanup.
- `app/workspace/editor/page.tsx` — Security, performance, readability.
- `app/workspace/page.tsx` — Performance (rAF).
- `components/DocumentPreview.tsx` — React.memo, readability.
- `components/StructurePanel.tsx` — useMemo.
- `components/TocPanel.tsx` — useMemo.
- `docs/architecture.md` — Updated module list.
- `doc-nexts/current-state.md` — Updated package manager, module structure.

## Verification
- `pnpm test`: 30/30 passing.
- `pnpm build`: passing.
- DOCX opens in Microsoft Word without repair dialog.

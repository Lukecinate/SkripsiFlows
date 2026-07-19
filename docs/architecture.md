# Architecture

## Runtime Boundaries
1. Browser UI in `app/` owns user interaction, temporary session recovery, and download initiation.
2. Domain modules in `lib/` are framework-independent TypeScript and own parsing, citations, validation, templates, export, and session contracts.
3. Components in `components/workspace/` are presentational; state lives in page-level orchestrators.
4. The current release has no server-side document persistence or API ingestion boundary beyond the health route.

## Routes
- `/workspace` — Input page: file upload and paste ingestion, redirects to editor after parse.
- `/workspace/editor` — Canonical editor: two-panel layout (StructurePanel + DocumentPreview), export, quality check.

## Data Flow
`upload/paste -> ingestion -> SkripsiDocument -> session snapshot -> /workspace/editor -> validation/citation analysis -> template mapping -> PDF/DOCX export -> browser download`

## Domain Modules
- `lib/ingestion.ts`: normalizes source text, detects structural blocks, and assigns provenance/confidence.
- `lib/citation.ts`: parses references, extracts citation tokens, detects mismatch/duplicate/incomplete cases, and formats styles.
- `lib/validation.ts`: creates quality score and export eligibility report.
- `lib/template.ts`: maps block types to semantic template roles.
- `lib/renumber.ts`: assigns heading, table, and figure numbering.
- `lib/outline.ts`: builds document outline with chapter/section/subchapter hierarchy.
- `lib/toc.ts`: builds table of contents entries for headings, tables, and figures.
- `lib/session.ts`: validates versioned local snapshots, applies expiry/quota checks, and bounds undo/redo history.
- `lib/export-docx.ts`: orchestrates DOCX export — builds block XML, cover, front matter, and assembles the ZIP package.
- `lib/docx-xml-builders.ts`: XML escaping, spacing, run/paragraph/table builders for DOCX.
- `lib/docx-templates.ts`: static OOXML package parts (content types, relationships, numbering, settings, footers, fonts, docProps).
- `lib/export-pdf.ts`: orchestrates PDF export — cover, ToC, body, and file download.
- `lib/pdf-text-utils.ts`: WinAnsi sanitization, control char filtering, text measurement for PDF.
- `lib/pdf-drawing-utils.ts`: PDF drawing primitives (lines, rectangles, cell backgrounds).
- `lib/pdf-page-utils.ts`: page management, margin/position calculations, page break detection.
- `lib/pdf-block-renderers.ts`: renders paragraphs, headings, lists, quotes, and chapter blocks to PDF.
- `lib/pdf-table-renderer.ts`: renders tables to PDF with column sizing and cell borders.
- `lib/pdf-helpers.ts`: barrel export for PDF sub-modules.

## Components
- `components/workspace/StructurePanel.tsx`: left sidebar with block navigation, drag-and-drop, multi-select, inline editing.
- `components/workspace/DocumentPreview.tsx`: right panel with WYSIWYG-like document rendering using template styles.
- `components/workspace/CampusLogo.tsx`: placeholder university logo SVG for document preview header.
- `components/workspace/FormatPicker.tsx`: PDF/DOCX download dropdown selector.
- `components/workspace/QualityCheck.tsx`: quality score display.
- `components/workspace/AnalysisModal.tsx`: analysis result dialog.
- `components/workspace/ConfirmDialog.tsx`: reusable confirmation dialog.
- `components/workspace/ReferencePreview.tsx`: citation/reference formatted output.

## Invariants
- Parser does not silently invent academic or reference metadata.
- Ambiguity is represented with confidence and `needsReview`.
- Export never uses quality score or review warnings as a permission gate.
- Untrusted text is XML-escaped before OOXML insertion.
- Output filenames are normalized and length-limited.
- Session snapshots are versioned, size-limited, expiry-limited, and browser-only.
- Document content is not written to logs.

## Future Boundary
A server/API layer may be introduced for larger documents and DOC conversion. It must enforce request limits, safe error envelopes, rate limiting, and content-free logs before accepting document payloads.

## Export policy
- Quality score is advisory and never acts as an export permission gate.
- Both PDF and DOCX export are available via the format picker.
- DOCX export produces valid OOXML that opens correctly in Microsoft Word.

## Error boundaries
- `app/error.tsx` handles route-level rendering failures.
- `app/global-error.tsx` handles root-level rendering failures.
- `lib/safe-error.ts` centralizes user-safe error copy and recovery guidance.
- Internal errors remain available to platform diagnostics but are never rendered by the UI.

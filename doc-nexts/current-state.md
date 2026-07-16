# Current State

## Product
- Name: SkripsiFlow.
- Purpose: convert Markdown, TXT, and paste into Indonesian thesis documents.
- Primary routes: `/workspace` (input) and `/workspace/editor` (canonical editor).
- Git: `master` tracks `origin/master` at the latest pushed commit.

## Implemented
- Responsive Indonesian landing page and workspace UI.
- Two-route workspace: input page (`/workspace`) for upload/paste, canonical editor (`/workspace/editor`) with two-panel layout.
- Upload and paste ingestion for `.md`, `.markdown`, and `.txt`.
- Conservative heading/list/table/quote parsing with provenance and confidence.
- Structure panel (left sidebar): block navigation with type badges, drag-and-drop reorder, multi-select, inline editing, bulk delete.
- Document preview (right panel): WYSIWYG-like rendering with A4 page proportions, template-based font/size/alignment, campus logo placeholder.
- Bidirectional sync: click in structure panel highlights in preview and vice versa.
- Citation/reference parsing and validation.
- APA 7, IEEE, Vancouver, Harvard, and Chicago formatting adapters.
- Semantic Indonesia-standard template registry.
- PDF export with sanitized filename; quality warnings remain informational.
- DOCX export with valid OOXML structure — opens correctly in Microsoft Word.
- Markdown heading hierarchy and inline bold/italic/underline formatting are preserved in DOCX runs.
- PDF export WinAnsi-sanitizes all drawn text so non-Latin punctuation and AI symbols no longer abort export.
- Format picker: download as PDF or DOCX with dropdown selector.
- Campus logo placeholder in document preview header.
- Quality score and manual review modal.
- Local autosave/recovery with 60-minute expiry, 4 MB cap, and bounded undo/redo.
- Documentation contract under `docs/`, `doc-logs/`, and `doc-nexts/`.
- Public README documents product purpose, installation, usage, security, architecture, and current limitations.
- Frontend visual refresh uses a contrast-first navy/mint/amber palette with SVG branding and responsive accessibility states.
- Landing page includes an accessible visual usage guide and visible version tag.
- Analysis modal uses the restored warm cream/green theme with structured issue rows and accessible close/action controls.
- Extracted components: StructurePanel, DocumentPreview, CampusLogo, FormatPicker, QualityCheck, AnalysisModal, ConfirmDialog, ReferencePreview.

## Not Implemented
- Server-side persistence or accounts.
- Legacy binary `.doc` export.
- Full campus-specific template mapper (logo is placeholder).
- Rich Markdown AST parsing for nested structures and images.
- Automated external metadata lookup for DOI/ISBN.

## Validation Baseline
- `npm test`: 16 tests passing.
- `npm run build`: passing.
- Static security scan: no unsafe HTML sink, dynamic execution, shell execution, or committed secret pattern found.
- `git diff --check`: must pass before future push.
- `npm audit --omit=dev`: two moderate PostCSS advisories transitively related to Next; automatic fix is breaking and remains a tracked dependency task.

## Documentation Integrity
- Complete history mapping: `doc-logs/2026-07-15-complete-history.md`.
- Product/architecture truth: `docs/`.
- Next-agent execution context: `doc-nexts/agent-context.md` and `doc-nexts/next-task.md`.

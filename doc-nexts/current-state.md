# Current State

## Product
- Name: SkripsiFlow.
- Purpose: convert Markdown, TXT, and paste into Indonesian thesis documents.
- Primary route: `/workspace`.
- Git: `master` tracks `origin/master` at the latest pushed commit.

## Implemented
- Responsive Indonesian landing page and workspace UI.
- Upload and paste ingestion for `.md`, `.markdown`, and `.txt`.
- Conservative heading/list/table/quote parsing with provenance and confidence.
- Structural block editing and drag-and-drop ordering.
- Citation/reference parsing and validation.
- APA 7, IEEE, Vancouver, Harvard, and Chicago formatting adapters.
- Semantic Indonesia-standard template registry.
- PDF export with sanitized filename; quality warnings remain informational. DOCX is retained as legacy code pending Word package validation.\n- Markdown heading hierarchy and inline bold/italic/underline formatting are preserved in DOCX runs.
- PDF export WinAnsi-sanitizes all drawn text so non-Latin punctuation and AI symbols (arrows, emoji, CJK, box-drawing) no longer abort export.
- Quality score and manual review modal.
- Local autosave/recovery with 60-minute expiry, 4 MB cap, and bounded undo/redo.
- Documentation contract under `docs/`, `doc-logs/`, and `doc-nexts/`.\n- Public README documents product purpose, installation, usage, security, architecture, and current limitations.\n- Frontend visual refresh uses a contrast-first navy/mint/amber palette with SVG branding and responsive accessibility states.\n- Landing page includes an accessible visual usage guide and visible `v0.1.0` version tag.\n- Workspace analysis opens a review modal; unresolved blocks remain highlighted and can be edited or deleted.\n- Users can change block types between Bab, Subbab, Sub-subbab, paragraph, quote, list, table, and reference.\n- Analysis modal uses the restored warm cream/green theme with structured issue rows and accessible close/action controls.

## Not Implemented
- Server-side persistence or accounts.
- Legacy binary `.doc` export.
- Full campus-specific template mapper.
- Rich Markdown AST parsing for nested structures and images.
- Automated external metadata lookup for DOI/ISBN.

## Validation Baseline
- `npm test`: 12 tests passing.
- `npm test`: 15 tests passing (includes PDF Unicode sanitizer regression tests).
- `npm run build`: passing.
- Static security scan: no unsafe HTML sink, dynamic execution, shell execution, or committed secret pattern found.
- `git diff --check`: must pass before future push.
- `npm audit --omit=dev`: two moderate PostCSS advisories transitively related to Next; automatic fix is breaking and remains a tracked dependency task.

## Documentation Integrity
- Complete history mapping: `doc-logs/2026-07-15-complete-history.md`.
- Product/architecture truth: `docs/`.
- Next-agent execution context: `doc-nexts/agent-context.md` and `doc-nexts/next-task.md`.

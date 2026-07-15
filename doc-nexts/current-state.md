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
- OOXML DOCX export with sanitized filename and unresolved-review gate.
- Quality score and manual review modal.
- Local autosave/recovery with 60-minute expiry, 4 MB cap, and bounded undo/redo.
- Documentation contract under `docs/`, `doc-logs/`, and `doc-nexts/`.

## Not Implemented
- Server-side persistence or accounts.
- Legacy binary `.doc` export.
- Full campus-specific template mapper.
- Rich Markdown AST parsing for nested structures and images.
- Automated external metadata lookup for DOI/ISBN.

## Validation Baseline
- `npm test`: 12 tests passing.
- `npm run build`: passing.
- Static security scan: no unsafe HTML sink, dynamic execution, shell execution, or committed secret pattern found.
- `git diff --check`: must pass before future push.
- `npm audit --omit=dev`: two moderate PostCSS advisories transitively related to Next; automatic fix is breaking and remains a tracked dependency task.

## Documentation Integrity
- Complete history mapping: `doc-logs/2026-07-15-complete-history.md`.
- Product/architecture truth: `docs/`.
- Next-agent execution context: `doc-nexts/agent-context.md` and `doc-nexts/next-task.md`.

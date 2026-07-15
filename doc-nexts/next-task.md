# Next Task

## Task
Harden the document pipeline with a server/API boundary and production-grade DOCX/template validation.

## Priority Order
1. Add a server-side ingestion/export API boundary without logging document content.
2. Add request size limits, MIME/content validation, rate limiting strategy, and safe error envelopes.
3. Add DOCX fixture inspection for required OOXML parts, semantic styles, page setup, and tables.
4. Add a campus-template adapter contract and one fixture template.
5. Review the transitive PostCSS advisory and upgrade Next only through a compatible patched release.

## Acceptance Criteria
- No API response exposes raw stack traces or document content in logs.
- Requests reject oversized/malformed input before parsing.
- DOCX fixtures contain required package parts and semantic styles.
- Template adapters cannot inject arbitrary XML names or unsafe filenames.
- All existing tests remain passing.
- `npm run build`, `git diff --check`, and security scans pass.
- Documentation changes are included in the same implementation cycle.

## Verification
# Resolved (2026-07-16)
- PDF export no longer aborts on non-WinAnsi characters (arrows, emoji, CJK, box-drawing, null bytes) via a WinAnsi-safe sanitizer in lib/export-pdf.ts with regression tests.
```text
npm test
npm run build
git diff --check
npm audit --omit=dev
```

## Git Rule
Before every push: `git fetch origin`, `git pull --ff-only origin master`, test, commit with Conventional Commits, push, and verify `git status` plus upstream alignment.

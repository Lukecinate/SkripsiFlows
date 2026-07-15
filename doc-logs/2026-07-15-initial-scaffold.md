# Change Log

## 2026-07-15
- Category: scaffold, product identity, documentation
- Added SkripsiFlow project identity and initial Next.js application shell.
- Added landing page, health endpoint, document model contract, and three documentation areas.
- Compatibility: no existing implementation; greenfield baseline.
- Validation: repository file inspection and planned build validation.
- Rollback: remove initial scaffold commit if the project direction changes.

## Follow-up validation
- Upgraded to patched Next.js/React versions and pinned stable TypeScript toolchain.
- 
pm run build passes.
- 
pm audit still reports two moderate advisories for future dependency review.

## Ingestion implementation
- Added deterministic Markdown, Markdown-like TXT, and paste ingestion with provenance and confidence flags.
- Added three ingestion tests covering headings, ambiguity, and invalid input.
- Confirmed remote: https://github.com/Lukecinate/SkripsiFlows.git; no push performed.

## Workspace milestone
- Added /workspace for file upload, paste, deterministic parsing, confidence review, editable blocks, citation-style selection, and structural drag-and-drop.
- Confirmed 
pm test and 
pm run build pass.

## Citation milestone
- Added reference parsing, citation mismatch detection, duplicate/incomplete checks, and APA 7, IEEE, Vancouver, Harvard, Chicago rendering.
- Integrated formatted reference preview into /workspace.
- All six tests and production build pass.

## Template and export milestone
- Added semantic template registry for the Indonesia standard template.
- Added OOXML DOCX exporter with document styles, paragraph/table support, and review gate.
- Integrated browser DOCX download from workspace.
- Eight tests and production build pass.

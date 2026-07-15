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

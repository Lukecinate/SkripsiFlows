# Architecture

## Runtime Boundaries
1. Browser UI in `app/` owns user interaction, temporary session recovery, and download initiation.
2. Domain modules in `lib/` are framework-independent TypeScript and own parsing, citations, validation, templates, export, and session contracts.
3. The current release has no server-side document persistence or API ingestion boundary beyond the health route.

## Data Flow
`upload/paste -> ingestion -> SkripsiDocument -> validation/citation analysis -> template mapping -> PDF document -> browser download`

## Domain Modules
- `lib/ingestion.ts`: normalizes source text, detects structural blocks, and assigns provenance/confidence.
- `lib/citation.ts`: parses references, extracts citation tokens, detects mismatch/duplicate/incomplete cases, and formats styles.
- `lib/validation.ts`: creates quality score and export eligibility report.
- `lib/template.ts`: maps block types to semantic template roles.
- `lib/export-pdf.ts`: generates a paginated PDF and sanitizes output filenames.
- `lib/session.ts`: validates versioned local snapshots, applies expiry/quota checks, and bounds undo/redo history.

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
- exportDocx enforces only the minimum document object needed to generate a file; the UI may export documents with warnings or a score of 0/100.

## Export strategy change
- PDF is now the primary browser export because it avoids Word repair compatibility issues.
- DOCX implementation remains isolated as legacy code until a valid Word package is fully validated.

## Error boundaries
- pp/error.tsx handles route-level rendering failures.
- pp/global-error.tsx handles root-level rendering failures.
- lib/safe-error.ts centralizes user-safe error copy and recovery guidance.
- Internal errors remain available to platform diagnostics but are never rendered by the UI.

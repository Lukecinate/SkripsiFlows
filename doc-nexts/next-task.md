# Next Task

## Task
Implement deterministic ingestion for Markdown, Markdown-like TXT, and paste input.

## Target areas
- Add source input types and parser module under `lib/`.
- Preserve source provenance and stable block IDs.
- Add validation for extension, size, encoding, and empty content.

## Acceptance criteria
- `.md`, `.markdown`, and `.txt` are accepted.
- Plain text headings such as `BAB I` and `1.1` are recognized conservatively.
- Low-confidence blocks carry `needsReview: true`.
- No input content is written to logs.
- Unit fixtures cover valid and malformed inputs.

## Verification
Run `npm test` and the relevant parser test file. Run `npm run build` before handoff.

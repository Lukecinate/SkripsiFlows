# Testing and Quality

## Current Test Suites
- Ingestion: Markdown/TXT/paste, chapter headings, ambiguity, empty/oversized/unsupported input.
- Citation: numeric gaps, formatted styles, duplicates, incomplete sources.
- Template/export: semantic role mapping, valid DOCX ZIP signature.
- Validation: low-confidence export block and clean-document readiness.
- Session: expiry, malformed snapshot rejection, bounded undo/redo.

## Current Baseline
- `npm test`: 12 passing tests.
- `npm run build`: passing.
- `git diff --check`: required release gate.
- Static scan: no unsafe HTML sink, dynamic code execution, shell execution, or committed secret pattern found.

## Quality Gates
- Any low-confidence block requires review guidance, but does not block export.
- Critical validation issues remain visible; export availability is independent of quality score.
- DOCX output must contain required package parts and escaped text.
- Session snapshots must reject malformed, expired, oversized, or invalid-schema data.
- No test or log may expose real user document content.

## Target Metric
The <1% target means less than 1% undetected defects on a representative corpus. Low-confidence cases must be surfaced for review rather than silently guessed.

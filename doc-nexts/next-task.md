# Next Task

## Task
Fix pre-existing build errors and add reference/daftar pustaka auto-generation.

## Priority Order
1. Fix checkRateLimit undefined in app/api/export/docx/route.ts.
2. Fix deprecated config export in app/api/export/pdf/route.ts.
3. Add reference/daftar pustaka auto-generation dari citation entries.
4. Add server-side ingestion/export API boundary.
5. Add request size limits, MIME validation, rate limiting.

## Acceptance Criteria
- Build passes without errors.
- Heading inference detects all Indonesian thesis patterns.
- Panel kiri + kanan render tanpa overlap.
- All tests passing, build clean, docs updated.

## Verification
```text
npm test
npm run build
git diff --check
```

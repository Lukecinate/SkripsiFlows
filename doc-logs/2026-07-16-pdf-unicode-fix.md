# Change Log

## 2026-07-16
- Category: export, pdf, bugfix
- Fixed PDF export failing when document text contains characters outside the WinAnsi encoding supported by pdf-lib StandardFonts (e.g. arrows, stars, box-drawing lines, emoji, CJK, Arabic, null bytes).
- Root cause: pdf-lib drawText and widthOfTextAtSize throw for any code point absent from the embedded font's character set, aborting the entire export.
- Added WinAnsi-safe sanitizer in lib/export-pdf.ts that substitutes common non-encodable characters with ASCII equivalents and falls back to NFKD decomposition then "?" for the remainder.
- Sanitizer is applied to inline segments and table rows before any font width measurement or text drawing, and the supported code point set is cached per export.
- Added two regression tests covering non-WinAnsi characters in paragraphs and table rows.
- Compatibility: no breaking change to the document model or API; export behavior preserved for valid Indonesian/Latin text.
- Validation: npm test (15 passing), npm run build passing, git diff --check passing.
- Rollback: revert lib/export-pdf.ts and lib/export-pdf.test.ts to the previous commit to restore prior behavior.

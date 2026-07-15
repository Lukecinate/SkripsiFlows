# Testing and Quality

## Required suites
- Parser fixtures untuk Markdown, plain text, AI output, Unicode, tabel, dan heading.
- Upload fixtures untuk MD, Markdown, TXT, BOM, UTF-16, empty, oversized, dan MIME mismatch.
- Citation fixtures untuk author-year, numeric, DOI, URL, footnote, duplicate, dan incomplete references.
- Export fixtures untuk semantic styles, numbering, tables, captions, headers, footers, and page breaks.
- E2E flow dari import hingga export.

## Quality target
Target <1% berarti kurang dari 1% undetected defects pada corpus representatif. Low-confidence cases harus menjadi review-required, bukan dipaksakan otomatis.

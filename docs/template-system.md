# Template System

Template memakai semantic role: cover, approval, abstract, heading, paragraph, quote, caption, reference, header, footer, dan page-number.

Template registry akan memisahkan `templateId` dari parser. Template baku Indonesia menjadi baseline; template kampus/prodi ditambahkan sebagai adapter.

Template final harus memiliki fixture output dan visual review sebelum dinyatakan production-ready.

## Markdown-to-Word mapping
- Heading levels are preserved as semantic block types before template mapping.
- Inline Markdown marks are preserved as run-level Word formatting rather than flattened into plain text.

# Document Model

`lib/document-model/index.ts` adalah kontrak awal. Semua perubahan breaking harus menaikkan `schemaVersion` dan menambahkan migration note.

## Required invariants
- Setiap block memiliki `id` stabil selama session.
- `confidence` berada pada rentang 0..1.
- `needsReview` true jika interpretasi tidak aman.
- Setiap reference mempertahankan `raw` untuk audit dan pemulihan manual.
- `reviewRequired` records review state for guidance; it does not block DOCX export.

## Editable section types
- Supported user-facing block types include Bab utama (chapter), Subbab (section), Sub-subbab (subchapter), Paragraf, Kutipan, Daftar, Tabel, and Referensi.
- Changing a block type is a manual edit: it raises confidence to 1 and clears 
eedsReview.
- subchapter maps to the semantic heading template role and preserves export compatibility.

## Inline formatting and heading hierarchy
- Blocks may store metadata.inline as JSON inline segments with old, italic, and underline marks.
- Markdown # maps to Bab utama, ## to Subbab, and deeper heading levels to Sub-subbab.
- The exporter converts inline marks into OOXML run properties (w:b, w:i, w:u).

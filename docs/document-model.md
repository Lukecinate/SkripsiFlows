# Document Model

`lib/document-model/index.ts` adalah kontrak awal. Semua perubahan breaking harus menaikkan `schemaVersion` dan menambahkan migration note.

## Required invariants
- Setiap block memiliki `id` stabil selama session.
- `confidence` berada pada rentang 0..1.
- `needsReview` true jika interpretasi tidak aman.
- Setiap reference mempertahankan `raw` untuk audit dan pemulihan manual.
- `reviewRequired` true jika terdapat block atau reference kritis yang belum valid.

## Editable section types
- Supported user-facing block types include Bab utama (chapter), Subbab (section), Sub-subbab (subchapter), Paragraf, Kutipan, Daftar, Tabel, and Referensi.
- Changing a block type is a manual edit: it raises confidence to 1 and clears 
eedsReview.
- subchapter maps to the semantic heading template role and preserves export compatibility.

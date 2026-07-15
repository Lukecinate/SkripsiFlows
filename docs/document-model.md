# Document Model

`lib/document-model/index.ts` adalah kontrak awal. Semua perubahan breaking harus menaikkan `schemaVersion` dan menambahkan migration note.

## Required invariants
- Setiap block memiliki `id` stabil selama session.
- `confidence` berada pada rentang 0..1.
- `needsReview` true jika interpretasi tidak aman.
- Setiap reference mempertahankan `raw` untuk audit dan pemulihan manual.
- `reviewRequired` true jika terdapat block atau reference kritis yang belum valid.

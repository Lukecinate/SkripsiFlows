# Architecture

## Boundaries
1. Ingestion membaca upload/paste dan menghasilkan source text.
2. Parser mengubah source text menjadi blok kandidat.
3. Normalizer menghasilkan `SkripsiDocument` versi schema.
4. Citation pipeline mengekstrak dan memvalidasi referensi.
5. Review layer menangani confidence rendah.
6. Template layer memetakan semantic roles ke Word styles.
7. Exporter menghasilkan DOCX lalu optional DOC legacy.

## Invariants
- Parser tidak mengubah isi tanpa provenance.
- Ambiguity tidak boleh hilang tanpa flag `needsReview`.
- Template tidak boleh mengetahui detail parser.
- Export tidak boleh menerima dokumen yang memiliki critical unresolved review.
- Schema document model memakai versioning eksplisit.

## Session
Versi awal tanpa akun memakai session token acak dan retensi sementara. Konten tidak boleh dimasukkan ke log.

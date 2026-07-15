# Security and Privacy

- Validasi extension, MIME, ukuran, encoding, dan content.
- Sanitasi markup dan blokir path traversal pada upload.
- Jangan menaruh isi dokumen pada application logs.
- Temporary session memiliki expiry yang dapat dikonfigurasi.
- AI eksternal hanya dipanggil untuk ambiguity dengan persetujuan produk yang sesuai.
- Jangan mengklaim konten tidak digunakan untuk training tanpa kontrak provider yang jelas.

## 2026-07-15 audit
- Static scan found no unsafe HTML sink, dynamic code execution, shell execution, or committed secret patterns.
- Export now rejects unresolved review and sanitizes generated filenames.
-`npm audit --omit=dev` reports two moderate PostCSS advisories transitively pulled by Next; automatic fix requires a breaking downgrade, so upgrade path remains a tracked dependency task.


## Session persistence
- Session data is stored only in browser localStorage under a versioned key.
- Snapshots expire after 60 minutes and malformed/expired snapshots are deleted.
- Snapshot size is capped at 4 MB; paste content is capped at 2 MB.
- Undo history is bounded to 30 document states and is not persisted.
- No source content is written to logs.

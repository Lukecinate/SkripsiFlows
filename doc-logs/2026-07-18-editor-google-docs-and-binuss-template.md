# Change Log

## 2026-07-18 - Editor Google Docs + BINUS Template + Auto/Editable ToC
- Category: refactor, export, ux, template

### Editor redesign ala Google Docs / Word web
- `components/workspace/StructurePanel.tsx` dirombak menjadi outline sidebar (Daftar Isi otomatis dari `buildOutline`). Checkbox select-all dan per-block dihilangkan.
- Multi-select dipindah ke mekanisme sorotan dokumen: pengguna menyorot teks pada dokumen preview (kolom 2) dan blok terkait masuk ke `selectedBlockIds`. Tombol `Hapus (N)` di header editor muncul saat ada blok tersorot.
- `Ctrl+A` di area preview menyorot semua blok.
- Klik pada blok tunggal mengatur `activeBlockId` (kursor) - tetap berfungsi seperti sebelumnya.
- Tab editor baru: `Dokumen` dan `Daftar Isi & Indeks`. Tab kedua menampilkan panel ToC editable.

### BINUS-compliant template
- `lib/template.ts` ditulis ulang menjadi template `binus-management-v1`: Times New Roman 12pt, spasi 1.5, margin kiri 4 cm, header parity ganjil/genap untuk body.
- Tiap role mendapat `spacing` (line/before/after/firstLine/hanging) sesuai Petunjuk Penulisan Skripsi BINUS Management 2021/2022.
- Daftar pustaka menggunakan hanging indent 0.5 cm.

### Parser Markdown kaya
- `lib/ingestion.ts`:
  - Heading level Markdown `#`, `##`, `###` dipetakan konsisten ke chapter/section/subchapter.
  - List multi-item (`- foo\n- bar\n- baz`) dijadikan satu block `list` dengan metadata `listType` bullet/ordered.
  - Tabel Markdown dengan alignment row `| --- |` dideteksi dan dirender dengan `<thead>`.
  - Inline parser menggunakan state machine tokenizer yang memperbaiki parsing `**bold**`, `*italic*`, `~~under~~`, dan backtick code.
  - Image Markdown `![alt](url "caption")` dan `![Gambar: ...]` dikenali sebagai block `image`.

### Auto ToC + Editable ToC
- `lib/toc.ts` (baru): `buildToc`, `getTocTitles`.
- `lib/renumber.ts` (baru): `renumberDocument`, `setTocTitle`, `setCaption`; numbering otomatis kontigu per bab dan di-reset pada batas bab.
- `components/workspace/TocPanel.tsx` (baru): tab Daftar Isi / Daftar Tabel / Daftar Gambar. Tiap entry editable; klik tombol `->` loncat ke blok terkait.
- `outline.buildFigureOutline()` paralel dengan table outline.

### DOCX overhaul
- `lib/export-docx.ts` ditulis ulang menjadi dua-section OOXML:
  - Section awal (cover + daftar isi + daftar tabel + daftar gambar) bernomor `lowerRoman`.
  - Body bernomor `decimal` restart di 1, dengan header parity ganjil/genap.
- Cover uppercase dengan metadata `documentMetadata`.
- BAB uppercase bold center, section bold left dengan prefix `N.M`, subchapter Title Case bold.
- Tabel: caption `Tabel N.M` di atas, border single, header row `tblHeader`.
- Gambar: caption `Gambar N.M` italic center di bawah placeholder.
- Daftar pustaka: heading `DAFTAR PUSTAKA` uppercase center + body hanging indent.
- Word settings mendukung update field (`TOC`, `PAGE`).

### PDF overhaul
- `lib/export-pdf.ts` mengikuti BINUS yang sama: cover, daftar isi statis dengan leader dots, daftar tabel, daftar gambar, body restart halaman latin. Margin 113pt kiri (4 cm), spasi 18pt (1.5), `pageMap` dihitung untuk akurasi ToC.

### UI / UX
- `app/globals.css` ditambahkan styling untuk outline, ToC, preview, selection highlight. Checkbox styles dihapus.
- Editor tabs ala Google Docs.

### Validasi
- 30 test pass: ingestion, outline, toc, renumber, citation, session, validation, export DOCX, export PDF.
- `npm run build` passing.
- Smoke test (`tools/smoke-export.ts`) menghasilkan DOCX 35 KB dan PDF 7 halaman dengan elemen BINUS lengkap.

### Files
- `app/workspace/page.tsx` (metadata injection)
- `app/workspace/editor/page.tsx` (rewrite)
- `components/workspace/StructurePanel.tsx` (rewrite as outline)
- `components/workspace/DocumentPreview.tsx` (rewrite with BINUS rendering + selection)
- `components/workspace/TocPanel.tsx` (new)
- `lib/ingestion.ts` (rewrite)
- `lib/outline.ts` (added buildFigureOutline, reset counters)
- `lib/toc.ts` (new)
- `lib/renumber.ts` (new)
- `lib/template.ts` (rewrite as BINUS)
- `lib/export-docx.ts` (rewrite)
- `lib/export-pdf.ts` (rewrite)
- `lib/document-model/index.ts` (added DocumentMetadata)
- `app/globals.css` (new rules)
- `tools/smoke-export.ts` (new)

## Version Bump
- Previous: `0.2.0-Prototype`
- New: `1.0.0-beta` (Major increment)
- Rationale: arsitektur editor bergeser dari checkbox multi-select ke selection ala Google Docs/Word web; generator DOCX/PDF BINUS-compliant dengan dua section (lowerRoman/decimal), header parity, daftar isi/tabel/gambar otomatis, editable ToC. Perubahan menyentuh major surface area (UI, parsing, generator) sehingga layak Major.

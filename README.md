# SkripsiFlow

> **Dari ide menjadi skripsi siap format.**

SkripsiFlow adalah workspace web untuk mahasiswa Indonesia yang ingin mengubah bahan mentah—Markdown, TXT, atau hasil copy-paste dari AI—menjadi dokumen skripsi yang lebih terstruktur dan siap diekspor ke Word.

<div align="center">

[Mulai di Workspace](#menjalankan-lokal) · [Fitur](#fitur-utama) · [Arsitektur](#arsitektur-singkat) · [Dokumentasi](#dokumentasi)

</div>

---

## Mengapa SkripsiFlow?

Bahan skripsi sering tersebar di catatan, hasil diskusi AI, file Markdown, dan halaman web. Tantangannya bukan hanya menulis, tetapi juga:

- Menata ulang BAB dan subbab.
- Memastikan struktur tidak hilang saat dipindahkan ke Word.
- Menyelaraskan sitasi dengan daftar pustaka.
- Menemukan bagian yang ambigu sebelum menjadi kesalahan format.
- Menghindari pekerjaan manual berulang pada dokumen panjang.

SkripsiFlow membantu mengurangi pekerjaan format tersebut tanpa mengubah isi akademik secara diam-diam. Bagian yang belum cukup yakin akan ditandai untuk ditinjau pengguna.

## Fitur Utama

### Input fleksibel

- Upload `.md`, `.markdown`, dan `.txt`.
- Drag-and-drop file langsung ke workspace.
- Paste hasil AI atau sumber lain.
- Normalisasi line ending dan BOM UTF-8.
- Validasi file kosong, extension, dan ukuran input.

### Struktur yang dapat diedit

- Deteksi `BAB I`, `BAB II`, dan heading subbab seperti `1.1`.
- Deteksi paragraph, list, quote, dan tabel sederhana.
- Confidence score pada setiap blok.
- Manual review untuk blok dengan confidence rendah.
- Edit isi blok secara langsung.
- Drag-and-drop untuk mengubah urutan blok struktural.

### Referensi dan sitasi

- Parsing referensi author-year dan numeric citation.
- Deteksi sitasi tanpa referensi.
- Deteksi referensi yang tidak pernah dikutip.
- Deteksi duplicate dan incomplete reference.
- Preview style:
  - APA 7.
  - IEEE.
  - Vancouver.
  - Harvard.
  - Chicago.

### Template dan export

- Semantic template registry.
- Template standar skripsi Indonesia.
- Mapping blok ke role seperti heading, paragraph, quote, table, dan reference.
- Export DOCX berbasis OOXML.
- Filename export disanitasi.
- Export diblokir jika masih ada unresolved review.

### Quality dan recovery

- Quality score dokumen.
- Manual review modal.
- Autosave lokal di browser.
- Recovery session otomatis.
- Session expired setelah 60 menit.
- Batas session 4 MB.
- Undo/redo dengan history maksimum 30 state.

## Menjalankan Lokal

### Prasyarat

- Node.js versi 20 atau lebih baru.
- npm versi yang kompatibel dengan Node.js.
- Git, jika ingin mengambil source dari repository.

### Clone repository

```bash
git clone https://github.com/Lukecinate/SkripsiFlows.git
cd SkripsiFlows
```

Jika repository sudah tersedia secara lokal:

```bash
git fetch origin
git pull --ff-only origin master
```

### Install dependency

```bash
npm install
```

### Konfigurasi environment opsional

Salin `.env.example` menjadi `.env.local` jika diperlukan:

```bash
cp .env.example .env.local
```

Pada Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Versi awal tidak membutuhkan API key atau database untuk menjalankan workspace.

### Jalankan development server

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

Workspace tersedia di:

```text
http://localhost:3000/workspace
```

## Perintah Development

```bash
npm run dev       # Menjalankan development server
npm test          # Menjalankan seluruh test TypeScript
npm run build     # Memvalidasi production build
npm start         # Menjalankan production server setelah build
npm audit --omit=dev # Memeriksa advisory dependency production
```

Sebelum push perubahan:

```bash
git fetch origin
git pull --ff-only origin master
npm test
npm run build
git diff --check
git push origin master
```

## Alur Penggunaan

1. Buka `/workspace`.
2. Upload file atau paste bahan skripsi.
3. Klik **Analisis bahan**.
4. Periksa blok yang ditandai sebagai perlu review.
5. Edit blok atau ubah urutannya dengan drag-and-drop.
6. Pilih gaya referensi.
7. Pastikan quality check tidak memiliki issue kritis.
8. Klik **Unduh DOCX**.

SkripsiFlow tidak mengarang metadata akademik. Jika referensi atau struktur tidak cukup jelas, pengguna harus meninjau dan mengonfirmasinya.

## Arsitektur Singkat

```text
Upload / Paste
      ↓
Ingestion & Normalization
      ↓
SkripsiDocument Model
      ↓
Citation Analysis + Validation
      ↓
Template Role Mapping
      ↓
DOCX OOXML Export
      ↓
Browser Download
```

Modul domain utama berada di `lib/`:

- `lib/ingestion.ts` — parsing input.
- `lib/citation.ts` — reference dan citation analysis.
- `lib/validation.ts` — quality score dan export gate.
- `lib/template.ts` — semantic template mapping.
- `lib/export-docx.ts` — generator DOCX.
- `lib/session.ts` — autosave, expiry, dan undo/redo.

## Keamanan dan Privasi

- Dokumen diproses sementara di browser pada versi saat ini.
- Session autosave tersimpan di `localStorage` dengan expiry.
- Isi dokumen tidak ditulis ke application logs.
- Input session diverifikasi schema-nya sebelum dipulihkan.
- Ukuran session dan paste dibatasi.
- Filename DOCX dibersihkan dari karakter unsafe.
- Text XML-escaped sebelum dimasukkan ke DOCX.
- Tidak menggunakan `dangerouslySetInnerHTML`, `eval`, atau dynamic code execution.
- Tidak ada akun atau server-side document persistence pada versi ini.

`npm audit --omit=dev` saat ini melaporkan dua moderate advisory PostCSS transitif dari Next. Fix otomatis membutuhkan perubahan framework breaking, sehingga tidak dijalankan secara paksa dan sudah dicatat di `docs/security-privacy.md` serta `doc-nexts/next-task.md`.

## Struktur Dokumentasi

Dokumentasi adalah bagian dari deliverable proyek:

```text
docs/
├── architecture.md
├── citation-system.md
├── document-model.md
├── product-overview.md
├── security-privacy.md
├── template-system.md
├── testing-quality.md
└── ux-flows.md

doc-logs/
├── 2026-07-15-initial-scaffold.md
└── 2026-07-15-complete-history.md

doc-nexts/
├── agent-context.md
├── current-state.md
├── decision-records.md
└── next-task.md
```

- `docs/` menjelaskan produk, arsitektur, security, UX, testing, dan domain.
- `doc-logs/` mencatat perubahan secara audit-able.
- `doc-nexts/` memberikan konteks decision-complete untuk agent berikutnya.

## Batasan Saat Ini

- Belum ada login atau cloud persistence.
- Belum ada export binary legacy `.doc`.
- Template kampus/prodi belum menjadi mapper penuh.
- Parsing Markdown masih konservatif dan belum mencakup seluruh AST kompleks.
- Gambar, nested structure, dan external metadata lookup belum menjadi fitur production-ready.
- Aplikasi membantu formatting dan validation, bukan menjamin kebenaran ilmiah atau bebas plagiarisme.

## Status Proyek

- Version: `0.1.0`.
- Branch utama: `master`.
- Test baseline: 12 passing tests.
- Production build: passing.
- Remote: `https://github.com/Lukecinate/SkripsiFlows.git`.

## Lisensi

Belum ditentukan. Tambahkan lisensi sebelum project dipublikasikan sebagai package atau menerima kontribusi eksternal.

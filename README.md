# SkripsiFlow

> **Dari ide menjadi skripsi siap format.**

SkripsiFlow adalah workspace web untuk mahasiswa Indonesia yang mengubah bahan mentah?Markdown, TXT, atau hasil copy-paste dari AI?menjadi dokumen skripsi yang lebih terstruktur dan siap diekspor ke Word.

---

## Mengapa SkripsiFlow?

Bahan skripsi sering tersebar di catatan, hasil diskusi AI, file Markdown, dan halaman web. Tantangannya bukan hanya menulis, tetapi juga menata ulang BAB dan subbab, memastikan struktur tidak hilang saat dipindahkan ke Word, serta menyelaraskan sitasi dengan daftar pustaka. SkripsiFlow membantu mengurangi pekerjaan format tersebut tanpa mengubah isi akademik secara diam-diam. Bagian yang belum cukup yakin akan ditandai untuk ditinjau pengguna.

## Fitur Utama

- **Input fleksibel** ? upload `.md`, `.markdown`, `.txt`, drag-and-drop, atau paste langsung.
- **Struktur dapat diedit** ? deteksi `BAB I`, `1.1`, paragraf, list, quote, dan tabel, lengkap dengan confidence score per blok.
- **Referensi dan sitasi** ? parsing reference author-year/numeric, deteksi sitasi tak terpakai, dengan preview APA 7, IEEE, Vancouver, Harvard, dan Chicago.
- **Template & export** ? export DOCX berbasis OOXML dengan filename yang disanitasi; export diblokir bila masih ada review yang belum selesai.
- **Quality & recovery** ? quality score dokumen, autosave lokal, recovery session otomatis, undo/redo hingga 30 state.

## Cara Menggunakan

1. Buka `/workspace`.
2. Upload file atau paste bahan skripsi, lalu klik **Analisis bahan**.
3. Periksa blok yang ditandai perlu review; edit atau ubah urutannya dengan drag-and-drop.
4. Pilih gaya referensi dan pastikan quality check tidak punya issue kritis.
5. Klik **Unduh DOCX**.

## Menjalankan Lokal

Prasyarat: Node.js 20+ dan npm.

```bash
git clone https://github.com/Lukecinate/SkripsiFlows.git
cd SkripsiFlows
npm install
npm run dev
```

Buka `http://localhost:3000`. Dokumentasi teknis (arsitektur, modul, keamanan) ada di folder `docs/`.

## Status & Lisensi

- Versi: `0.1.0`, branch utama: `master`.
- Belum ada login, cloud persistence, atau lisensi resmi.
- Aplikasi membantu formatting dan validasi, bukan menjamin kebenaran ilmiah.

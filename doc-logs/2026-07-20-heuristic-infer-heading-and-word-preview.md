# Change Log

## 2026-07-20 — Heuristic Heading Inference & Word-like Preview
- Category: parsing, ui, architecture

### heuristics heading infer
- `lib/ingestion.ts`: tambah fungsi `inferHeading()` untuk deteksi heading dari plain text tanpa Markdown.
- 6 aturan heuristic: BAB Romawi/digit, numbering 1.1/I.I, roman numeral, ALL CAPS, keyword skripsi (~30), short title-like line.
- Konstanta `HEADING_KEYWORDS` (Set) + `ROMAN_RE` regex.
- `parseBlocks()` panggil `inferHeading` sebagai fallback setelah `detectHeading` gagal.

### Word-like Document Preview (panel kanan)
- `DocumentPreview.tsx`: rewrite total, hapus @tanstack/react-virtual + absolute positioning.
- Render continuous flow tanpa virtualizer, tanpa block borders/highlight.
- Chapter: center bold uppercase. Section: bold left + heading number hijau. Paragraph: justify + text-indent 1.27cm.
- List/quote/table/image dengan styling template. Click-to-edit tanpa visual block wrapper.

### Daftar Isi integrated (panel kiri)
- `StructurePanel.tsx`: tambah tabs Daftar Isi / Tabel / Gambar dari buildToc/buildTableOutline/buildFigureOutline.
- Heading entries tetap support drag & drop. Quick edit tetap di bawah.

### EditorPage cleanup
- Hapus tab navigasi, hapus type View/view state/toc section.
- Hapus import TocPanel.

### Dependency
- package.json: hapus @tanstack/react-virtual.

### Design context
- Kiri: navigasi block-based + Daftar Isi. Kanan: WYSIWYG Word-like document, kontinu, click-to-edit.

## Files Modified
- lib/ingestion.ts, components/workspace/DocumentPreview.tsx, components/workspace/StructurePanel.tsx, app/workspace/editor/EditorPage.tsx, package.json, doc-nexts/current-state.md, doc-nexts/next-task.md

## Verification
- Build compiled (2 pre-existing errors: checkRateLimit, config export).
- Panel kanan: continuous, no overlap, no block UI.
- Panel kiri: tabs Heading/Tabel/Gambar berfungsi.
- Heading inference: BAB I, 1.1, Latar Belakang, ALL CAPS terdeteksi sebagai heading.

### Round 2 Fixes
- Fix table rendering: proper `<thead>/<tbody>`, skip alignment row (`|---|---|`), inline markdown di cell.
- Fix italic conversion: parseInline fallback ke parseInlineMarkdown untuk konten tanpa metadata inline.
- Fix canvas cutoff: hapus `max-height` dari `.document-preview` CSS.
- Fix word-like click-to-edit: textarea tanpa border/outline, transparent background.
- Hapus Quality Check dari footer EditorPage.
- Hierarchical drag & drop: reordering heading memindahkan child blocks (paragraphs, lists) bersamanya.

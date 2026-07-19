import { exportDocx } from "../lib/export-docx";
import { exportPdf } from "../lib/export-pdf";
import { renumberDocument } from "../lib/renumber";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import type { SkripsiDocument } from "../lib/document-model";
import { writeFileSync } from "node:fs";

const sample: SkripsiDocument = {
  schemaVersion: 1,
  id: "smoke",
  title: "Analisis Pengaruh UI Terhadap Loyalitas Pengguna",
  templateId: "binus-management-v1",
  citationStyle: "apa-7",
  documentMetadata: {
    authors: ["Andi Setiawan", "Budi Santoso"],
    nim: ["1901234567", "1901234568"],
    institution: "Universitas Bina Nusantara",
    program: "Management Program",
    studyProgram: "Management Study Program",
    faculty: "BINUS Business School Undergraduate Program",
    city: "Jakarta",
    year: 2026,
    englishTitle: "Analysis of UI Influence on User Loyalty",
  },
  blocks: [
    { id: "c1", type: "chapter", content: "Pendahuluan", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "s1", type: "section", content: "Latar Belakang", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "ss1", type: "subchapter", content: "Fenomena Penelitian", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "p1", type: "paragraph", content: "Penelitian ini membahas pengaruh UI terhadap loyalitas.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "l1", type: "list", content: "- SUS skor minimal 77\n- UEQ respons positif\n- Adjective rating positif", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { listType: "bullet" } },
    { id: "q1", type: "quote", content: "Desain UI menentukan retensi pengguna.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "t1", type: "table", content: "| Aplikasi | SUS | UEQ |\n| - | - | - |\n| Caring Colours | 85 | 1.8 |\n| SH-UPI | 89 | 2.0 |", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "i1", type: "image", content: "ui-mockup.png", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false, metadata: { caption: "Mockup UI aplikasi Caring Colours" } },
    { id: "c2", type: "chapter", content: "Tinjauan Pustaka", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "p2", type: "paragraph", content: "Penelitian terdahulu digunakan sebagai acuan.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
    { id: "r1", type: "reference", content: "Andi, A. (2024). Buku referensi.\nBudi, B. (2023). Sumber lain.", confidence: 1, confidenceLevel: "high", source: "manual", needsReview: false },
  ],
  references: [],
  reviewRequired: false,
  createdAt: "",
  updatedAt: "",
};

(async () => {
  const renumbered = renumberDocument(sample);
  const docx = await exportDocx(renumbered, "smoke.docx");
  writeFileSync("smoke.docx", Buffer.from(docx.data));
  console.log("DOCX:", docx.filename, docx.data.byteLength, "bytes");
  const zip = await JSZip.loadAsync(docx.data);
  const doc = await zip.file("word/document.xml")?.async("string");
  console.log("Has BAB 1:", doc?.includes("BAB 1"));
  console.log("Has DAFTAR ISI:", doc?.includes("DAFTAR ISI"));
  console.log("Has DAFTAR TABEL:", doc?.includes("DAFTAR TABEL"));
  console.log("Has DAFTAR GAMBAR:", doc?.includes("DAFTAR GAMBAR"));
  console.log("Has DAFTAR PUSTAKA:", doc?.includes("DAFTAR PUSTAKA"));
  console.log("Has Tabel 1:", doc?.includes("Tabel 1"));
  console.log("Has Gambar 1:", doc?.includes("Gambar 1"));
  console.log("Has Laporan Skripsi:", doc?.includes("LAPORAN SKRIPSI"));
  console.log("Has Universitas Bina Nusantara:", doc?.includes("Universitas Bina Nusantara"));
  console.log("Has 1.5 line spacing:", doc?.includes('w:line="360"'));
  console.log("Has 4cm left margin:", doc?.includes('w:left="2268"'));
  console.log("Has lowerRoman numbering:", doc?.includes('w:fmt="lowerRoman"'));
  console.log("Has decimal numbering:", doc?.includes('w:fmt="decimal"'));
  const pdf = await exportPdf(renumbered, "smoke.pdf");
  writeFileSync("smoke.pdf", Buffer.from(pdf.data));
  console.log("PDF:", pdf.filename, pdf.data.byteLength, "bytes");
  const pdfDoc = await PDFDocument.load(pdf.data);
  console.log("PDF pages:", pdfDoc.getPageCount());
})();



/**
 * BINUS Management Template Fixture
 * 
 * Regression fixture for BINUS Management 2021/2022 template.
 * Locks current template as baseline for regression testing.
 * 
 * @module template/fixtures/binus-management-v1.fixture
 */

import type { SkripsiDocument, DocumentMetadata, DocumentBlock } from "../../document-model";
import type { TemplateAdapter } from "../adapter";
import type { ValidationIssue } from "../adapter";

/** BINUS Management template adapter */
export const binusManagementAdapter: TemplateAdapter = {
  id: "binus-management-v1",
  name: "BINUS Management 2021/2022",
  
  resolveStyle: (block, baseStyle) => {
    // BINUS-specific overrides
    if (block.type === "chapter") {
      return { ...baseStyle, upperCase: true };
    }
    if (block.type === "table" || block.type === "image") {
      return { ...baseStyle, alignment: "center" };
    }
    return baseStyle;
  },
  
  coverMetadata: (meta: DocumentMetadata) => ({
    title: meta.englishTitle ?? "JUDUL SKRIPSI",
    subtitle: "LAPORAN SKRIPSI",
    institution: meta.institution ?? "Universitas Bina Nusantara",
    faculty: meta.faculty ?? "School of Computer Science",
    program: meta.program ?? "Management",
    campus: meta.campus ?? "BINUS University",
    city: meta.city ?? "Jakarta",
    year: meta.year ?? new Date().getFullYear(),
    authors: meta.authors ?? [],
    nim: meta.nim,
    supervisors: meta.supervisor,
    logoLabel: meta.logoLabel,
  }),
  
  validate: (doc) => {
    const issues: ValidationIssue[] = [];
    
    // BINUS requires specific metadata
    if (!doc.documentMetadata?.institution?.includes("Bina Nusantara")) {
      issues.push({
        code: "BINUS_INSTITUTION_MISSING",
        message: "Institution must include 'Bina Nusantara' for BINUS template",
        severity: "error",
      });
    }
    
    if (!doc.documentMetadata?.city) {
      issues.push({
        code: "BINUS_CITY_MISSING",
        message: "City is required for BINUS template",
        severity: "error",
      });
    }
    
    if (!doc.documentMetadata?.year) {
      issues.push({
        code: "BINUS_YEAR_MISSING",
        message: "Year is required for BINUS template",
        severity: "error",
      });
    }
    
    if (!doc.documentMetadata?.institution) {
      issues.push({
        code: "BINUS_METADATA_INCOMPLETE",
        message: "Institution metadata is required",
        severity: "warning",
      });
    }
    
    return issues;
  },
  
  numberingOverrides: {
    front: "lowerRoman",
    body: "decimal",
  },
  
  pageMargins: {
    top: 1418,    // 2.5cm
    right: 1418,  // 2.5cm
    bottom: 1418, // 2.5cm
    left: 2268,   // 4cm (BINUS requirement)
    header: 720,
    footer: 720,
    gutter: 0,
  },
};

/** Fixture document for BINUS template regression testing */
export const binusFixtureDocument: SkripsiDocument = {
  schemaVersion: 1,
  id: "binus-fixture-001",
  title: "Analisis Pengaruh User Experience terhadap Kepuasan Pengguna Aplikasi Mobile",
  templateId: "binus-management-v1",
  citationStyle: "apa-7",
  documentMetadata: {
    institution: "Universitas Bina Nusantara",
    faculty: "School of Computer Science",
    program: "Management",
    campus: "BINUS University",
    city: "Jakarta",
    year: 2026,
    authors: ["Mahasiswa Contoh"],
    nim: ["2401234567"],
    supervisor: ["Dr. Dosen Pembimbing"],
  } as DocumentMetadata,
  blocks: [
    {
      id: "b1",
      type: "chapter",
      content: "PENDAHULUAN",
      confidence: 1,
      confidenceLevel: "high",
      source: "manual",
      needsReview: false,
      metadata: { headingNumber: "BAB 1", tocTitle: "PENDAHULUAN" },
    },
    {
      id: "b2",
      type: "section",
      content: "Latar Belakang",
      confidence: 1,
      confidenceLevel: "high",
      source: "manual",
      needsReview: false,
      metadata: { headingNumber: "1.1" },
    },
    {
      id: "b3",
      type: "paragraph",
      content: "Penelitian ini bertujuan untuk menganalisis pengaruh user experience terhadap kepuasan pengguna aplikasi mobile.",
      confidence: 1,
      confidenceLevel: "high",
      source: "manual",
      needsReview: false,
    },
    {
      id: "b4",
      type: "table",
      content: "| Variabel | Mean | Std Dev |\n| - | - | - |\n| UX | 4.2 | 0.5 |\n| Kepuasan | 4.0 | 0.6 |",
      confidence: 1,
      confidenceLevel: "high",
      source: "manual",
      needsReview: false,
      metadata: { tableNumber: "1", tocTitle: "Statistik Deskriptif Variabel" },
    },
    {
      id: "b5",
      type: "image",
      content: "ux-model.png",
      confidence: 1,
      confidenceLevel: "high",
      source: "manual",
      needsReview: false,
      metadata: { figureNumber: "1", caption: "Model Penelitian UX" },
    },
    {
      id: "b6",
      type: "reference",
      content: "Nielsen, J. (1994). Usability Engineering. Morgan Kaufmann.\nISO 9241-210:2019. Ergonomics of human-system interaction.",
      confidence: 1,
      confidenceLevel: "high",
      source: "manual",
      needsReview: false,
    },
  ],
  references: [],
  reviewRequired: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** Expected export validation for fixture */
export const binusFixtureExpectations = {
  requiredParts: [
    "[Content_Types].xml",
    "word/document.xml",
    "word/styles.xml",
    "word/numbering.xml",
    "word/settings.xml",
    "word/fontTable.xml",
    "word/footer_front.xml",
    "word/footer_body.xml",
    "docProps/core.xml",
    "docProps/app.xml",
  ],
  semanticStyles: [
    "chapterNumber", "chapterTitle", "section", "subchapter",
    "paragraph", "table", "tableTitle", "figureTitle",
    "reference", "tocEntry", "cover", "tocTitle",
  ],
  pageSetup: {
    leftMargin: 2268,  // 4cm
    lineSpacing: 360,  // 1.5
  },
  numbering: {
    lowerRoman: true,
    decimal: true,
  },
  coverMustContain: [
    "UNIVERSITAS BINA NUSANTARA",
    "LAPORAN SKRIPSI",
    "ANALISIS PENGARUH USER EXPERIENCE",
    "JAKARTA",
    "2026",
  ],
  frontMatterMustContain: [
    "DAFTAR ISI",
    "DAFTAR TABEL",
    "DAFTAR GAMBAR",
  ],
  bodyMustContain: [
    "BAB 1",
    "PENDAHULUAN",
    "LATAR BELAKANG",
    "TABEL 1",
    "GAMBAR 1",
    "DAFTAR PUSTAKA",
  ],
};

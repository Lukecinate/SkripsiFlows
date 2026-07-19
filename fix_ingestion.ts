import * as fs from 'fs';
let content = fs.readFileSync('lib/ingestion.ts', 'utf8');

// 1. Add HEADING_KEYWORDS, ROMAN_RE, inferHeading after detectHeading function
const insertMarker =   return { type: "subchapter", content, hashLevel };
}

function;
const newFuncs =   return { type: "subchapter", content, hashLevel };
}

/** Heading keywords for Indonesian academic documents */
const HEADING_KEYWORDS = new Set([
  "latar belakang", "rumusan masalah", "identifikasi masalah", "batasan masalah",
  "tujuan penelitian", "manfaat penelitian", "tinjauan pustaka", "landasan teori",
  "kerangka berpikir", "hipotesis", "metode penelitian", "jenis penelitian",
  "populasi dan sampel", "teknik pengumpulan data", "instrumen penelitian",
  "teknik analisis data", "hasil penelitian", "pembahasan", "hasil dan pembahasan",
  "kesimpulan", "saran", "daftar pustaka", "lampiran", "surat pernyataan",
  "kata pengantar", "abstrak", "daftar isi", "daftar tabel", "daftar gambar",
  "bab i", "bab ii", "bab iii", "bab iv", "bab v", "bab vi",
  "pendahuluan", "kajian pustaka", "metodologi penelitian", "analisis data",
  "penutup", "bibliografi", "riwayat hidup",
]);

/** Match roman numeral pattern */
const ROMAN_RE = /^[ivxlcdm]+\$/i;

/**
 * Infer heading structure from plain text (no Markdown syntax).
 * Uses heuristic / pattern matching.
 */
function inferHeading(line: string, lineIndex: number, context: { inChapter: boolean }): { type: "chapter" | "section" | "subchapter"; content: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // 1. Detect "BAB [Romawi]" or "BAB [digit]"
  const babMatch = trimmed.match(/^bab\\s+([ivxlcdm\\d]+)[\\.:]?\\s+(.+)/i);
  if (babMatch) {
    return { type: "chapter", content: babMatch[2].trim() };
  }
  const babOnly = trimmed.match(/^bab\\s+([ivxlcdm]+)[\\.:]?\$/i);
  if (babOnly) {
    return { type: "chapter", content: "BAB " + babOnly[1].toUpperCase() };
  }

  // 2. Numbering patterns: 1.1, I.I, 1.1.1, I.I.I
  const twoLevel = trimmed.match(/^(\\d+)\\.(\\d+)\\s+(.+)/);
  if (twoLevel) {
    return { type: "section", content: twoLevel[3].trim() };
  }
  const romanTwo = trimmed.match(/^([ivxlcdm]+)\\.([ivxlcdm]+)\\s+(.+)/i);
  if (romanTwo) {
    return { type: "section", content: romanTwo[3].trim() };
  }
  const threeLevel = trimmed.match(/^(\\d+)\\.(\\d+)\\.(\\d+)\\s+(.+)/);
  if (threeLevel) {
    return { type: "subchapter", content: threeLevel[4].trim() };
  }
  const romanThree = trimmed.match(/^([ivxlcdm]+)\\.([ivxlcdm]+)\\.([ivxlcdm]+)\\s+(.+)/i);
  if (romanThree) {
    return { type: "subchapter", content: romanThree[4].trim() };
  }

  // 3. Single roman numeral (I, II, III) followed by text
  const romanNumeral = trimmed.match(/^([ivxlcdm]+)[\\.\\:\\)]\\s+(.+)\$/i);
  if (romanNumeral && ROMAN_RE.test(romanNumeral[1])) {
    return { type: context.inChapter ? "section" : "chapter", content: romanNumeral[2].trim() };
  }

  // 4. ALL CAPS line (no lowercase letters)
  const hasUpper = /[A-Z]/.test(trimmed);
  const hasLower = /[a-z]/.test(trimmed);
  if (hasUpper && !hasLower && trimmed.length > 3 && trimmed.length < 100 && !trimmed.endsWith(".") && !trimmed.endsWith(":")) {
    const words = trimmed.split(/\\s+/);
    if (words.length >= 2 || trimmed.length > 10) {
      return { type: context.inChapter ? "section" : "chapter", content: trimmed };
    }
  }

  // 5. Known heading keywords (case-insensitive)
  const lower = trimmed.toLowerCase().replace(/[\\.\\:\\;]+\$/, "");
  if (HEADING_KEYWORDS.has(lower)) {
    return { type: context.inChapter ? "section" : "chapter", content: trimmed };
  }

  // 6. Short line without period, looks like title (2-5 words, 10-70 chars)
  if (trimmed.length > 10 && trimmed.length < 70 && !trimmed.endsWith(".") && !trimmed.endsWith(":") && !trimmed.endsWith(";")) {
    const words = trimmed.split(/\\s+/);
    if (words.length <= 5 && words.length >= 2) {
      return { type: context.inChapter ? "section" : "chapter", content: trimmed };
    }
  }

  return null;
}

function;

content = content.replace(insertMarker, newFuncs);

// 2. Add inferHeading fallback in parseBlocks after detectHeading block
const parseMarker =       continue;
    }
    if (isTableRow(line)) {;

const inferFallback =       continue;
    }
    // Fallback: infer heading from plain text patterns
    const inferred = inferHeading(line, cursor + 1, { inChapter: blocks.some((b) => b.type === "chapter") });
    if (inferred) {
      flushParagraph();
      flushList();
      flushTable();
      const blocksWithChapter = blocks.filter((b) => b.type === "chapter");
      const blockType = inferred.type === "chapter" ? "chapter" as const
        : blocksWithChapter.length > 0 && (blocksWithChapter.length > 1 || blocks.length > blocksWithChapter.length) ? "section" as const
        : inferred.type === "subchapter" ? "subchapter" as const
        : "section" as const;
      blocks.push(createBlock(blockType, inferred.content, input.kind, index++, cursor + 1, { headingHash: "0", inferred: "true" }, parseInlineMarkdown(inferred.content)));
      continue;
    }
    if (isTableRow(line)) {;

content = content.replace(parseMarker, inferFallback);

fs.writeFileSync('lib/ingestion.ts', content, 'utf8');
console.log('Done. inferHeading:', content.includes('function inferHeading('));
console.log('Length:', content.length);

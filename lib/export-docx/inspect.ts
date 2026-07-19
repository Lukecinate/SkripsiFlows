/**
 * DOCX Fixture Inspection
 * 
 * Validates exported DOCX contains all required OOXML parts, semantic styles,
 * page setup, and numbering formats per BINUS template spec.
 * 
 * @module export-docx/inspect
 */

import JSZip from "jszip";

export interface InspectionResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    requiredParts: Record<string, boolean>;
    semanticStyles: Record<string, boolean>;
    pageSetup: { leftMargin: boolean; lineSpacing: boolean };
    numbering: { lowerRoman: boolean; decimal: boolean };
  };
}

/**
 * Inspect a DOCX export result for compliance
 */
export async function inspectDocx(result: { data: ArrayBuffer }): Promise<InspectionResult> {
  const zip = await JSZip.loadAsync(result.data);
  const docXml = await zip.file("word/document.xml")?.async("string") ?? "";
  const stylesXml = await zip.file("word/styles.xml")?.async("string") ?? "";
  const numberingXml = await zip.file("word/numbering.xml")?.async("string") ?? "";
  const footerFront = await zip.file("word/footer_front.xml")?.async("string") ?? "";
  const footerBody = await zip.file("word/footer_body.xml")?.async("string") ?? "";

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required OOXML parts
  const requiredParts = [
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
  ];

  const requiredPartsResult: Record<string, boolean> = {};
  for (const part of requiredParts) {
    requiredPartsResult[part] = !!zip.file(part);
    if (!requiredPartsResult[part]) {
      errors.push(`Missing required part: ${part}`);
    }
  }

  // Check semantic styles in document.xml
  const semanticStyles = [
    "chapterNumber", "chapterTitle", "section", "subchapter",
    "paragraph", "table", "tableTitle", "figureTitle",
    "reference", "tocEntry", "cover", "tocTitle",
  ];

  const semanticStylesResult: Record<string, boolean> = {};
  for (const style of semanticStyles) {
    // Check if style is used in document.xml (pStyle references)
    const used = docXml.includes(`w:pStyle w:val="${style}"`);
    // Check if style is defined in styles.xml
    const defined = stylesXml.includes(`w:styleId="${style}"`);
    semanticStylesResult[style] = used && defined;
    if (!used && defined) {
      warnings.push(`Semantic style defined but not used in document: ${style}`);
    } else if (used && !defined) {
      warnings.push(`Semantic style used but not defined in styles.xml: ${style}`);
    }
  }

  // Check page setup in document.xml (section properties)
  const leftMargin = docXml.includes('w:left="2268"');
  const lineSpacing = docXml.includes('w:line="360"');

  if (!leftMargin) errors.push('Page setup missing BINUS left margin 4cm (w:left="2268")');
  if (!lineSpacing) errors.push('Page setup missing 1.5 line spacing (w:line="360")');

  // Check numbering formats in numbering.xml
  // The numbering.xml uses abstractNum with numFmt - check for both formats
  const lowerRoman = numberingXml.includes('<w:numFmt w:val="lowerRoman"/>') || 
                     numberingXml.includes('w:fmt="lowerRoman"');
  const decimal = numberingXml.includes('<w:numFmt w:val="decimal"/>') || 
                  numberingXml.includes('w:fmt="decimal"');

  if (!lowerRoman) errors.push('Numbering missing lowerRoman format for front matter');
  if (!decimal) errors.push('Numbering missing decimal format for body');

  // Check footers
  if (!footerFront.includes("LOWER ROMAN")) warnings.push("Front footer missing LOWER ROMAN page number");
  if (!footerBody.includes("ARABIC")) warnings.push("Body footer missing ARABIC page number");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    details: {
      requiredParts: requiredPartsResult,
      semanticStyles: semanticStylesResult,
      pageSetup: { leftMargin, lineSpacing },
      numbering: { lowerRoman, decimal },
    },
  };
}

export function printInspectionReport(result: InspectionResult): void {
  console.log("=".repeat(60));
  console.log("DOCX INSPECTION REPORT");
  console.log("=".repeat(60));
  console.log(`Valid: ${result.valid ? "? PASS" : "? FAIL"}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);
  console.log();

  if (result.errors.length > 0) {
    console.log("ERRORS:");
    for (const e of result.errors) console.log(`  ? ${e}`);
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log("WARNINGS:");
    for (const w of result.warnings) console.log(`  ?? ${w}`);
    console.log();
  }

  console.log("DETAILS:");
  console.log("  Required Parts:");
  for (const [part, ok] of Object.entries(result.details.requiredParts)) {
    console.log(`    ${ok ? "?" : "?"} ${part}`);
  }
  console.log("  Semantic Styles:");
  for (const [style, ok] of Object.entries(result.details.semanticStyles)) {
    console.log(`    ${ok ? "?" : "??"} ${style}`);
  }
  console.log("  Page Setup:");
  console.log(`    ${result.details.pageSetup.leftMargin ? "?" : "?"} Left margin 4cm (2268 twips)`);
  console.log(`    ${result.details.pageSetup.lineSpacing ? "?" : "?"} Line spacing 1.5 (360 twips)`);
  console.log("  Numbering:");
  console.log(`    ${result.details.numbering.lowerRoman ? "?" : "?"} lowerRoman (front matter)`);
  console.log(`    ${result.details.numbering.decimal ? "?" : "?"} decimal (body)`);
}

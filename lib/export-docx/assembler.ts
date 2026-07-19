/**
 * DOCX Assembler - DEPRECATED: Use lib/export-docx.ts instead
 * This file is kept for reference but not used.
 * 
 * @module export-docx/assembler
 */

export interface ExportResult {
  filename: string;
  mimeType: string;
  data: ArrayBuffer;
}

export async function assembleDocx(document: any, filename: string): Promise<ExportResult> {
  throw new Error("Use lib/export-docx.ts instead");
}

export async function exportDocx(document: any, filename: string): Promise<ExportResult> {
  throw new Error("Use lib/export-docx.ts instead");
}

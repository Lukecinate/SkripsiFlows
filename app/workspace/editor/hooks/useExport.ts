"use client";

import { useCallback } from "react";
import type { SkripsiDocument } from "../../../../lib/document-model";

const SERVER_EXPORT_THRESHOLD = 200;

export interface UseExportReturn {
  exportDocx: (document: SkripsiDocument, filename: string) => Promise<Blob>;
  exportPdf: (document: SkripsiDocument, filename: string) => Promise<Blob>;
}

async function serverExport(document: SkripsiDocument, format: "docx" | "pdf", filename: string): Promise<Blob> {
  const res = await fetch(`/api/export/${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...document, filename }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Export failed" }));
    throw new Error(err.error ?? `Server export failed: ${res.status}`);
  }

  return res.blob();
}

export function useExport(): UseExportReturn {
  const exportDocx = useCallback(async (document: SkripsiDocument, filename: string): Promise<Blob> => {
    return serverExport(document, "docx", filename);
  }, []);

  const exportPdf = useCallback(async (document: SkripsiDocument, filename: string): Promise<Blob> => {
    return serverExport(document, "pdf", filename);
  }, []);

  return { exportDocx, exportPdf };
}

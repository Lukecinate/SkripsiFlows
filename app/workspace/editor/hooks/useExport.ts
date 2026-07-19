"use client";

import { useCallback } from "react";
import { createExportWorkerProxy } from "../../../../lib/worker-utils";
import type { SkripsiDocument } from "../../../../lib/document-model";
import type { ExportFormat } from "../../../../components/workspace/FormatPicker";

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

async function workerExport(document: SkripsiDocument, format: "docx" | "pdf", filename: string): Promise<Blob> {
  const worker = createExportWorkerProxy(new URL(`../../../../lib/workers/export-${format}.worker.ts`, import.meta.url));
  try {
    const result = await worker.call(`export${format === "docx" ? "Docx" : "Pdf"}`, document, filename);
    worker.terminate();
    return new Blob([result.data], { type: result.mimeType });
  } catch {
    worker.terminate();
    throw new Error(`Worker export ${format.toUpperCase()} failed`);
  }
}

export function useExport(): UseExportReturn {
  const exportDocx = useCallback(async (document: SkripsiDocument, filename: string): Promise<Blob> => {
    if (document.blocks.length > SERVER_EXPORT_THRESHOLD) {
      try {
        return await serverExport(document, "docx", filename);
      } catch {
        // Fall back to worker
      }
    }
    return workerExport(document, "docx", filename);
  }, []);

  const exportPdf = useCallback(async (document: SkripsiDocument, filename: string): Promise<Blob> => {
    if (document.blocks.length > SERVER_EXPORT_THRESHOLD) {
      try {
        return await serverExport(document, "pdf", filename);
      } catch {
        // Fall back to worker
      }
    }
    return workerExport(document, "pdf", filename);
  }, []);

  return { exportDocx, exportPdf };
}

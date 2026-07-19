/**
 * PDF Export Web Worker
 * 
 * Runs PDF generation in background thread.
 * Does not block UI thread.
 * 
 * @module export-pdf.worker
 */

import { exportPdf } from "../export-pdf";
import type { SkripsiDocument } from "../document-model";
import { createWorkerHandler } from "../worker-utils";

createWorkerHandler({
  exportPdf: (args: unknown) => {
    const [document, filename] = args as [SkripsiDocument, string];
    return exportPdf(document, filename);
  },
});

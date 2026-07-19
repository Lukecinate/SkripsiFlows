/**
 * DOCX Export Web Worker
 * 
 * Runs DOCX generation in background thread.
 * Does not block UI thread.
 * 
 * @module export-docx.worker
 */

import { exportDocx } from "../export-docx";
import type { SkripsiDocument } from "../document-model";
import { createWorkerHandler } from "../worker-utils";

createWorkerHandler({
  exportDocx: (args: unknown) => {
    const [document, filename] = args as [SkripsiDocument, string];
    return exportDocx(document, filename);
  },
});

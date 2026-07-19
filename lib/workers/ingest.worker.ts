/**
 * Ingestion Web Worker
 * 
 * Menjalankan parsing markdown dan renumbering di background thread.
 * Tidak memblokir UI thread.
 * 
 * @module ingest.worker
 */

import { ingestSource } from "../ingestion";
import { renumberDocument } from "../renumber";
import type { SourceInput, IngestionResult } from "../ingestion";
import { createWorkerHandler } from "../worker-utils";

createWorkerHandler({
  ingest: (args: unknown): IngestionResult => {
    const input = args as SourceInput;
    const result = ingestSource(input);
    if (result.document) {
      result.document = renumberDocument(result.document);
    }
    return result;
  },
});

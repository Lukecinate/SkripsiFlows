/**
 * Worker Communication Utility
 * 
 * Promise-based wrapper for Web Worker postMessage.
 * Handles request/response pattern with unique IDs.
 * 
 * @module worker-utils
 */

/** Generate unique request ID */
let nextId = 0;
function generateId(): number {
  return ++nextId;
}

/** Map request ID to pending promise */
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason: unknown) => void }>();

/** Event handler for worker response */
function handleWorkerMessage(event: MessageEvent) {
  const { id, result, error } = event.data;
  const promise = pending.get(id);
  if (!promise) return;
  pending.delete(id);
  if (error) promise.reject(new Error(error));
  else promise.resolve(result);
}

/**
 * Create a promise-based worker proxy.
 * 
 * @param workerUrl - URL to worker file
 * @returns Object with methods that can be called like async functions
 */
export function createWorkerProxy<T extends Record<string, (...args: any[]) => any>>(
  workerUrl: URL | string
): { call: <K extends keyof T>(method: K, ...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>; terminate: () => void } {
  const worker = new Worker(workerUrl, { type: "module" });
  worker.addEventListener("message", handleWorkerMessage);

  return {
    call(method, ...args) {
      return new Promise((resolve, reject) => {
        const id = generateId();
        pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
        worker.postMessage({ id, method, args });
      });
    },
    terminate() {
      worker.removeEventListener("message", handleWorkerMessage);
      worker.terminate();
      // Reject all pending requests
      for (const [, promise] of pending) {
        promise.reject(new Error("Worker terminated"));
      }
      pending.clear();
    },
  };
}

/**
 * Helper for creating worker handler.
 * Called inside worker file.
 */
export function createWorkerHandler(handlers: Record<string, (...args: unknown[]) => unknown>) {
  self.addEventListener("message", (event) => {
    const { id, method, args } = event.data;
    try {
      const handler = handlers[method];
      if (!handler) throw new Error(`Unknown method: ${String(method)}`);
      const result = handler(...args);
      // Handle promise results
      if (result instanceof Promise) {
        result
          .then((resolved) => {
            const transfer = resolved && typeof resolved === "object" && "data" in resolved && resolved.data instanceof ArrayBuffer
              ? [resolved.data as ArrayBuffer]
              : [];
            (self.postMessage as (message: unknown, transfer: Transferable[]) => void)({ id, result: resolved }, transfer);
          })
          .catch((err) => self.postMessage({ id, error: String(err) }));
      } else {
        const transfer = result && typeof result === "object" && "data" in result && result.data instanceof ArrayBuffer
          ? [result.data as ArrayBuffer]
          : [];
        (self.postMessage as (message: unknown, transfer: Transferable[]) => void)({ id, result }, transfer);
      }
    } catch (err) {
      self.postMessage({ id, error: String(err) });
    }
  });
}

export type ExportResult = {
  filename: string;
  mimeType: string;
  data: ArrayBuffer;
};

export interface ExportWorkerMethods {
  exportPdf: (document: any, filename: string) => Promise<ExportResult>;
  exportDocx: (document: any, filename: string) => Promise<ExportResult>;
}

export type ExportWorkerProxy = { call: <K extends keyof ExportWorkerMethods>(method: K, ...args: Parameters<ExportWorkerMethods[K]>) => Promise<ReturnType<ExportWorkerMethods[K]>>; terminate: () => void };

export function createExportWorkerProxy(url: URL | string): ExportWorkerProxy {
  return createWorkerProxy(url) as ExportWorkerProxy;
}

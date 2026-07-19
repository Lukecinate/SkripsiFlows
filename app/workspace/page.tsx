"use client";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ingestSource } from "../../lib/ingestion";
import type { SkripsiDocument } from "../../lib/document-model";
import {
  createSnapshot, serializeSnapshot, SESSION_KEY,
} from "../../lib/session";

const steps = [
  { id: "01", label: "Upload atau paste", detail: "Markdown, TXT, atau teks dari AI" },
  { id: "02", label: "Review struktur", detail: "Bab, subbab, paragraf, sitasi" },
  { id: "03", label: "Unduh dokumen", detail: "Format PDF atau DOCX siap pakai" },
];

type Stage = "idle" | "reading" | "parsing" | "redirecting";

const FILE_EXT = [".md", ".markdown", ".txt"];
const MAX_BYTES = 2_000_000;

const stageLabel: Record<Stage, string> = {
  idle: "",
  reading: "Membaca file",
  parsing: "Mengenali struktur",
  redirecting: "Membuka editor",
};

export default function WorkspacePage() {
  const router = useRouter();
  const [paste, setPaste] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);
  const rafRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingIdRef = useRef(0);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../lib/workers/ingest.worker.ts", import.meta.url),
      { type: "module" }
    );
    return () => { workerRef.current?.terminate(); workerRef.current = null; };
  }, []);

  const finishProgress = (next: Stage) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const duration = 220;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(80 + t * 20);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setStage(next);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const animateProgress = (target: number, duration = 250) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(from + (target - from) * t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const persist = (content: string, kind: "paste" | "markdown" | "plain-text", name?: string, extension?: string) => {
    setStage("parsing");
    animateProgress(60);

    const worker = workerRef.current;
    const requestId = ++pendingIdRef.current;

    if (worker) {
      const handler = (event: MessageEvent) => {
        if (event.data.id !== requestId) return;
        worker.removeEventListener("message", handler);
        try {
          const result = event.data.result ?? event.data.error;
          if (event.data.error || !result?.document) {
            const issues = result?.issues ?? [{ message: "Gagal memproses bahan." }];
            setMessage(issues.map((i: { message: string }) => i.message).join(" "));
            setStage("idle");
            setProgress(0);
            return;
          }
          const doc: SkripsiDocument = {
            ...result.document,
            citationStyle: "apa-7",
            documentMetadata: { institution: "Universitas Bina Nusantara", city: "Jakarta", year: new Date().getFullYear() },
          };
          const snapshot = createSnapshot(doc, paste, "APA 7");
          try {
            window.localStorage.setItem(SESSION_KEY, serializeSnapshot(snapshot));
          } catch {
            setMessage("Session terlalu besar untuk disimpan di browser.");
            setStage("idle");
            setProgress(0);
            return;
          }
          finishProgress("redirecting");
          window.setTimeout(() => router.push("/workspace/editor"), 120);
        } catch {
          setMessage("Gagal memproses bahan. Coba lagi dengan file yang berbeda.");
          setStage("idle");
          setProgress(0);
        }
      };
      worker.addEventListener("message", handler);
      worker.postMessage({ id: requestId, method: "ingest", args: [{ content, kind, name, extension }] });
    } else {
      // Fallback: run synchronously if worker failed to initialize
      try {
        const { ingestSource } = require("../../lib/ingestion");
        const { renumberDocument } = require("../../lib/renumber");
        const result = ingestSource({ content, kind, name, extension });
        if (!result.document) {
          setMessage(result.issues.map((i: { message: string }) => i.message).join(" "));
          setStage("idle");
          setProgress(0);
          return;
        }
        result.document = renumberDocument(result.document);
        const doc: SkripsiDocument = {
          ...result.document,
          citationStyle: "apa-7",
          documentMetadata: { institution: "Universitas Bina Nusantara", city: "Jakarta", year: new Date().getFullYear() },
        };
        const snapshot = createSnapshot(doc, paste, "APA 7");
        window.localStorage.setItem(SESSION_KEY, serializeSnapshot(snapshot));
        finishProgress("redirecting");
        window.setTimeout(() => router.push("/workspace/editor"), 120);
      } catch {
        setMessage("Gagal memproses bahan. Coba lagi dengan file yang berbeda.");
        setStage("idle");
        setProgress(0);
      }
    }
  };

  const readFile = (file: File, ext: string) => {
    if (!FILE_EXT.includes(ext)) {
      setMessage("Gunakan file .md, .markdown, atau .txt");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage("Ukuran file melebihi 2 MB. Coba pisahkan bahanmu.");
      return;
    }
    setFileName(file.name);
    setMessage(null);
    setStage("reading");
    setProgress(0);
    animateProgress(40, 600);
    const reader = new FileReader();
    reader.onloadstart = () => animateProgress(20, 400);
    reader.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const ratio = Math.min(0.7, (event.loaded / event.total) * 0.6 + 0.1);
        setProgress(Math.round(ratio * 100));
      }
    };
    reader.onload = () => {
      const content = String(reader.result ?? "");
      persist(content, ext === ".txt" ? "plain-text" : "markdown", file.name, ext);
    };
    reader.onerror = () => {
      setStage("idle");
      setProgress(0);
      setMessage("Gagal membaca file. Coba lagi.");
    };
    reader.readAsText(file);
  };

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    readFile(file, ext);
    event.target.value = "";
  };

  const onDragEnter = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    dragDepth.current += 1;
    if (event.dataTransfer.types.includes("Files")) setIsDragging(true);
  };
  const onDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };
  const onDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  };
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    readFile(file, ext);
  };

  const isBusy = stage !== "idle";
  const progressWidth = Math.round(progress);

  return (
    <main className="input-page">
      <header className="workspace-header shell">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32"><path d="M8 5h11a6 6 0 0 1 0 12H13v10H8V5Zm5 5v3h6a1.5 1.5 0 0 0 0-3h-6Z"/><path className="mark-cut" d="M13 20h9v5h-9z"/></svg>
          </span>
          <span>Skripsi<span className="brand-accent">Flow</span></span>
        </a>
        <a className="secondary-button" href="/">Kembali ke beranda</a>
      </header>

      <section className="input-page-layout shell">
        <aside className="input-page-info">
          <p className="eyebrow">LANGKAH 01 / 02</p>
          <h1 className="input-page-title">
            Masukkan<br /><em>bahanmu.</em>
          </h1>
          <p className="panel-copy">
            Upload file atau tempel teks dari AI. Struktur akan dikenali otomatis - kamu bisa rapikan semuanya di editor.
          </p>
          <ol className="input-page-steps">
            {steps.map((step) => (
              <li key={step.id}>
                <span className="step-id">{step.id}</span>
                <div>
                  <strong>{step.label}</strong>
                  <span>{step.detail}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="privacy-note">
            <span aria-hidden="true">&#10022;</span> File diproses sementara dan tidak masuk ke log.
          </p>
        </aside>

        <div className="input-page-form" aria-busy={isBusy}>
          <label
            className={`dropzone ${isDragging ? "is-dragging" : ""} ${isBusy ? "is-loading" : ""}`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={drop}
          >
            <span className="upload-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"/></svg>
            </span>
            <strong>{isBusy ? stageLabel[stage] : "Tarik file ke sini"}</strong>
            <span>{isBusy && fileName ? fileName : "atau klik untuk pilih dari perangkatmu"}</span>
            {isBusy && (
              <div className="dropzone-progress" role="progressbar" aria-valuenow={progressWidth} aria-valuemin={0} aria-valuemax={100}>
                <div className="dropzone-progress-bar" style={{ width: `${progressWidth}%` }} />
              </div>
            )}
            <div className="file-types">
              <span>.MD</span>
              <span>.MARKDOWN</span>
              <span>.TXT</span>
            </div>
            <input
              type="file"
              accept=".md,.markdown,.txt,text/plain,text/markdown"
              onChange={upload}
              disabled={isBusy}
            />
          </label>

          <div className="paste-divider"><span>atau tempel langsung</span></div>

          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="Tempel hasil AI atau tulisanmu di sini..."
            disabled={isBusy}
            aria-busy={isBusy}
          />
          <button
            className="primary-button full-button"
            disabled={isBusy || !paste.trim()}
            onClick={() => { setStage("reading"); setProgress(20); animateProgress(60, 400); setMessage(null); persist(paste, "paste"); }}
          >
            {isBusy ? (
              <>
                <span className="button-spinner" aria-hidden="true" />
                {stageLabel[stage]}
              </>
            ) : (
              <>Mulai Edit <span>&rarr;</span></>
            )}
          </button>

          {message && (
            <p className="input-page-message" role="alert">{message}</p>
          )}
        </div>
      </section>
    </main>
  );
}

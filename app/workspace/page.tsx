"use client";
import { ChangeEvent, DragEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ingestSource } from "../../lib/ingestion";
import { exportPdf } from "../../lib/export-pdf";
import { exportDocx } from "../../lib/export-docx";
import { validateDocument } from "../../lib/validation";
import type { SkripsiDocument } from "../../lib/document-model";
import {
  createSnapshot, serializeSnapshot, SESSION_KEY,
} from "../../lib/session";

export default function WorkspacePage() {
  const router = useRouter();
  const [paste, setPaste] = useState("");
  const [message, setMessage] = useState("Masukkan bahan untuk memulai.");
  const [loading, setLoading] = useState(false);

  const parse = (content: string, kind: "paste" | "markdown" | "plain-text", name?: string, extension?: string) => {
    setLoading(true);
    try {
      const result = ingestSource({ content, kind, name, extension });
      if (!result.document) {
        setMessage(result.issues.map((i) => i.message).join(" "));
        setLoading(false);
        return;
      }
      const doc: SkripsiDocument = {
        ...result.document,
        citationStyle: "apa-7",
      };
      const snapshot = createSnapshot(doc, paste, "APA 7");
      window.localStorage.setItem(SESSION_KEY, serializeSnapshot(snapshot));
      router.push("/workspace/editor");
    } catch {
      setMessage("Gagal memproses bahan. Coba lagi dengan file yang berbeda.");
      setLoading(false);
    }
  };

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (![".md", ".markdown", ".txt"].includes(ext)) {
      setMessage("Gunakan file .md, .markdown, atau .txt");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => parse(String(reader.result ?? ""), ext === ".txt" ? "plain-text" : "markdown", file.name, ext);
    reader.readAsText(file);
  };

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (![".md", ".markdown", ".txt"].includes(ext)) {
      setMessage("Gunakan file .md, .markdown, atau .txt");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => parse(String(reader.result ?? ""), ext === ".txt" ? "plain-text" : "markdown", file.name, ext);
    reader.readAsText(file);
  };

  return (
    <main className="input-page">
      <header className="workspace-header shell">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32"><path d="M8 5h11a6 6 0 0 1 0 12H13v10H8V5Zm5 5v3h6a1.5 1.5 0 0 0 0-3h-6Z"/><path className="mark-cut" d="M13 20h9v5h-9z"/></svg>
          </span>
          <span>Skripsi<span className="brand-accent">Flow</span></span>
        </a>
      </header>
      <section className="input-page-content shell">
        <p className="eyebrow">LANGKAH 01 / 02</p>
        <h1 className="input-page-title">
          Masukkan<br /><em>bahanmu.</em>
        </h1>
        <p className="panel-copy">
          Upload file atau tempel teks dari AI. Struktur akan dibaca otomatis.
        </p>
        <label
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={drop}
        >
          <span className="upload-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"/></svg>
          </span>
          <strong>Tarik file ke sini</strong>
          <span>Markdown atau TXT</span>
          <input
            type="file"
            accept=".md,.markdown,.txt,text/plain,text/markdown"
            onChange={upload}
          />
        </label>
        <div className="paste-divider"><span>atau tempel langsung</span></div>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="Tempel hasil AI atau tulisanmu di sini..."
        />
        <button
          className="primary-button full-button"
          disabled={loading || !paste.trim()}
          onClick={() => parse(paste, "paste")}
        >
          {loading ? "Memproses..." : "Mulai Edit"} <span>&rarr;</span>
        </button>
        <p className="privacy-note">
          <span aria-hidden="true">&#10022;</span> File diproses sementara dan tidak masuk ke log.
        </p>
        {message !== "Masukkan bahan untuk memulai." && (
          <p className="input-page-message">{message}</p>
        )}
      </section>
    </main>
  );
}

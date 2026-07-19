"use client";

import { useEffect, useState, useCallback } from "react";
import {
  createSnapshot, parseSnapshot, pushHistory, redo, undo,
  SESSION_KEY, serializeSnapshot,
} from "../../../../lib/session";
import type { SkripsiDocument } from "../../../../lib/document-model";
import { renumberDocument } from "../../../../lib/renumber";

interface SessionSnapshot {
  document: SkripsiDocument;
  paste: string;
  selectedStyle: string;
}

export interface UseDocumentSessionReturn {
  document: SkripsiDocument | null;
  setDocument: (next: SkripsiDocument) => void;
  paste: string;
  setPaste: React.Dispatch<React.SetStateAction<string>>;
  selectedStyle: string;
  setSelectedStyle: React.Dispatch<React.SetStateAction<string>>;
  history: {
    past: SkripsiDocument[];
    present: SkripsiDocument | null;
    future: SkripsiDocument[];
  };
  handleUndo: () => void;
  handleRedo: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

export function useDocumentSession(
  initialDocument: SkripsiDocument | null,
  initialPaste: string,
  initialStyle: string
): UseDocumentSessionReturn {
  const [document, setDocumentState] = useState<SkripsiDocument | null>(initialDocument);
  const [paste, setPaste] = useState(initialPaste);
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState({
    past: [] as SkripsiDocument[],
    present: initialDocument,
    future: [] as SkripsiDocument[],
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      window.location.href = "/workspace";
      return;
    }
    const snapshot = parseSnapshot(raw);
    if (!snapshot) {
      window.localStorage.removeItem(SESSION_KEY);
      window.location.href = "/workspace";
      return;
    }
    const hydrated = renumberDocument({
      ...snapshot.document,
      documentMetadata: snapshot.document.documentMetadata ?? { institution: "Universitas Bina Nusantara" },
    });
    setDocumentState(hydrated);
    setPaste(snapshot.paste);
    setSelectedStyle(snapshot.selectedStyle);
    setHistory({ past: [], present: hydrated, future: [] });
    setMessage("");
  }, []);

  useEffect(() => {
    if (!document) return;
    const timer = setTimeout(() => {
      try {
        const snapshot = createSnapshot(document, paste, selectedStyle);
        window.localStorage.setItem(SESSION_KEY, serializeSnapshot(snapshot));
      } catch {
        /* silent */
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [document, paste, selectedStyle]);

  const commitDocument = useCallback((next: SkripsiDocument) => {
    setHistory((current) => pushHistory(current, next));
    setDocumentState(renumberDocument(next));
  }, []);

  const handleUndo = useCallback(() => {
    const next = undo(history);
    setHistory(next);
    if (next.present) setDocumentState(renumberDocument(next.present));
  }, [history]);

  const handleRedo = useCallback(() => {
    const next = redo(history);
    setHistory(next);
    if (next.present) setDocumentState(renumberDocument(next.present));
  }, [history]);

  return {
    document,
    setDocument: commitDocument,
    paste,
    setPaste,
    selectedStyle,
    setSelectedStyle,
    history,
    handleUndo,
    handleRedo,
    message,
    setMessage,
  };
}

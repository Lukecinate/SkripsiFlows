"use client";
import { formatReference, type CitationAnalysis } from "../../lib/citation";

interface ReferencePreviewProps {
  analysis: CitationAnalysis;
  selectedStyle: string;
}

export default function ReferencePreview({ analysis, selectedStyle }: ReferencePreviewProps) {
  const styleKey = selectedStyle.toLowerCase().replaceAll(" ", "-") as
    | "apa-7" | "ieee" | "vancouver" | "harvard" | "chicago";
  return (
    <div className="reference-preview">
      <div className="reference-heading">
        <strong>Referensi terdeteksi</strong>
        <span>{analysis.issues.length} temuan</span>
      </div>
      {analysis.references.map((reference, index) => (
        <p key={reference.id}>{formatReference(reference, styleKey, index)}</p>
      ))}
    </div>
  );
}

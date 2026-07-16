"use client";
import type { ValidationReport } from "../../lib/validation";

interface AnalysisModalProps {
  validation: ValidationReport | null;
  onClose: () => void;
}

export default function AnalysisModal({ validation, onClose }: AnalysisModalProps) {
  return (
    <div className="analysis-overlay" role="dialog" aria-modal="true" aria-labelledby="analysis-title">
      <div className="analysis-dialog">
        <div className="analysis-dialog-head">
          <div>
            <span className="eyebrow">HASIL ANALISIS</span>
            <h3 id="analysis-title">Periksa sebelum lanjut</h3>
          </div>
          <button type="button" className="close-button" aria-label="Tutup hasil analisis" onClick={onClose}>
            &times;
          </button>
        </div>
        <p>
          {validation?.reviewCount
            ? `Ditemukan ${validation.reviewCount} hal yang perlu diperhatikan.`
            : "Struktur dokumen siap ditinjau."}
        </p>
        {validation?.issues.length ? (
          <ul>
            {validation.issues.slice(0, 8).map((issue, index) => (
              <li key={`${issue.code}-${issue.blockId ?? index}`}>{issue.message}</li>
            ))}
          </ul>
        ) : (
          <p className="analysis-success">&#10003; Tidak ada masalah struktur yang terdeteksi.</p>
        )}
        <button type="button" className="primary-button" onClick={onClose}>
          Lihat hasil analisis
        </button>
      </div>
    </div>
  );
}

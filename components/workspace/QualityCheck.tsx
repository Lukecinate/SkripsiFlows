"use client";
import type { ValidationReport } from "../../lib/validation";

interface QualityCheckProps {
  validation: ValidationReport | null;
  hasDocument: boolean;
}

export default function QualityCheck({ validation, hasDocument }: QualityCheckProps) {
  return (
    <div className="quality-card">
      <div>
        <span className="eyebrow">QUALITY CHECK</span>
        <strong>{validation?.score ?? 0}/100</strong>
      </div>
      <p>
        {validation?.canExport
          ? validation.reviewCount
            ? "Siap diekspor dengan catatan review."
            : "Dokumen siap diekspor."
          : hasDocument
            ? "Export tidak tersedia tanpa dokumen."
            : "Menunggu bahan masuk."}
      </p>
    </div>
  );
}

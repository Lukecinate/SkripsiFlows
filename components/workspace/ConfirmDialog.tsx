"use client";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title, description, confirmLabel = "Ya, hapus", onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="analysis-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm-dialog">
        <div className="confirm-icon" aria-hidden="true">!</div>
        <span className="eyebrow">KONFIRMASI</span>
        <h3 id="confirm-title">{title}</h3>
        <p>{description}</p>
        <div className="confirm-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>Batal</button>
          <button type="button" className="danger-button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

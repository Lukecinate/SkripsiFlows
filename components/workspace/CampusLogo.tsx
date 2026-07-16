export default function CampusLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" className={`campus-logo ${className}`} aria-label="Logo Universitas">
      <rect x="0" y="4" width="52" height="52" rx="8" fill="var(--navy)" />
      <path d="M14 38V20l12 9-12 9Z" fill="var(--mint)" />
      <path d="M28 20l12 9-12 9V20Z" fill="var(--mint-strong)" opacity=".7" />
      <path d="M38 26l8 4-8 4V26Z" fill="var(--mint)" opacity=".5" />
      <text x="62" y="25" fontFamily="Georgia,serif" fontSize="13" fontWeight="700" fill="var(--ink)">
        UNIVERSITAS
      </text>
      <text x="62" y="42" fontFamily="Georgia,serif" fontSize="10" fill="var(--ink-soft)">
        Fakultas Ilmu Komputer
      </text>
    </svg>
  );
}

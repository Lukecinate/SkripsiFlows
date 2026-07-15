"use client";

import { useEffect } from "react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { void reset; }, [reset]);
  return <main className="error-page"><div className="error-mark">!</div><p className="eyebrow">SKRIPSIFLOW · WORKSPACE</p><h1>Workspace belum siap.</h1><p>Ada masalah saat memuat bagian ini. Dokumen lokalmu tidak ditampilkan di pesan error.</p><div className="error-actions"><button className="primary-button" onClick={() => reset()}>Muat ulang</button><a className="secondary-button" href="/">Kembali ke beranda</a></div></main>;
}

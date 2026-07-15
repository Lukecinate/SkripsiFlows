"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="id"><body><main className="error-page"><div className="error-mark">!</div><p className="eyebrow">SKRIPSIFLOW · TERJADI GANGGUAN</p><h1>Halaman sedang beristirahat.</h1><p>Terjadi masalah teknis yang tidak terduga. Detail internal disembunyikan untuk menjaga keamanan.</p><div className="error-actions"><button className="primary-button" onClick={() => reset()}>Coba lagi</button><a className="secondary-button" href="/">Kembali ke beranda</a></div></main></body></html>;
}

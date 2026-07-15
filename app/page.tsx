const features = [
  { icon: "01", title: "Masukkan bahan", text: "Upload Markdown/TXT atau tempel hasil AI tanpa perlu membersihkan format terlebih dahulu." },
  { icon: "02", title: "Rapikan bersama", text: "SkripsiFlow mengenali bab, subbab, tabel, sitasi, dan bagian yang perlu dikonfirmasi." },
  { icon: "03", title: "Export siap pakai", text: "Pilih template dan gaya referensi, lalu unduh dokumen Word dengan validasi yang jelas." }
];

export default function HomePage() {
  return (
    <main>
      <nav className="nav shell">
        <div className="brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" role="img"><path d="M8 5h11a6 6 0 0 1 0 12H13v10H8V5Zm5 5v3h6a1.5 1.5 0 0 0 0-3h-6Z"/><path className="mark-cut" d="M13 20h9v5h-9z"/></svg></span><span>Skripsi<span className="brand-accent">Flow</span></span></div>
        <div className="nav-meta"><span className="status-dot" /> Bahasa Indonesia <a className="text-button" href="#cara-kerja">Cara kerja</a></div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">WORKSPACE SKRIPSI UNTUK MAHASISWA</p>
          <h1>Dari bahan mentah<br /><em>menjadi skripsi.</em></h1>
          <p className="hero-text">Susun hasil riset, output AI, dan referensi menjadi dokumen yang mengikuti format skripsi Indonesia—tanpa bergulat dengan format Word.</p>
          <div className="hero-actions"><a className="primary-button" href="/workspace">Mulai dokumen <span>→</span></a><a className="secondary-button" href="#cara-kerja">Lihat cara kerja</a></div>
          <div className="trust-row"><span>✦</span> Tidak perlu akun &nbsp;·&nbsp; File diproses sementara &nbsp;·&nbsp; Review selalu di tanganmu</div>
        </div>
        <div className="hero-card" aria-label="Preview alur SkripsiFlow">
          <div className="card-top"><span className="card-label">DOKUMEN BARU</span><span className="progress-label">01 / 04</span></div>
          <div className="progress-track"><div className="progress-value" /></div>
          <div className="upload-zone"><div className="upload-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"/></svg></div><strong>Tarik file ke sini</strong><span>atau pilih dari perangkatmu</span><div className="file-types"><span>.MD</span><span>.TXT</span><span>PASTE</span></div></div>
          <div className="card-footer"><span className="mini-avatar">✦</span><span>Format akan dibaca otomatis</span><span className="arrow">→</span></div>
        </div>
      </section>

      <section id="cara-kerja" className="how-it-works shell"><div className="section-heading"><p className="eyebrow">TIDAK PERLU JAGO TEKNOLOGI</p><h2>Lihat cara<br /><span>kerjanya.</span></h2><p className="how-copy">Masukkan bahan, periksa bagian yang perlu perhatian, lalu unduh dokumen Word. Semua langkah terlihat jelas di satu workspace.</p></div><div className="how-visual"><img src="/visuals/how-it-works.svg" alt="Ilustrasi tiga langkah penggunaan SkripsiFlow: masukkan bahan, review struktur, dan unduh DOCX" /></div></section><section id="fitur" className="features shell"><div className="section-heading"><p className="eyebrow">SATU ALUR, LEBIH SEDIKIT RIBET</p><h2>Fokus pada isi.<br /><span>Biarkan format kami.</span></h2></div><div className="feature-grid">{features.map((feature) => <article className="feature" key={feature.icon}><span className="feature-number">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>

      <section className="quote-band"><div className="shell quote-content"><span className="quote-mark">“</span><p>Dokumen yang rapi bukan berarti harus dibuat dengan cara yang rumit.</p><span className="quote-caption">SkripsiFlow · built for the final stretch</span></div></section>

      <footer className="footer shell"><div className="brand"><span className="brand-mark small" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M8 5h11a6 6 0 0 1 0 12H13v10H8V5Zm5 5v3h6a1.5 1.5 0 0 0 0-3h-6Z"/><path className="mark-cut" d="M13 20h9v5h-9z"/></svg></span><span>Skripsi<span className="brand-accent">Flow</span></span></div><span>Workspace skripsi yang mengerti prosesmu.</span><span className="version-tag">v0.2.0 · Prototype</span></footer>
    </main>
  );
}


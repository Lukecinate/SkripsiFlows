import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkripsiFlow — Dari ide menjadi skripsi siap format",
  description: "Konversi Markdown, TXT, dan paste menjadi dokumen skripsi Indonesia."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}

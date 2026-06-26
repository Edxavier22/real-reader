import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REAL Reader — estude enquanto vive sua rotina",
  description:
    "Transforme documentos em áudio de estudo. Envie um PDF ou imagem, ouça rápido e desbloqueie voz humana no Premium."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f5ef"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

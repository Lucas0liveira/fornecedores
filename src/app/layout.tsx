import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--dm-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--instrument-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Loja Logística — Simulador de Pedidos",
  description:
    "Simulador educacional de pedidos B2B para a disciplina de Logística.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      style={
        {
          "--font-sans": "var(--dm-sans), system-ui, sans-serif",
          "--font-display": "var(--instrument-serif), Georgia, serif",
          "--font-mono": "var(--jetbrains-mono), monospace",
        } as React.CSSProperties
      }
    >
      <body>{children}</body>
    </html>
  );
}

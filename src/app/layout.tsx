import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--plus-jakarta-sans",
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
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      style={
        {
          "--font-sans": "var(--plus-jakarta-sans), system-ui, sans-serif",
          "--font-display": "var(--plus-jakarta-sans), system-ui, sans-serif",
          "--font-mono": "var(--jetbrains-mono), monospace",
        } as React.CSSProperties
      }
    >
      <body>{children}</body>
    </html>
  );
}

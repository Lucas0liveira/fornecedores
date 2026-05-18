import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { getSiteConfig } from "@/lib/siteConfig";
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

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig().catch(() => null);
  const title = config?.site_title ?? "Arapuá Marketplace";
  return {
    title: `${title} — Simulador de Pedidos`,
    description:
      "Simulador educacional de pedidos B2B para a disciplina de Logística.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = await getSiteConfig().catch(() => null);

  const colorVars = config
    ? {
        "--primary": config.primary_color,
        "--accent": config.accent_color,
        "--bg": config.bg_color,
        "--grad-c1": config.grad_color_1,
        "--grad-c2": config.grad_color_2,
      }
    : {};

  return (
    <html
      lang="pt-BR"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      style={
        {
          "--font-sans": "var(--plus-jakarta-sans), system-ui, sans-serif",
          "--font-display": "var(--plus-jakarta-sans), system-ui, sans-serif",
          "--font-mono": "var(--jetbrains-mono), monospace",
          ...colorVars,
        } as unknown as React.CSSProperties
      }
    >
      <body className={config?.bg_type === "gradient" ? "gradient-bg" : ""}>
        {children}
      </body>
    </html>
  );
}

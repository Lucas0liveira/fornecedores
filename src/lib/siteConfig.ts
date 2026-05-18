import { createClient as createBase } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type SiteConfig = {
  show_prices: boolean;
  site_title: string;
  hero_text: string;
  hero_image: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  bg_type: "plain" | "gradient";
  bg_color: string;
  grad_color_1: string;
  grad_color_2: string;
  contact_email: string;
};

const DEFAULTS: SiteConfig = {
  show_prices: true,
  site_title: "Arapuá Marketplace",
  hero_text: "Explore nossos fornecedores e monte seu pedido.",
  hero_image: "",
  logo_url: "",
  primary_color: "#2d5f3f",
  accent_color: "#f5c842",
  bg_type: "gradient",
  bg_color: "#fbf7eb",
  grad_color_1: "#fef3c7",
  grad_color_2: "#d4eccf",
  contact_email: "",
};

const fetchRows = unstable_cache(
  async () => {
    const supabase = createBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from("site_config").select("key, value");
    return data ?? [];
  },
  ["site-config"],
  { revalidate: 60, tags: ["site-config"] }
);

export async function getSiteConfig(): Promise<SiteConfig> {
  const rows = await fetchRows();
  const m: Record<string, string> = Object.fromEntries(
    rows.map((r: { key: string; value: string }) => [r.key, r.value])
  );
  return {
    show_prices: (m.show_prices ?? "true") !== "false",
    site_title: m.site_title || DEFAULTS.site_title,
    hero_text: m.hero_text || DEFAULTS.hero_text,
    hero_image: m.hero_image ?? "",
    logo_url: m.logo_url ?? "",
    primary_color: m.primary_color || DEFAULTS.primary_color,
    accent_color: m.accent_color || DEFAULTS.accent_color,
    bg_type: (m.bg_type as "plain" | "gradient") || DEFAULTS.bg_type,
    bg_color: m.bg_color || DEFAULTS.bg_color,
    grad_color_1: m.grad_color_1 || DEFAULTS.grad_color_1,
    grad_color_2: m.grad_color_2 || DEFAULTS.grad_color_2,
    contact_email: m.contact_email ?? "",
  };
}

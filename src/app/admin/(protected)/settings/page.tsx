import { requireTeacher } from "@/lib/requireTeacher";
import { getSiteConfig } from "@/lib/siteConfig";
import { SiteConfigForm } from "./SiteConfigForm";

export default async function SettingsPage() {
  await requireTeacher();
  const config = await getSiteConfig().catch(() => null);

  return (
    <>
      <div className="admin-hd">
        <h1>Configurações do site</h1>
      </div>
      <SiteConfigForm config={config ?? {
        show_prices: true,
        site_title: "Arapuá Marketplace",
        hero_text: "Explore nossos fornecedores e monte seu pedido.",
        logo_url: "",
        primary_color: "#15140f",
        accent_color: "#b4321a",
        bg_type: "plain",
        bg_color: "#fafaf7",
        grad_color_1: "#c8e6c9",
        grad_color_2: "#fff9c4",
      }} />
    </>
  );
}

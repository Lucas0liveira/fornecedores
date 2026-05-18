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
        hero_image: "",
        logo_url: "",
        primary_color: "#2d5f3f",
        accent_color: "#f5c842",
        bg_type: "gradient",
        bg_color: "#fbf7eb",
        grad_color_1: "#fef3c7",
        grad_color_2: "#d4eccf",
        contact_email: "",
      }} />
    </>
  );
}

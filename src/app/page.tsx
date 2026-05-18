import { createClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/siteConfig";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeClient } from "./HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: suppliers }, config] = await Promise.all([
    supabase.from("suppliers").select("id, name, tagline, category, whatsapp, hero").order("name"),
    getSiteConfig().catch(() => null),
  ]);

  return (
    <>
      <Header title={config?.site_title} logoUrl={config?.logo_url || undefined} />
      <main style={{ flex: 1 }}>
        <HomeClient suppliers={suppliers ?? []} heroText={config?.hero_text} />
      </main>
      <Footer />
    </>
  );
}

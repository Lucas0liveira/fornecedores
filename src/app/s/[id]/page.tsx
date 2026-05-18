import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/siteConfig";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupplierClient } from "./SupplierClient";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SupplierPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: supplier }, { data: products }, config] = await Promise.all([
    supabase.from("suppliers").select("*").eq("id", id).single(),
    supabase.from("products").select("*").eq("supplier_id", id).order("name"),
    getSiteConfig().catch(() => null),
  ]);

  if (!supplier) notFound();

  return (
    <>
      <Header title={config?.site_title} logoUrl={config?.logo_url || undefined} />
      <main style={{ flex: 1 }}>
        <SupplierClient
          supplier={supplier}
          products={products ?? []}
          showPrices={config?.show_prices ?? true}
        />
      </main>
      <Footer />
    </>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const [{ data: supplier }, { data: products }] = await Promise.all([
    supabase.from("suppliers").select("*").eq("id", id).single(),
    supabase.from("products").select("*").eq("supplier_id", id).order("name"),
  ]);

  if (!supplier) notFound();

  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <SupplierClient supplier={supplier} products={products ?? []} />
      </main>
      <Footer />
    </>
  );
}

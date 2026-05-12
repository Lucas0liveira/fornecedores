import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!supplier) notFound();

  return (
    <>
      <div className="admin-hd">
        <div>
          <div className="crumbs" style={{ paddingTop: 0, marginBottom: 6 }}>
            <Link href="/admin/suppliers">Fornecedores</Link>
            <span>/</span>
            <Link href={`/admin/suppliers/${id}`}>{supplier.name}</Link>
            <span>/</span>
            <Link href={`/admin/suppliers/${id}/products`}>Produtos</Link>
            <span>/</span>
            <span>Novo</span>
          </div>
          <h1>Novo produto</h1>
        </div>
      </div>
      <ProductForm supplierId={id} />
    </>
  );
}

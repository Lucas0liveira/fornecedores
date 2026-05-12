import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";

interface Props {
  params: Promise<{ id: string; pid: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id, pid } = await params;
  const supabase = await createClient();

  const [{ data: supplier }, { data: product }] = await Promise.all([
    supabase.from("suppliers").select("id, name").eq("id", id).single(),
    supabase.from("products").select("*").eq("id", Number(pid)).single(),
  ]);

  if (!supplier || !product) notFound();

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
            <span>{product.name}</span>
          </div>
          <h1>Editar produto</h1>
        </div>
      </div>
      <ProductForm supplierId={id} product={product} />
    </>
  );
}

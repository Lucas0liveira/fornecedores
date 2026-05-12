import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupplierForm } from "../SupplierForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: supplier } = await supabase
    .from("suppliers")
    .select("*")
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
            <span>{supplier.name}</span>
          </div>
          <h1>Editar fornecedor</h1>
        </div>
        <Link href={`/admin/suppliers/${id}/products`} className="btn btn-ghost">
          Ver produtos →
        </Link>
      </div>
      <SupplierForm supplier={supplier} />
    </>
  );
}

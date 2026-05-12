import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "./DeleteProductButton";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: supplier }, { data: products }] = await Promise.all([
    supabase.from("suppliers").select("id, name").eq("id", id).single(),
    supabase
      .from("products")
      .select("id, name, brand, unit, price, min_order, in_stock")
      .eq("supplier_id", id)
      .order("name"),
  ]);

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
            <span>Produtos</span>
          </div>
          <h1>{supplier.name}</h1>
        </div>
        <Link
          href={`/admin/suppliers/${id}/products/new`}
          className="btn btn-primary"
        >
          <Plus size={15} /> Novo produto
        </Link>
      </div>

      {!products?.length ? (
        <div
          className="empty-state"
          style={{
            border: "var(--hairline) solid var(--border)",
            background: "var(--card)",
            padding: 40,
          }}
        >
          <p>Nenhum produto cadastrado para este fornecedor.</p>
          <Link
            href={`/admin/suppliers/${id}/products/new`}
            className="btn btn-primary"
            style={{ marginTop: 12 }}
          >
            Adicionar primeiro produto
          </Link>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Marca</th>
              <th>Preço</th>
              <th>Unidade</th>
              <th>Estoque</th>
              <th style={{ textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{p.brand}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {fmt(p.price)}
                </td>
                <td
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  {p.unit} · mín. {p.min_order}
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: p.in_stock
                        ? "rgba(42,94,42,0.12)"
                        : "rgba(180,50,26,0.1)",
                      color: p.in_stock ? "var(--good)" : "var(--warn)",
                    }}
                  >
                    {p.in_stock ? "Em estoque" : "Sem estoque"}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <Link
                      href={`/admin/suppliers/${id}/products/${p.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton
                      productId={p.id}
                      productName={p.name}
                      supplierId={id}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

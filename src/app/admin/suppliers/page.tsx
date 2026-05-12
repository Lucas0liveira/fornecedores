import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { DeleteSupplierButton } from "./DeleteSupplierButton";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, category, whatsapp, cnpj")
    .order("name");

  return (
    <>
      <div className="admin-hd">
        <h1>Fornecedores</h1>
        <Link href="/admin/suppliers/new" className="btn btn-primary">
          <Plus size={15} /> Novo fornecedor
        </Link>
      </div>

      {!suppliers?.length ? (
        <div className="empty-state" style={{ border: "var(--hairline) solid var(--border)", background: "var(--card)", padding: 40 }}>
          <p>Nenhum fornecedor cadastrado ainda.</p>
          <Link href="/admin/suppliers/new" className="btn btn-primary" style={{ marginTop: 12 }}>
            Criar primeiro fornecedor
          </Link>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>CNPJ</th>
              <th>WhatsApp</th>
              <th style={{ textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                    ID: {s.id}
                  </div>
                </td>
                <td>
                  <span className="badge muted">{s.category}</span>
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{s.cnpj}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>+{s.whatsapp}</td>
                <td>
                  <div className="actions-cell">
                    <Link
                      href={`/admin/suppliers/${s.id}/products`}
                      className="btn btn-ghost btn-sm"
                    >
                      Produtos
                    </Link>
                    <Link
                      href={`/admin/suppliers/${s.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Editar
                    </Link>
                    <DeleteSupplierButton supplierId={s.id} supplierName={s.name} />
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

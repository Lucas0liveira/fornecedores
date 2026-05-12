import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Store, Package } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ count: supplierCount }, { count: productCount }] = await Promise.all([
    supabase.from("suppliers").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    {
      label: "Fornecedores",
      count: supplierCount ?? 0,
      icon: Store,
      href: "/admin/suppliers",
      action: "Gerenciar fornecedores",
    },
    {
      label: "Produtos",
      count: productCount ?? 0,
      icon: Package,
      href: "/admin/suppliers",
      action: "Ver por fornecedor",
    },
  ];

  return (
    <>
      <div className="admin-hd">
        <h1>Dashboard</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {cards.map(({ label, count, icon: Icon, href, action }) => (
          <div
            key={label}
            style={{
              background: "var(--card)",
              border: "var(--hairline) solid var(--border)",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Icon size={18} color="var(--muted)" />
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {label}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: 16,
              }}
            >
              {count}
            </div>
            <Link href={href} className="btn btn-ghost btn-sm">
              {action} →
            </Link>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "var(--hairline) solid var(--border)",
          padding: 20,
          fontSize: 13,
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <strong style={{ color: "var(--text)" }}>Dica:</strong> Use{" "}
        <Link href="/admin/suppliers" style={{ color: "var(--primary)" }}>
          Fornecedores
        </Link>{" "}
        para criar, editar ou excluir fornecedores e seus produtos.
      </div>
    </>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Supplier } from "@/lib/types";

function heroUrl(supplier: Pick<Supplier, "id" | "hero">) {
  if (supplier.hero?.startsWith("http")) return supplier.hero;
  return `https://picsum.photos/seed/${encodeURIComponent(supplier.hero || supplier.id)}-${supplier.id}/640/400`;
}

interface Props {
  suppliers: Pick<Supplier, "id" | "name" | "tagline" | "category" | "whatsapp" | "hero">[];
  heroText?: string;
  contactEmail?: string;
}

export function HomeClient({ suppliers, heroText, contactEmail }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      suppliers.filter(
        (s) =>
          !q ||
          `${s.name} ${s.tagline} ${s.category}`
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [suppliers, q]
  );

  return (
    <>
      <section className="container home-hero">
        <h1>
          Escolha um <em>fornecedor</em>
          <br />e monte seu pedido.
        </h1>
        <p className="lede">
          {heroText ??
            `${suppliers.length} fornecedores parceiros · catálogos atualizados · pedidos enviados direto pelo WhatsApp.`}
        </p>
        {contactEmail && (
          <div className="hero-actions">
            <a href={`mailto:${contactEmail}`} className="btn btn-ghost">
              Sou Vendedor →
            </a>
          </div>
        )}
        <div className="search-wrap" style={{ marginTop: 22 }}>
          <Search size={15} color="var(--muted)" />
          <input
            placeholder="Buscar fornecedor ou categoria…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      <section className="container">
        {filtered.length === 0 ? (
          <p style={{ color: "var(--muted)", paddingBottom: 60 }}>
            Nenhum fornecedor encontrado para &ldquo;{q}&rdquo;.
          </p>
        ) : (
          <div className="suppliers-grid">
            {filtered.map((s) => (
              <Link key={s.id} href={`/s/${s.id}`} className="supplier-card">
                <div
                  className="img"
                  style={{ backgroundImage: `url(${heroUrl(s)})` }}
                />
                <div className="body">
                  <span className="badge muted">{s.category}</span>
                  <h3>{s.name}</h3>
                  <p>{s.tagline}</p>
                  <div className="meta">
                    <span>Ver catálogo →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

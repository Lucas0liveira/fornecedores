"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingBasket, Users, MessageCircle, Sparkles, Search } from "lucide-react";
import type { Supplier } from "@/lib/types";

function heroUrl(supplier: Pick<Supplier, "id" | "hero">) {
  if (supplier.hero?.startsWith("http")) return supplier.hero;
  return `https://picsum.photos/seed/${encodeURIComponent(supplier.hero || supplier.id)}-${supplier.id}/640/400`;
}

interface Props {
  suppliers: Pick<Supplier, "id" | "name" | "tagline" | "category" | "hero">[];
  heroText?: string;
  heroImage?: string;
  heroLayout?: "split" | "centered" | "banner" | "stacked";
  showCta?: boolean;
  ctaLabel?: string;
  contactEmail?: string;
}

export function HomeClient({
  suppliers,
  heroText,
  heroImage,
  heroLayout = "split",
  showCta = true,
  ctaLabel = "Explorar fornecedores",
  contactEmail,
}: Props) {
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

  const bannerStyle =
    heroLayout === "banner" && heroImage
      ? { backgroundImage: `url(${heroImage})` }
      : {};

  return (
    <>
      {/* ── Hero card ─────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container">
          <div className="hero hero-card" data-hero={heroLayout}>
            <div className="hero-blob b1" />
            <div className="hero-blob b2" />
            <div className="hero-blob b3" />
            <div className="hero-leaf l1" />
            <div className="hero-leaf l2" />

            <div className="hero-inner" style={bannerStyle}>
              <div className="hero-text">
                <span className="hero-eyebrow">
                  <Sparkles size={12} />
                  PRODUTOS DE QUEM VENDE · CONEXÃO DE QUEM COMPRA
                </span>

                <h1>
                  O marketplace que{" "}<em>conecta</em>{" "}você a produtos locais
                </h1>

                <p className="lede">
                  {heroText ??
                    "Descubra fornecedores parceiros e converse direto com quem vende. Sem intermediários, sem fricção."}
                </p>

                {showCta && (
                  <div className="hero-cta">
                    <button
                      className="btn btn-accent btn-lg"
                      onClick={() => {
                        document
                          .getElementById("suppliers")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <ShoppingBasket size={16} />
                      {ctaLabel}
                    </button>
                    {contactEmail && (
                      <a href={`mailto:${contactEmail}`} className="btn btn-ghost btn-lg">
                        Sou Vendedor →
                      </a>
                    )}
                  </div>
                )}
              </div>

              {heroLayout !== "banner" &&
                (heroImage ? (
                  <div
                    className="hero-image"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                ) : (
                  <div className="hero-image hero-default-img">
                    <img src="/bee.png" alt="" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature strip ─────────────────────────────────────── */}
      <div className="container">
        <div className="feature-strip">
          <div className="feat">
            <span className="icon">
              <ShoppingBasket size={20} />
            </span>
            <div>
              <h4>Produtos de vários vendedores</h4>
              <p>Tudo o que você precisa em um só lugar — frescos, despensa, doces, embalagens.</p>
            </div>
          </div>
          <div className="feat">
            <span className="icon alt">
              <Users size={20} />
            </span>
            <div>
              <h4>Empreendedores independentes</h4>
              <p>Fornecedores locais oferecendo seus melhores produtos direto pra você.</p>
            </div>
          </div>
          <div className="feat">
            <span className="icon alt2">
              <MessageCircle size={18} />
            </span>
            <div>
              <h4>Contato direto no WhatsApp</h4>
              <p>Fale com o vendedor, tire dúvidas e compre com confiança em segundos.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Suppliers section ─────────────────────────────────── */}
      <section className="container" id="suppliers">
        <div className="section-hd">
          <div>
            <h2>Nossos fornecedores</h2>
            <div className="sub">
              {suppliers.length} parceiros · catálogos atualizados toda semana
            </div>
          </div>
          <div className="search-wrap" style={{ maxWidth: 280 }}>
            <Search size={15} color="var(--muted)" />
            <input
              placeholder="Buscar fornecedor…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

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
                    <span className="go">Ver catálogo →</span>
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

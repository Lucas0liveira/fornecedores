"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Supplier } from "@/lib/types";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function seedFor(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  }
  return (h % 9000) + 1000;
}

function productImage(image: string, keyword: string, name: string, brand: string) {
  if (image) return image;
  const seed = seedFor(name + brand);
  return `https://picsum.photos/seed/${encodeURIComponent(keyword || "product")}-${seed}/320/320`;
}

export default function CartPage() {
  const router = useRouter();
  const { supplierId, items, setQty, remove, clear } = useCart();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [showPrices, setShowPrices] = useState(true);

  const cartItems = Object.values(items);
  const totalQty = cartItems.reduce((s, it) => s + it.qty, 0);
  const subtotal = cartItems.reduce((s, it) => s + it.qty * it.product.price, 0);

  useEffect(() => {
    if (!supplierId) return;
    const supabase = createClient();
    supabase.from("suppliers").select("*").eq("id", supplierId).single()
      .then(({ data }) => setSupplier(data));
    supabase.from("site_config").select("value").eq("key", "show_prices").single()
      .then(({ data }) => { if (data) setShowPrices(data.value !== "false"); });
  }, [supplierId]);

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <main style={{ flex: 1 }}>
          <div className="empty-state">
            <ShoppingCart size={48} color="var(--muted)" />
            <h2>Seu carrinho está vazio</h2>
            <p>Escolha um fornecedor e adicione produtos para começar.</p>
            <Link
              href="/"
              className="btn btn-primary btn-lg"
              style={{ marginTop: 8 }}
            >
              Ver fornecedores <ArrowRight size={16} />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <div className="container cart-layout">
          {/* Items */}
          <div className="card">
            <div className="cart-supplier-hd">
              <span className="dot" />
              <div>
                <b>{supplier?.name ?? supplierId}</b>
                {supplier && (
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    WhatsApp +{supplier.whatsapp}
                  </div>
                )}
              </div>
            </div>

            {cartItems.map(({ product, qty }) => (
              <div key={product.id} className="cart-row">
                <div
                  className="img"
                  style={{
                    backgroundImage: `url(${productImage(product.image, product.keyword, product.name, product.brand)})`,
                  }}
                />
                <div>
                  <div className="name">{product.name}</div>
                  <div className="meta">
                    <span>{product.brand}</span>
                    {showPrices && (
                      <span>
                        {fmt(product.price)} / {product.unit}
                      </span>
                    )}
                  </div>
                </div>
                <div className="stepper">
                  <button onClick={() => setQty(product.id, qty - 1)}>−</button>
                  <input
                    type="number"
                    value={qty}
                    min={1}
                    onChange={(e) =>
                      setQty(product.id, Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                  <button onClick={() => setQty(product.id, qty + 1)}>+</button>
                </div>
                <div style={{ textAlign: "right" }}>
                  {showPrices && (
                    <div className="line-total">{fmt(qty * product.price)}</div>
                  )}
                  <button
                    className="remove-btn"
                    onClick={() => remove(product.id)}
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="card summary">
            <h3>Resumo do pedido</h3>
            <div className="summary-line">
              <span>Itens</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="summary-line">
              <span>Quantidade total</span>
              <span>{totalQty}</span>
            </div>
            {showPrices && (
              <>
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="summary-line total">
                  <span>Total</span>
                  <span>{fmt(subtotal)}</span>
                </div>
              </>
            )}
            <div className="summary-actions">
              <button
                className="btn btn-primary btn-lg"
                style={{ justifyContent: "center" }}
                onClick={() => router.push("/review")}
              >
                Revisar e enviar <ArrowRight size={16} />
              </button>
              {supplierId && (
                <Link
                  href={`/s/${supplierId}`}
                  className="btn btn-ghost"
                  style={{ justifyContent: "center" }}
                >
                  Continuar comprando
                </Link>
              )}
              <button
                className="btn btn-ghost"
                style={{ justifyContent: "center", color: "var(--warn)" }}
                onClick={() => {
                  if (window.confirm("Esvaziar o carrinho?")) clear();
                }}
              >
                Esvaziar carrinho
              </button>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

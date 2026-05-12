"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import type { Supplier } from "@/lib/types";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function buildMessage(
  supplier: Supplier,
  items: { product: { name: string; brand: string; unit: string; price: number }; qty: number }[],
  subtotal: number
) {
  const today = new Date().toLocaleDateString("pt-BR");
  const orderId = String(Date.now()).slice(-6);
  const lines: string[] = [];
  lines.push("╔═════════════════════════════╗");
  lines.push(`   PEDIDO #${orderId}`);
  lines.push(`   ${today}`);
  lines.push("╚═════════════════════════════╝");
  lines.push("");
  lines.push(`*Fornecedor:* ${supplier.name}`);
  lines.push(`*CNPJ:* ${supplier.cnpj}`);
  lines.push("");
  lines.push("*── ITENS ──*");
  items.forEach(({ product, qty }, i) => {
    const lineTotal = qty * product.price;
    lines.push(`${String(i + 1).padStart(2, "0")}. ${product.name} (${product.brand})`);
    lines.push(`    ${qty} ${product.unit} × ${fmt(product.price)} = ${fmt(lineTotal)}`);
  });
  lines.push("");
  lines.push("*── TOTAIS ──*");
  lines.push(
    `Itens: ${items.length}  ·  Qtd total: ${items.reduce((s, it) => s + it.qty, 0)}`
  );
  lines.push(`Subtotal: ${fmt(subtotal)}`);
  lines.push(`*TOTAL: ${fmt(subtotal)}*`);
  lines.push("");
  lines.push("_Pedido enviado pelo Simulador de Logística — atividade escolar._");
  return lines.join("\n");
}

export default function ReviewPage() {
  const router = useRouter();
  const { supplierId, items, clear } = useCart();
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  const cartItems = Object.values(items);
  const subtotal = cartItems.reduce((s, it) => s + it.qty * it.product.price, 0);

  useEffect(() => {
    if (!supplierId || cartItems.length === 0) {
      router.replace("/cart");
      return;
    }
    const supabase = createClient();
    supabase
      .from("suppliers")
      .select("*")
      .eq("id", supplierId)
      .single()
      .then(({ data }) => setSupplier(data));
  }, [supplierId]); // eslint-disable-line react-hooks/exhaustive-deps

  const message = useMemo(() => {
    if (!supplier) return "";
    return buildMessage(supplier, cartItems, subtotal);
  }, [supplier, items, subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = () => {
    if (!supplier) return;
    const url = `https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setTimeout(() => {
      clear();
      router.push("/sent");
    }, 400);
  };

  if (!supplier) {
    return (
      <>
        <Header />
        <main style={{ flex: 1 }}>
          <div className="container" style={{ paddingTop: 40 }}>
            <p style={{ color: "var(--muted)" }}>Carregando…</p>
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
        <div className="container review-layout">
          {/* Left: order details */}
          <div>
            <div className="crumbs">
              <Link href="/cart">Carrinho</Link>
              <span>/</span>
              <span>Revisar pedido</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                margin: "14px 0 8px",
              }}
            >
              Revise o pedido antes de enviar
            </h1>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>
              Confira os itens e o texto. Ao enviar, abriremos o WhatsApp do
              fornecedor com a mensagem pronta.
            </p>

            <div className="card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "var(--hairline) solid var(--border)",
                  paddingBottom: 14,
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <span className="badge">Fornecedor</span>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: 22,
                      marginTop: 6,
                    }}
                  >
                    {supplier.name}
                  </div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    WhatsApp +{supplier.whatsapp}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    TOTAL
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 28,
                      fontWeight: 400,
                    }}
                  >
                    {fmt(subtotal)}
                  </div>
                </div>
              </div>

              <table className="review-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Unitário</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(({ product, qty }) => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div
                          style={{
                            color: "var(--muted)",
                            fontSize: 12,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {product.brand}
                        </div>
                      </td>
                      <td>
                        {qty} {product.unit}
                      </td>
                      <td>{fmt(product.price)}</td>
                      <td style={{ fontWeight: 600 }}>
                        {fmt(qty * product.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: WhatsApp preview */}
          <aside>
            <div className="wa-preview">
              <div className="wa-header">
                <div className="wa-avatar">
                  {supplier.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="wa-name">{supplier.name}</div>
                  <div className="wa-sub">via WhatsApp · pré-visualização</div>
                </div>
              </div>
              <div className="wa-bubble-wrap">
                <div className="wa-bubble">{message}</div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="btn btn-lg"
                style={{
                  background: "#25d366",
                  color: "white",
                  border: "none",
                  justifyContent: "center",
                  fontSize: 15,
                }}
                onClick={handleSend}
              >
                <MessageCircle size={18} />
                Enviar pelo WhatsApp
              </button>
              <Link
                href="/cart"
                className="btn btn-ghost btn-lg"
                style={{ justifyContent: "center" }}
              >
                Voltar ao carrinho
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

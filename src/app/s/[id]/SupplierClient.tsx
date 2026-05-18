"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/store/cart";
import type { Supplier, Product } from "@/lib/types";

const PER_PAGE = 12;
const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function seedFor(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  }
  return (h % 9000) + 1000;
}

function productImage(p: Product) {
  if (p.image) return p.image;
  const seed = seedFor(p.name + p.brand);
  return `https://picsum.photos/seed/${encodeURIComponent(p.keyword || "product")}-${seed}/320/320`;
}

interface Props {
  supplier: Supplier;
  products: Product[];
  showPrices?: boolean;
}

export function SupplierClient({ supplier, products, showPrices = true }: Props) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [stockOnly, setStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { add, items, supplierId, clear } = useCart();

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (!q ||
          `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())) &&
        (!stockOnly || p.in_stock)
    );
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });
    return list;
  }, [products, q, sort, stockOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = (v: string) => {
    setQ(v);
    setPage(1);
  };

  const handleAddProduct = (product: Product, qty: number) => {
    if (
      supplierId &&
      supplierId !== product.supplier_id &&
      Object.keys(items).length > 0
    ) {
      const ok = window.confirm(
        "O carrinho só aceita produtos de um fornecedor por vez. Deseja esvaziar o carrinho atual e começar com este novo fornecedor?"
      );
      if (!ok) return;
      clear();
    }
    add(product, qty);
  };

  return (
    <section className="container" style={{ paddingBottom: 60 }}>
      <div className="crumbs">
        <Link href="/">Fornecedores</Link>
        <span>/</span>
        <span>{supplier.name}</span>
      </div>

      <div className="supplier-banner">
        <div>
          <span className="badge">{supplier.category}</span>
          <h1>{supplier.name}</h1>
          <p className="tag">{supplier.tagline}</p>
          <div className="meta">
            <span>{supplier.address}</span>
            <span>CNPJ {supplier.cnpj}</span>
            <span>WhatsApp +{supplier.whatsapp}</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-wrap" style={{ flex: 1 }}>
          <Search size={15} color="var(--muted)" />
          <input
            placeholder="Buscar produto ou marca…"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="right">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => {
                setStockOnly(e.target.checked);
                setPage(1);
              }}
            />
            Somente em estoque
          </label>
          <select
            className="field-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="name-asc">Nome (A → Z)</option>
            <option value="name-desc">Nome (Z → A)</option>
            {showPrices && <option value="price-asc">Menor preço</option>}
            {showPrices && <option value="price-desc">Maior preço</option>}
          </select>
        </div>
      </div>

      <div className="results-meta">
        <span>
          {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
          {q && ` para "${q}"`}
        </span>
        <span>
          página {safePage} de {totalPages}
        </span>
      </div>

      <div className="products-grid">
        {pageItems.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            inCartQty={items[p.id]?.qty ?? 0}
            onAdd={handleAddProduct}
            showPrices={showPrices}
            supplierWhatsapp={supplier.whatsapp}
            supplierName={supplier.name}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={n === safePage ? "active" : ""}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </section>
  );
}

function ProductCard({
  product,
  inCartQty,
  onAdd,
  showPrices,
  supplierWhatsapp,
  supplierName,
}: {
  product: Product;
  inCartQty: number;
  onAdd: (p: Product, qty: number) => void;
  showPrices: boolean;
  supplierWhatsapp: string;
  supplierName: string;
}) {
  const [qty, setQty] = useState(product.min_order || 1);
  const imgUrl = productImage(product);

  const waUrl = useMemo(() => {
    const orderId = String(Date.now()).slice(-6);
    const today = new Date().toLocaleDateString("pt-BR");
    const lines = [
      `*Pedido #${orderId} — ${today}*`,
      `*Fornecedor:* ${supplierName}`,
      "",
      `*Produto:* ${product.name} (${product.brand})`,
      `*Qtd:* ${qty} ${product.unit}`,
    ];
    if (showPrices) {
      lines.push(
        `*Preço:* ${fmt(product.price)}/${product.unit} → Total: ${fmt(qty * product.price)}`
      );
    }
    lines.push("", "_Pedido via Arapuá Marketplace — atividade escolar._");
    return `https://wa.me/${supplierWhatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [qty, product, showPrices, supplierWhatsapp, supplierName]);

  return (
    <article className="prod-card">
      <div className="img" style={{ backgroundImage: `url(${imgUrl})` }}>
        {!product.in_stock && <div className="stock-out">Sem estoque</div>}
      </div>
      <div className="body">
        <div>
          <div className="brand-label">{product.brand}</div>
          <h4>{product.name}</h4>
          <p className="desc">{product.description}</p>
        </div>
        {showPrices && (
          <div className="price-row">
            <div>
              <div className="price">{fmt(product.price)}</div>
              <div className="unit-label">por {product.unit}</div>
            </div>
            <div className="min-order">
              mín. {product.min_order} {product.unit}
            </div>
          </div>
        )}
        <div className="actions">
          <div className="add-row">
            <div className="stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <input
                type="number"
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button
              className="btn btn-primary"
              disabled={!product.in_stock}
              onClick={() => onAdd(product, qty)}
              style={{ position: "relative" }}
            >
              {inCartQty > 0 ? `Adicionar (${inCartQty})` : "Adicionar"}
            </button>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-link"
            style={{
              opacity: product.in_stock ? 1 : 0.45,
              pointerEvents: product.in_stock ? "auto" : "none",
            }}
          >
            Pedir via WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

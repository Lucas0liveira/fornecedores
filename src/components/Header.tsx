"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/store/cart";

interface Props {
  title?: string;
  logoUrl?: string;
}

export function Header({ title = "Arapuá Marketplace", logoUrl }: Props) {
  const count = useCart((s) => s.count());

  return (
    <header className="app-hd">
      <div className="container app-hd-row">
        <Link href="/" className="brand">
          <span
            className="brand-mark"
            style={logoUrl ? { background: "transparent", padding: 0 } : {}}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            ) : (
              title[0]
            )}
          </span>
          <span className="brand-name">{title}</span>
        </Link>

        <nav>
          <Link href="/">Fornecedores</Link>
        </nav>

        <div className="spacer" />

        <Link href="/cart" className="cart-pill">
          <ShoppingCart size={15} />
          <span>Carrinho</span>
          <span className="count">{count}</span>
        </Link>
      </div>
    </header>
  );
}

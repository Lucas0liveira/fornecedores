"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

const UNITS = ["kg", "L", "un", "pct", "cx", "gl", "lata", "pote", "rolo", "maço", "dúzia", "bdj", "gf", "cento"];

interface Props {
  supplierId: string;
  product?: Product;
}

export function ProductForm({ supplierId, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    unit: product?.unit ?? "kg",
    price: product?.price?.toString() ?? "",
    min_order: product?.min_order?.toString() ?? "1",
    description: product?.description ?? "",
    in_stock: product?.in_stock ?? true,
    image: product?.image ?? "",
    keyword: product?.keyword ?? "",
  });

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const price = parseFloat(form.price);
    const min_order = parseInt(form.min_order, 10);
    if (isNaN(price) || price <= 0) {
      setError("Preço inválido.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const payload = {
      supplier_id: supplierId,
      name: form.name.trim(),
      brand: form.brand.trim(),
      unit: form.unit,
      price: Math.round(price * 100) / 100,
      min_order: isNaN(min_order) ? 1 : min_order,
      description: form.description.trim(),
      in_stock: form.in_stock,
      image: form.image.trim(),
      keyword: form.keyword.trim(),
    };

    const { error: dbError } = isEdit
      ? await supabase.from("products").update(payload).eq("id", product!.id)
      : await supabase.from("products").insert(payload);

    setLoading(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    router.push(`/admin/suppliers/${supplierId}/products`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-card">
        {error && (
          <div className="alert-error" style={{ marginBottom: 18 }}>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-field full">
            <label className="form-label">Nome do produto</label>
            <input
              className="form-input"
              value={form.name}
              onChange={set("name")}
              placeholder="Banana Prata"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Marca / Fornecedor</label>
            <input
              className="form-input"
              value={form.brand}
              onChange={set("brand")}
              placeholder="Sítio Boa Vista"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Unidade</label>
            <select
              className="form-input"
              value={form.unit}
              onChange={set("unit")}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Preço (R$)</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              value={form.price}
              onChange={set("price")}
              placeholder="6.90"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Pedido mínimo</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.min_order}
              onChange={set("min_order")}
              placeholder="1"
            />
          </div>

          <div className="form-field full">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-input"
              value={form.description}
              onChange={set("description")}
              placeholder="Cacho com pencas firmes, ponto de maduração regular."
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-field full">
            <label className="form-label">Link da foto do produto (opcional)</label>
            <input
              className="form-input"
              value={form.image}
              onChange={set("image")}
              placeholder="https://exemplo.com/foto.jpg — deixe vazio para gerar automaticamente"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Palavra-chave para foto automática</label>
            <input
              className="form-input"
              value={form.keyword}
              onChange={set("keyword")}
              placeholder="ex: banana"
            />
          </div>

          <div className="form-field" style={{ justifyContent: "flex-end" }}>
            <label className="checkbox-label" style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, in_stock: e.target.checked }))
                }
              />
              Em estoque
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar produto"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => router.back()}
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

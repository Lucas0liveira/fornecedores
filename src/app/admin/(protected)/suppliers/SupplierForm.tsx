"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Supplier } from "@/lib/types";

const CATEGORIES = [
  "Hortifruti",
  "Açougue",
  "Laticínios",
  "Panificação",
  "Mercearia",
  "Bebidas",
  "Limpeza",
  "Embalagens",
  "Doces",
  "Congelados",
  "Cafés e Chás",
  "Pescados",
];

interface Props {
  supplier?: Supplier;
}

export function SupplierForm({ supplier }: Props) {
  const router = useRouter();
  const isEdit = !!supplier;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: supplier?.id ?? "",
    name: supplier?.name ?? "",
    tagline: supplier?.tagline ?? "",
    category: supplier?.category ?? CATEGORIES[0],
    whatsapp: supplier?.whatsapp ?? "",
    address: supplier?.address ?? "",
    cnpj: supplier?.cnpj ?? "",
    hero: supplier?.hero ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.id.trim()) {
      setError("O ID do fornecedor é obrigatório.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const payload = {
      id: form.id.trim().toLowerCase().replace(/\s+/g, "-"),
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      category: form.category,
      whatsapp: form.whatsapp.trim().replace(/\D/g, ""),
      address: form.address.trim(),
      cnpj: form.cnpj.trim(),
      hero: form.hero.trim(),
    };

    const { error: dbError } = isEdit
      ? await supabase.from("suppliers").update(payload).eq("id", supplier!.id)
      : await supabase.from("suppliers").insert(payload);

    if (dbError) {
      setLoading(false);
      setError(dbError.message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        user_name: user.user_metadata?.name ?? user.email ?? "Usuário",
        action: isEdit ? "atualizou" : "criou",
        entity_type: "fornecedor",
        entity_name: payload.name,
      });
    }

    setLoading(false);
    router.push("/admin/suppliers");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-card">
        {error && <div className="alert-error" style={{ marginBottom: 18 }}>{error}</div>}

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Código único do fornecedor</label>
            <input
              className="form-input"
              value={form.id}
              onChange={set("id")}
              placeholder="ex: hortifruti-verde (só letras, números e hífen)"
              disabled={isEdit}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Categoria</label>
            <select className="form-input" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-field full">
            <label className="form-label">Nome do fornecedor</label>
            <input
              className="form-input"
              value={form.name}
              onChange={set("name")}
              placeholder="Hortifruti Verde Vale"
              required
            />
          </div>

          <div className="form-field full">
            <label className="form-label">Frase de apresentação</label>
            <input
              className="form-input"
              value={form.tagline}
              onChange={set("tagline")}
              placeholder="Frutas, legumes e verduras direto do produtor"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Número do WhatsApp</label>
            <input
              className="form-input"
              value={form.whatsapp}
              onChange={set("whatsapp")}
              placeholder="5511987654321 (código do país + DDD + número)"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">CNPJ</label>
            <input
              className="form-input"
              value={form.cnpj}
              onChange={set("cnpj")}
              placeholder="00.000.000/0001-00"
            />
          </div>

          <div className="form-field full">
            <label className="form-label">Endereço</label>
            <input
              className="form-input"
              value={form.address}
              onChange={set("address")}
              placeholder="Rua Exemplo, 123 — Bairro"
            />
          </div>

          <div className="form-field full">
            <label className="form-label">Palavra-chave para foto de capa</label>
            <input
              className="form-input"
              value={form.hero}
              onChange={set("hero")}
              placeholder="ex: frutas, hortifruti, açougue"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar fornecedor"}
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

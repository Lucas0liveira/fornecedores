"use client";

import { useTransition, useState } from "react";
import type { SiteConfig } from "@/lib/siteConfig";
import { saveSiteConfig } from "./actions";

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 44,
            height: 36,
            padding: 2,
            border: "1px solid var(--border-strong)",
            cursor: "pointer",
            background: "none",
            flexShrink: 0,
          }}
        />
        <input
          className="form-input"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
          pattern="^#[0-9a-fA-F]{6}$"
          required
        />
      </div>
    </div>
  );
}

export function SiteConfigForm({ config }: { config: SiteConfig }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(config);

  const set = (k: keyof SiteConfig, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveSiteConfig(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {saved && (
        <div className="alert-success" style={{ marginBottom: 24 }}>
          ✓ Configurações salvas com sucesso!
        </div>
      )}

      {/* Identity */}
      <div className="form-card" style={{ marginBottom: 24, maxWidth: "none" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
          Identidade
        </h2>
        <div className="form-grid">
          <div className="form-field full">
            <label className="form-label">Nome do site</label>
            <input
              className="form-input"
              name="site_title"
              value={form.site_title}
              onChange={(e) => set("site_title", e.target.value)}
              required
            />
          </div>
          <div className="form-field full">
            <label className="form-label">Texto da página inicial</label>
            <input
              className="form-input"
              name="hero_text"
              value={form.hero_text}
              onChange={(e) => set("hero_text", e.target.value)}
              placeholder="Explore nossos fornecedores e monte seu pedido."
            />
          </div>
          <div className="form-field full">
            <label className="form-label">URL do logo (opcional)</label>
            <input
              className="form-input"
              name="logo_url"
              value={form.logo_url}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://exemplo.com/logo.png — deixe vazio para usar a inicial do nome"
            />
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="form-card" style={{ marginBottom: 24, maxWidth: "none" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Preços
        </h2>
        <label className="checkbox-label" style={{ fontSize: 14 }}>
          <input
            type="checkbox"
            name="show_prices"
            value="true"
            checked={form.show_prices}
            onChange={(e) => set("show_prices", e.target.checked)}
          />
          Exibir preços dos produtos no catálogo
        </label>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 8,
            fontFamily: "var(--font-mono)",
          }}
        >
          Quando desativado, os preços ficam ocultos — alunos negociam
          diretamente com o fornecedor.
        </p>
      </div>

      {/* Colors */}
      <div className="form-card" style={{ marginBottom: 24, maxWidth: "none" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
          Cores
        </h2>
        <div className="form-grid">
          <ColorField
            label="Cor principal"
            name="primary_color"
            value={form.primary_color}
            onChange={(v) => set("primary_color", v)}
          />
          <ColorField
            label="Cor de destaque"
            name="accent_color"
            value={form.accent_color}
            onChange={(v) => set("accent_color", v)}
          />
        </div>
      </div>

      {/* Background */}
      <div className="form-card" style={{ marginBottom: 24, maxWidth: "none" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
          Fundo
        </h2>
        <div className="form-grid">
          <div className="form-field full">
            <label className="form-label">Tipo de fundo</label>
            <select
              className="form-input"
              name="bg_type"
              value={form.bg_type}
              onChange={(e) =>
                set("bg_type", e.target.value as "plain" | "gradient")
              }
            >
              <option value="plain">Cor sólida</option>
              <option value="gradient">Gradiente orgânico</option>
            </select>
          </div>
          <ColorField
            label="Cor de fundo"
            name="bg_color"
            value={form.bg_color}
            onChange={(v) => set("bg_color", v)}
          />
          <div className="form-field" />

          {form.bg_type === "gradient" ? (
            <>
              <ColorField
                label="Cor do gradiente 1"
                name="grad_color_1"
                value={form.grad_color_1}
                onChange={(v) => set("grad_color_1", v)}
              />
              <ColorField
                label="Cor do gradiente 2"
                name="grad_color_2"
                value={form.grad_color_2}
                onChange={(v) => set("grad_color_2", v)}
              />
            </>
          ) : (
            <>
              <input type="hidden" name="grad_color_1" value={form.grad_color_1} />
              <input type="hidden" name="grad_color_2" value={form.grad_color_2} />
            </>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}

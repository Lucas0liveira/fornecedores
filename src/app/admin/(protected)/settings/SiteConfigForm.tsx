"use client";

import { useTransition, useState } from "react";
import { CheckCircle } from "lucide-react";
import type { SiteConfig } from "@/lib/siteConfig";
import { saveSiteConfig } from "./actions";

function ColorField({
  label,
  name,
  value,
  hint,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  hint?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {hint && <span className="hint" style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>{hint}</span>}
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 44,
            height: 38,
            padding: 2,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
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
        <div className="alert alert-success">
          <CheckCircle size={15} />
          Configurações salvas! O site público já reflete as mudanças.
        </div>
      )}

      {/* Identity */}
      <div className="admin-card">
        <h2>Identidade</h2>
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
            <textarea
              className="form-input"
              name="hero_text"
              value={form.hero_text}
              onChange={(e) => set("hero_text", e.target.value)}
              placeholder="Explore nossos fornecedores e monte seu pedido."
            />
          </div>
          <div className="form-field full">
            <label className="form-label">
              Imagem do hero
              <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>
                (URL da foto exibida à direita do hero — deixe vazio para mostrar o placeholder)
              </span>
            </label>
            <input
              className="form-input"
              name="hero_image"
              value={form.hero_image}
              onChange={(e) => set("hero_image", e.target.value)}
              placeholder="https://exemplo.com/foto-hero.jpg"
            />
            {form.hero_image && (
              <div style={{ marginTop: 8, borderRadius: "var(--radius-sm)", overflow: "hidden", maxWidth: 320, border: "1px solid var(--border)" }}>
                <img src={form.hero_image} alt="Preview" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
              </div>
            )}
          </div>
          <div className="form-field full">
            <label className="form-label">
              URL do logo
              <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>
                (deixe vazio para usar a inicial do nome)
              </span>
            </label>
            <input
              className="form-input"
              name="logo_url"
              value={form.logo_url}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
          <div className="form-field full">
            <label className="form-label">
              E-mail de contato para vendedores
              <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>
                (exibido no botão "Sou Vendedor" da home)
              </span>
            </label>
            <input
              className="form-input"
              type="email"
              name="contact_email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
              placeholder="contato@escola.com"
            />
            <span className="form-hint">
              Quando preenchido, aparece o botão "Sou Vendedor" na home abrindo o app de e-mail do visitante.
            </span>
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="admin-card">
        <h2>Catálogo</h2>
        <label className="checkbox-label" style={{ fontSize: 14 }}>
          <input
            type="checkbox"
            name="show_prices"
            value="true"
            checked={form.show_prices}
            onChange={(e) => set("show_prices", e.target.checked)}
          />
          Exibir preços dos produtos no catálogo público
        </label>
        <p className="form-hint" style={{ marginTop: 8 }}>
          Quando desativado, os preços ficam ocultos — alunos negociam
          diretamente com o fornecedor pelo WhatsApp.
        </p>
      </div>

      {/* Colors */}
      <div className="admin-card">
        <h2>Cores</h2>
        <div className="form-grid">
          <ColorField
            label="Cor principal"
            hint="botões, títulos, logo"
            name="primary_color"
            value={form.primary_color}
            onChange={(v) => set("primary_color", v)}
          />
          <ColorField
            label="Cor de destaque"
            hint="badges, acentos"
            name="accent_color"
            value={form.accent_color}
            onChange={(v) => set("accent_color", v)}
          />
        </div>
      </div>

      {/* Background */}
      <div className="admin-card">
        <h2>Fundo da loja</h2>
        <div className="form-grid">
          <div className="form-field full">
            <label className="form-label">Tipo de fundo</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={`btn ${form.bg_type === "gradient" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => set("bg_type", "gradient")}
              >
                Gradiente orgânico
              </button>
              <button
                type="button"
                className={`btn ${form.bg_type === "plain" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => set("bg_type", "plain")}
              >
                Cor sólida
              </button>
            </div>
            <input type="hidden" name="bg_type" value={form.bg_type} />
          </div>

          <ColorField
            label="Cor de fundo base"
            name="bg_color"
            value={form.bg_color}
            onChange={(v) => set("bg_color", v)}
          />
          <div />

          {form.bg_type === "gradient" ? (
            <>
              <ColorField
                label="Gradiente — Cor 1"
                name="grad_color_1"
                value={form.grad_color_1}
                onChange={(v) => set("grad_color_1", v)}
              />
              <ColorField
                label="Gradiente — Cor 2"
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

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? "Salvando…" : "Salvar configurações"}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-lg"
          onClick={() => setForm(config)}
        >
          Descartar mudanças
        </button>
      </div>
    </form>
  );
}

-- ── Loja Logística — Database Schema ────────────────────────────────
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

-- ── Tables ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  tagline     TEXT,
  category    TEXT,
  whatsapp    TEXT,
  address     TEXT,
  cnpj        TEXT,
  hero        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          BIGSERIAL PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  brand       TEXT,
  unit        TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order   INTEGER DEFAULT 1,
  description TEXT,
  in_stock    BOOLEAN DEFAULT TRUE,
  image       TEXT,
  keyword     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read
CREATE POLICY "public_read_suppliers" ON suppliers
  FOR SELECT USING (true);

CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (true);

-- Authenticated users (admins) have full access
CREATE POLICY "auth_all_suppliers" ON suppliers
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth_all_products" ON products
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── Indexes ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products (supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_name     ON products (name);

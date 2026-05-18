-- site_config: key-value store for site customization
CREATE TABLE IF NOT EXISTS site_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public can read (needed for public-facing pages)
CREATE POLICY "public_read_config" ON site_config
  FOR SELECT USING (true);

-- Only teachers can write
CREATE POLICY "teacher_write_config" ON site_config
  FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  );

-- Default values (DO NOTHING = safe to re-run)
INSERT INTO site_config (key, value) VALUES
  ('show_prices',   'true'),
  ('site_title',    'Arapuá Marketplace'),
  ('hero_text',     'Explore nossos fornecedores e monte seu pedido.'),
  ('logo_url',      ''),
  ('primary_color', '#15140f'),
  ('accent_color',  '#b4321a'),
  ('bg_type',       'plain'),
  ('bg_color',      '#fafaf7'),
  ('grad_color_1',  '#c8e6c9'),
  ('grad_color_2',  '#fff9c4')
ON CONFLICT (key) DO NOTHING;

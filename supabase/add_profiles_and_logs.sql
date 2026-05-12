-- ── Loja Logística — Profiles & Activity Log ─────────────────────
-- Run this in the Supabase SQL editor AFTER schema.sql

-- ── Profiles ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name    TEXT NOT NULL,
  role    TEXT NOT NULL DEFAULT 'student'
            CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read profiles (needed for log display)
CREATE POLICY "auth_read_profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── Auto-create profile on new user ───────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Promote existing users to teacher ─────────────────────────────
-- This inserts a 'teacher' profile for every auth user that existed
-- before this migration (i.e. the teacher account you already created).
-- Safe to run multiple times — ON CONFLICT DO NOTHING.

INSERT INTO profiles (id, name, role)
SELECT id,
       COALESCE(raw_user_meta_data->>'name', email),
       'teacher'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ── Activity Log ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL,
  action      TEXT NOT NULL,       -- 'criou', 'atualizou', 'excluiu'
  entity_type TEXT NOT NULL,       -- 'fornecedor', 'produto'
  entity_name TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Teachers can read all activity
CREATE POLICY "teacher_read_activity" ON activity_log
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  );

-- Authenticated users can log their own actions
CREATE POLICY "auth_insert_activity" ON activity_log
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
  );

CREATE INDEX IF NOT EXISTS idx_activity_user    ON activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log (created_at DESC);

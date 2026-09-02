-- ====================================================================
-- VENTURE ATLAS: SUPABASE AUTH PROFILES TRIGGER
-- Migration: 20260901000002_auth_triggers.sql
-- Database: Supabase PostgreSQL
-- ====================================================================

-- Trigger to automatically create a profile in public.profiles when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_name text;
  v_avatar text;
  v_bio text;
BEGIN
  -- Extract name from metadata or email username
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Determine initial role (admin/editor/writer/reader)
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'READER'::public.user_role);
  EXCEPTION WHEN OTHERS THEN
    v_role := 'READER'::public.user_role;
  END;

  v_avatar := NEW.raw_user_meta_data->>'avatar';
  v_bio := NEW.raw_user_meta_data->>'bio';

  INSERT INTO public.profiles (id, email, name, role, avatar, bio, plan)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    v_avatar,
    v_bio,
    CASE WHEN v_role IN ('ADMIN', 'EDITOR') THEN 'PRO'::public.plan_tier ELSE 'FREE'::public.plan_tier END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, public.profiles.avatar),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

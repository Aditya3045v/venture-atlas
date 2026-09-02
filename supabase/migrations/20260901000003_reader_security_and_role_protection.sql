-- ====================================================================
-- VENTURE ATLAS: READER SECURITY, RPC FUNCTIONS & ROLE SELF-ELEVATION LOCKDOWN
-- Migration: 20260901000003_reader_security_and_role_protection.sql
-- ====================================================================

-- 1. Extend Newsletter Subscribers with Reader Identity & Consent
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS reader_id UUID;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';

-- 2. Extend Likes Table with Reader ID (Device-Scoped)
ALTER TABLE likes ADD COLUMN IF NOT EXISTS reader_id UUID;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS unique_article_reader;
ALTER TABLE likes ADD CONSTRAINT unique_article_reader UNIQUE (article_id, reader_id);

-- 3. Extend Bookmarks Table with Reader ID (Device-Scoped)
ALTER TABLE bookmarks ALTER COLUMN profile_id DROP NOT NULL;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS reader_id UUID;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS unique_reader_article_bookmark;
ALTER TABLE bookmarks ADD CONSTRAINT unique_reader_article_bookmark UNIQUE (reader_id, article_id);

-- 4. Extend Comments Table with Reader Identity & Unverified Email
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reader_id UUID;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_name TEXT;

-- 5. Seed Required 5 Desks
INSERT INTO categories (name, slug, description, color, display_order)
VALUES
  ('Unicorn', 'unicorn', 'Billion-dollar valuations, decacorns, blitzscaling, and late-stage venture rounds', '#EC4899', 1),
  ('Failure', 'failure', 'Post-mortems, shutdown autopsies, failed pivots, and cautionary startup lessons', '#EF4444', 2),
  ('Finance', 'finance', 'Fintech rails, debt financing, treasury management, liquidity, and venture lending', '#10B981', 3),
  ('Crypto Web3', 'crypto-web3', 'Layer-1 networks, DeFi liquidity protocols, zero-knowledge proofs, and sovereign token economics', '#06B6D4', 4),
  ('Founder Biography', 'founder-biography', 'In-depth portraits, early operator origins, founder journeys, and mental models', '#F59E0B', 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order;

-- ====================================================================
-- 6. SECURITY DEFINER FUNCTIONS FOR UNPRIVILEGED READERS
-- Readers are 'anon'. These functions accept verified reader_id and
-- CANNOT modify profiles, articles, blog_posts, case_studies, or audit_logs.
-- ====================================================================

-- Function A: Reader Subscribe / Entry
CREATE OR REPLACE FUNCTION public.reader_subscribe(
  p_reader_id UUID,
  p_email TEXT,
  p_source TEXT DEFAULT 'LANDING_PAGE'
)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_is_new BOOLEAN := false;
BEGIN
  SELECT id INTO v_existing_id FROM newsletter_subscribers WHERE email = lower(trim(p_email));
  
  IF v_existing_id IS NULL THEN
    INSERT INTO newsletter_subscribers (reader_id, email, source, consent_at, status)
    VALUES (p_reader_id, lower(trim(p_email)), p_source, NOW(), 'ACTIVE');
    v_is_new := true;
  ELSE
    UPDATE newsletter_subscribers
    SET reader_id = p_reader_id, consent_at = NOW(), status = 'ACTIVE'
    WHERE id = v_existing_id;
    v_is_new := false;
  END IF;

  RETURN jsonb_build_object('success', true, 'isNewReader', v_is_new);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function B: Reader Toggle Like
CREATE OR REPLACE FUNCTION public.reader_toggle_like(
  p_reader_id UUID,
  p_article_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_liked BOOLEAN;
  v_new_count INT;
BEGIN
  IF p_reader_id IS NULL OR p_article_id IS NULL THEN
    RAISE EXCEPTION 'Invalid reader_id or article_id';
  END IF;

  SELECT id INTO v_existing_id FROM likes WHERE reader_id = p_reader_id AND article_id = p_article_id;

  IF v_existing_id IS NOT NULL THEN
    DELETE FROM likes WHERE id = v_existing_id;
    v_liked := false;
  ELSE
    INSERT INTO likes (reader_id, article_id) VALUES (p_reader_id, p_article_id);
    v_liked := true;
  END IF;

  SELECT count(*) INTO v_new_count FROM likes WHERE article_id = p_article_id;

  RETURN jsonb_build_object('success', true, 'liked', v_liked, 'likeCount', v_new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function C: Reader Toggle Bookmark
CREATE OR REPLACE FUNCTION public.reader_toggle_bookmark(
  p_reader_id UUID,
  p_article_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_saved BOOLEAN;
BEGIN
  IF p_reader_id IS NULL OR p_article_id IS NULL THEN
    RAISE EXCEPTION 'Invalid reader_id or article_id';
  END IF;

  SELECT id INTO v_existing_id FROM bookmarks WHERE reader_id = p_reader_id AND article_id = p_article_id;

  IF v_existing_id IS NOT NULL THEN
    DELETE FROM bookmarks WHERE id = v_existing_id;
    v_saved := false;
  ELSE
    INSERT INTO bookmarks (reader_id, article_id) VALUES (p_reader_id, p_article_id);
    v_saved := true;
  END IF;

  RETURN jsonb_build_object('success', true, 'saved', v_saved);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function D: Reader Submit Comment (Always PENDING)
CREATE OR REPLACE FUNCTION public.reader_submit_comment(
  p_reader_id UUID,
  p_article_id UUID,
  p_email TEXT,
  p_content TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_clean_email TEXT;
  v_name TEXT;
  v_comment_id UUID;
BEGIN
  IF p_reader_id IS NULL OR p_article_id IS NULL OR p_email IS NULL OR trim(p_content) = '' THEN
    RAISE EXCEPTION 'Missing required fields for comment submission';
  END IF;

  v_clean_email := lower(trim(p_email));
  v_name := split_part(v_clean_email, '@', 1) || ' (unverified)';

  INSERT INTO comments (
    article_id,
    entity_type,
    entity_id,
    reader_id,
    user_email,
    user_name,
    body,
    status
  ) VALUES (
    p_article_id,
    'ARTICLE',
    p_article_id,
    p_reader_id,
    v_clean_email,
    v_name,
    trim(p_content),
    'PENDING'
  ) RETURNING id INTO v_comment_id;

  RETURN jsonb_build_object(
    'success', true,
    'commentId', v_comment_id,
    'status', 'PENDING',
    'message', 'Submitted for editorial review.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 7. STAFF ROLE ELEVATION PROTECTION TRIGGER (Item 15)
-- Prevents a staff user from changing their own role or any non-admin
-- from altering role assignments.
-- ====================================================================
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Check if current authenticated user is an ADMIN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'PERMISSION_DENIED: Only administrators can assign or alter user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_self_role_change ON profiles;
CREATE TRIGGER tr_prevent_self_role_change
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change();

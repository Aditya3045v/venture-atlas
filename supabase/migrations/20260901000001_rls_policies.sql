-- ====================================================================
-- VENTURE ATLAS: ROW LEVEL SECURITY (RLS) LOCKDOWN & POLICIES
-- Migration: 20260901000001_rls_policies.sql
-- Database: Supabase PostgreSQL
-- ====================================================================

-- 1. Security Helper Functions for Role Resolution
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'READER'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (public.get_auth_user_role() = 'ADMIN'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean AS $$
BEGIN
  RETURN (public.get_auth_user_role() IN ('ADMIN'::user_role, 'EDITOR'::user_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN (public.get_auth_user_role() IN ('ADMIN'::user_role, 'EDITOR'::user_role, 'WRITER'::user_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ====================================================================
-- 2. PROFILES TABLE RLS
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile or admin" ON profiles;
CREATE POLICY "Users can insert their own profile or admin"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile or admin" ON profiles;
CREATE POLICY "Users can update own profile or admin"
ON profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;
CREATE POLICY "Only admins can delete profiles"
ON profiles FOR DELETE
USING (public.is_admin());


-- ====================================================================
-- 3. CATEGORIES TABLE RLS
-- ====================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are readable by everyone" ON categories;
CREATE POLICY "Categories are readable by everyone"
ON categories FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Staff can manage categories" ON categories;
CREATE POLICY "Staff can manage categories"
ON categories FOR ALL
USING (public.is_admin_or_editor())
WITH CHECK (public.is_admin_or_editor());


-- ====================================================================
-- 4. ARTICLES TABLE RLS
-- ====================================================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Articles select policy" ON articles;
CREATE POLICY "Articles select policy"
ON articles FOR SELECT
USING (
  status = 'PUBLISHED'
  OR author_id = auth.uid()
  OR public.is_staff()
);

DROP POLICY IF EXISTS "Staff can create articles" ON articles;
CREATE POLICY "Staff can create articles"
ON articles FOR INSERT
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Authors can update own articles, editors/admins can update any" ON articles;
CREATE POLICY "Authors can update own articles, editors/admins can update any"
ON articles FOR UPDATE
USING (author_id = auth.uid() OR public.is_admin_or_editor())
WITH CHECK (author_id = auth.uid() OR public.is_admin_or_editor());

DROP POLICY IF EXISTS "Editors and admins can delete articles" ON articles;
CREATE POLICY "Editors and admins can delete articles"
ON articles FOR DELETE
USING (public.is_admin_or_editor());


-- ====================================================================
-- 5. BLOG POSTS TABLE RLS
-- ====================================================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blog posts select policy" ON blog_posts;
CREATE POLICY "Blog posts select policy"
ON blog_posts FOR SELECT
USING (
  status = 'PUBLISHED'
  OR author_id = auth.uid()
  OR public.is_staff()
);

DROP POLICY IF EXISTS "Staff can create blog posts" ON blog_posts;
CREATE POLICY "Staff can create blog posts"
ON blog_posts FOR INSERT
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Authors or editors/admins can update blog posts" ON blog_posts;
CREATE POLICY "Authors or editors/admins can update blog posts"
ON blog_posts FOR UPDATE
USING (author_id = auth.uid() OR public.is_admin_or_editor())
WITH CHECK (author_id = auth.uid() OR public.is_admin_or_editor());

DROP POLICY IF EXISTS "Editors/admins can delete blog posts" ON blog_posts;
CREATE POLICY "Editors/admins can delete blog posts"
ON blog_posts FOR DELETE
USING (public.is_admin_or_editor());


-- ====================================================================
-- 6. CASE STUDIES TABLE RLS
-- ====================================================================
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Case studies select policy" ON case_studies;
CREATE POLICY "Case studies select policy"
ON case_studies FOR SELECT
USING (
  status = 'PUBLISHED'
  OR author_id = auth.uid()
  OR public.is_staff()
);

DROP POLICY IF EXISTS "Staff can manage case studies" ON case_studies;
CREATE POLICY "Staff can manage case studies"
ON case_studies FOR ALL
USING (public.is_staff())
WITH CHECK (public.is_staff());


-- ====================================================================
-- 7. LIKES TABLE RLS
-- ====================================================================
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
CREATE POLICY "Likes are viewable by everyone"
ON likes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can register a like" ON likes;
CREATE POLICY "Anyone can register a like"
ON likes FOR INSERT
WITH CHECK (
  profile_id = auth.uid()
  OR (profile_id IS NULL AND ip_hash IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can remove their own like" ON likes;
CREATE POLICY "Users can remove their own like"
ON likes FOR DELETE
USING (
  profile_id = auth.uid()
  OR (profile_id IS NULL AND ip_hash IS NOT NULL)
  OR public.is_admin()
);


-- ====================================================================
-- 8. BOOKMARKS TABLE RLS
-- ====================================================================
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
CREATE POLICY "Users can insert own bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks FOR DELETE
USING (profile_id = auth.uid());


-- ====================================================================
-- 9. COMMENTS TABLE RLS
-- ====================================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments select policy" ON comments;
CREATE POLICY "Comments select policy"
ON comments FOR SELECT
USING (
  status = 'APPROVED'
  OR profile_id = auth.uid()
  OR public.is_staff()
);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own comment or staff moderate" ON comments;
CREATE POLICY "Users can update own comment or staff moderate"
ON comments FOR UPDATE
USING (profile_id = auth.uid() OR public.is_staff())
WITH CHECK (profile_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Users or staff can delete comments" ON comments;
CREATE POLICY "Users or staff can delete comments"
ON comments FOR DELETE
USING (profile_id = auth.uid() OR public.is_staff());


-- ====================================================================
-- 10. NEWSLETTER SUBSCRIBERS TABLE RLS
-- ====================================================================
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view subscribers" ON newsletter_subscribers;
CREATE POLICY "Staff can view subscribers"
ON newsletter_subscribers FOR SELECT
USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON newsletter_subscribers FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can delete subscribers"
ON newsletter_subscribers FOR DELETE
USING (public.is_admin());


-- ====================================================================
-- 11. MEDIA ASSETS TABLE RLS
-- ====================================================================
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media assets viewable by everyone" ON media_assets;
CREATE POLICY "Media assets viewable by everyone"
ON media_assets FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Staff can manage media assets" ON media_assets;
CREATE POLICY "Staff can manage media assets"
ON media_assets FOR ALL
USING (public.is_staff())
WITH CHECK (public.is_staff());


-- ====================================================================
-- 12. VIEW EVENTS TABLE RLS
-- ====================================================================
ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record a view event" ON view_events;
CREATE POLICY "Anyone can record a view event"
ON view_events FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view analytics events" ON view_events;
CREATE POLICY "Staff can view analytics events"
ON view_events FOR SELECT
USING (public.is_staff());


-- ====================================================================
-- 13. AUDIT LOGS TABLE RLS
-- ====================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs can be created" ON audit_logs;
CREATE POLICY "Audit logs can be created"
ON audit_logs FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
USING (public.is_admin());

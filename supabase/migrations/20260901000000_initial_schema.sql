-- ====================================================================
-- VENTURE ATLAS: CORE POSTGRES SCHEMA MIGRATION
-- Migration: 20260901000000_initial_schema.sql
-- Database: Supabase PostgreSQL (Postgres 15+)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Define Custom Enums
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('READER', 'WRITER', 'EDITOR', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_tier AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE comment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Utility Trigger Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. User Profiles Table (Keyed to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'READER',
  avatar TEXT,
  plan plan_tier NOT NULL DEFAULT 'FREE',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'LANDING_PAGE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Content Categories / Desks Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 60-Word Executive Articles / Briefings Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'NEWS',
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT,
  source_author TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cover_image TEXT,
  photo_credit TEXT,
  read_time_minutes INT NOT NULL DEFAULT 1,
  word_count INT NOT NULL DEFAULT 60,
  status content_status NOT NULL DEFAULT 'DRAFT',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Long-Form Editorial Essays Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  read_time_minutes INT NOT NULL DEFAULT 4,
  status content_status NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Startup Architecture & Teardown Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  company_logo TEXT,
  valuation TEXT,
  stage TEXT,
  key_metric TEXT,
  summary TEXT NOT NULL,
  challenge TEXT,
  strategy TEXT,
  outcome TEXT,
  body TEXT NOT NULL,
  cover_image TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  read_time_minutes INT NOT NULL DEFAULT 8,
  status content_status NOT NULL DEFAULT 'PUBLISHED',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_case_studies_updated_at
BEFORE UPDATE ON case_studies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Likes Tracking Table (with strict unique constraints against like farming)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_article_profile UNIQUE (article_id, profile_id),
  CONSTRAINT unique_article_ip UNIQUE (article_id, ip_hash),
  CONSTRAINT unique_case_study_profile UNIQUE (case_study_id, profile_id),
  CONSTRAINT unique_case_study_ip UNIQUE (case_study_id, ip_hash),
  CONSTRAINT unique_blog_post_profile UNIQUE (blog_post_id, profile_id),
  CONSTRAINT unique_blog_post_ip UNIQUE (blog_post_id, ip_hash)
);

-- 11. Trigger to maintain derived like_count synchronously
CREATE OR REPLACE FUNCTION sync_entity_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.article_id IS NOT NULL THEN
      UPDATE articles SET like_count = (SELECT count(*) FROM likes WHERE article_id = NEW.article_id) WHERE id = NEW.article_id;
    END IF;
    IF NEW.case_study_id IS NOT NULL THEN
      UPDATE case_studies SET like_count = (SELECT count(*) FROM likes WHERE case_study_id = NEW.case_study_id) WHERE id = NEW.case_study_id;
    END IF;
    IF NEW.blog_post_id IS NOT NULL THEN
      UPDATE blog_posts SET like_count = (SELECT count(*) FROM likes WHERE blog_post_id = NEW.blog_post_id) WHERE id = NEW.blog_post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.article_id IS NOT NULL THEN
      UPDATE articles SET like_count = (SELECT count(*) FROM likes WHERE article_id = OLD.article_id) WHERE id = OLD.article_id;
    END IF;
    IF OLD.case_study_id IS NOT NULL THEN
      UPDATE case_studies SET like_count = (SELECT count(*) FROM likes WHERE case_study_id = OLD.case_study_id) WHERE id = OLD.case_study_id;
    END IF;
    IF OLD.blog_post_id IS NOT NULL THEN
      UPDATE blog_posts SET like_count = (SELECT count(*) FROM likes WHERE blog_post_id = OLD.blog_post_id) WHERE id = OLD.blog_post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION sync_entity_like_count();

-- 12. Bookmarks / Personal Reading Library Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_profile_article_bookmark UNIQUE (profile_id, article_id)
);

-- 13. Comments Moderation Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL DEFAULT 'ARTICLE', -- 'ARTICLE', 'CASE_STUDY', 'BLOG'
  entity_id UUID NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  status comment_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Media Library & Upload Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INT NOT NULL,
  width INT,
  height INT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. View Events Analytics Table
CREATE TABLE IF NOT EXISTS view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Trigger to maintain derived view_count synchronously
CREATE OR REPLACE FUNCTION sync_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE articles SET view_count = (SELECT count(*) FROM view_events WHERE article_id = NEW.article_id) WHERE id = NEW.article_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_view_count
AFTER INSERT ON view_events
FOR EACH ROW EXECUTE FUNCTION sync_article_view_count();

-- 17. Immutable Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Performance & Search Indexes
CREATE INDEX IF NOT EXISTS idx_articles_status_pub ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_cat_status ON articles(category_id, status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_trgm_title ON articles USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_articles_trgm_summary ON articles USING gin(summary gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_pub ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

CREATE INDEX IF NOT EXISTS idx_case_studies_status_pub ON case_studies(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);

CREATE INDEX IF NOT EXISTS idx_likes_article ON likes(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_case_study ON likes(case_study_id);
CREATE INDEX IF NOT EXISTS idx_likes_blog ON likes(blog_post_id);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_view_events_article ON view_events(article_id);
CREATE INDEX IF NOT EXISTS idx_view_events_created_at ON view_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

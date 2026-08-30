-- ==============================================================================
-- VENTURE ATLAS — PRODUCTION SUPABASE POSTGRESQL SCHEMA & INITIAL SEED
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/fckmhqyhglfnqhpjzrvu/sql)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Users Table (Synced with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER', -- 'USER', 'AUTHOR', 'EDITOR', 'ADMIN'
    avatar TEXT,
    plan TEXT NOT NULL DEFAULT 'FREE',
    bio TEXT,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL DEFAULT 'LANDING_PAGE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Articles Table (60-Word Executive Briefs)
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL DEFAULT 'NEWS',
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT,
    source_author TEXT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    cover_image TEXT,
    photo_credit TEXT,
    read_time_minutes INTEGER NOT NULL DEFAULT 1,
    word_count INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'PUBLISHED', -- 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_trending BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Article Tags Junction
CREATE TABLE IF NOT EXISTS public.article_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    UNIQUE(article_id, tag_id)
);

-- 8. Long-Form Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    cover_image TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    read_time_minutes INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Architectural Case Studies Table
CREATE TABLE IF NOT EXISTS public.case_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    read_time_minutes INTEGER NOT NULL DEFAULT 8,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- 11. Media Assets Table
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 14. Public Read Policies
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Published Articles" ON public.articles FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public Read Published Blogs" ON public.blog_posts FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public Read Published Case Studies" ON public.case_studies FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Service Role Full Access" ON public.articles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role Full Access Blogs" ON public.blog_posts FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role Full Access Case Studies" ON public.case_studies FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role Full Access Categories" ON public.categories FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role Full Access Subscribers" ON public.newsletter_subscribers FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 15. Initial Seed Categories
INSERT INTO public.categories (name, slug, description, color, "order")
VALUES 
  ('Startups', 'startups', 'Early-stage companies, seed funding, and disruptive venture models.', '#10B981', 1),
  ('Funding', 'funding', 'Venture capital raises, series rounds, and growth equity infusions.', '#3B82F6', 2),
  ('Venture Capital', 'venture-capital', 'LP fund mechanics, VC firm allocations, and term sheet trends.', '#8B5CF6', 3),
  ('Founders', 'founders', 'Operator playbooks, leadership transitions, and company building.', '#F59E0B', 4),
  ('AI & Tech', 'ai-and-tech', 'Machine learning breakthroughs, compute infrastructure, and chips.', '#EC4899', 5),
  ('Fintech', 'fintech', 'Sovereign payment rails, neobanks, and treasury automation.', '#06B6D4', 6),
  ('Markets & M&A', 'markets-and-m-and-a', 'Public tech equities, IPO pipelines, and strategic acquisitions.', '#6366F1', 7)
ON CONFLICT (slug) DO NOTHING;

-- Migration: Add company column to articles for cross-type entity linking with case studies
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS company text;
CREATE INDEX IF NOT EXISTS idx_articles_company ON public.articles(lower(company));

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchCategories, fetchArticles, fetchBlogs, fetchCaseStudies } from '@/lib/supabase-db';
import { StoryCard } from '@/components/news/StoryCard';
import { CategoryStrip } from '@/components/news/CategoryStrip';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ArticleItem, CategoryItem } from '@/types';
import { constructMetadata, generateItemListJsonLd } from '@/lib/seo';
import { BookOpen, Briefcase, ArrowUpRight } from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map(c => ({
    slug: c.slug,
  }));
}

const CATEGORY_EDITORIAL_COPY: Record<string, string> = {
  unicorn:
    'Real-time intelligence on breakout venture-backed companies crossing the billion-dollar valuation threshold. Our desk monitors mega-rounds, secondary liquidity markets, cap table restructuring, and the mechanics of rapid market capture across private markets.',
  failure:
    'Uncompromising post-mortems and structural autopsies of venture-backed collapses. We dissect flawed unit economics, misaligned incentives, governance breakdowns, and market shifts to deliver rigorous, actionable lessons for operators and investors.',
  finance:
    'The core plumbing of modern capital markets and financial technology. Coverage spans global payments rails, private credit facilities, cross-border treasury infrastructure, and regulatory developments reshaping commercial banking.',
  'crypto-web3':
    'Institutional analysis of decentralized networks, Layer-2 scaling solutions, and digital asset markets. We track real throughput metrics, fee capture mechanics, and the convergence of traditional finance with permissionless protocols.',
  'founder-biography':
    'In-depth biographical profiles of the entrepreneurs building defining generational franchises. Each piece examines zero-to-one product execution, crisis navigation, operational philosophies, and strategic inflection points.',
  'case-studies':
    'Engineering and strategic blueprints of the world’s most resilient tech monopolies. We break down product differentiation, distribution flywheels, pricing leverage, and the operational decisions behind compounding advantage.',
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const categories = await fetchCategories();
  const category = categories.find(c => c.slug === params.slug);

  if (!category) return { title: 'Category Not Found — Venture Atlas' };

  const editorialCopy = CATEGORY_EDITORIAL_COPY[category.slug] || category.description || '';

  return constructMetadata({
    title: `${category.name}`,
    description: editorialCopy,
    canonicalPath: `/categories/${category.slug}`,
    section: category.name,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [allCategories, articles, allBlogs, allCaseStudies] = await Promise.all([
    fetchCategories(),
    fetchArticles({ categorySlug: params.slug, limit: 30 }),
    fetchBlogs(10),
    fetchCaseStudies(10),
  ]);

  const category = allCategories.find(c => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const editorialDescription = CATEGORY_EDITORIAL_COPY[category.slug] || category.description;

  // Curate category essays and case studies: pull category-specific or featured fallback
  const categoryBlogs = (allBlogs.filter(b => b.categoryId === category.id).length > 0
    ? allBlogs.filter(b => b.categoryId === category.id)
    : allBlogs).slice(0, 2);

  const categoryCaseStudies = (allCaseStudies.filter(cs => cs.categoryId === category.id).length > 0
    ? allCaseStudies.filter(cs => cs.categoryId === category.id)
    : allCaseStudies).slice(0, 2);

  // Generate ItemList Schema.org structured data
  const itemListElements = [
    ...articles.map(a => ({ name: a.title, url: `/articles/${a.slug}` })),
    ...categoryCaseStudies.map(cs => ({ name: `${cs.company}: ${cs.title}`, url: `/case-studies/${cs.slug}` })),
    ...categoryBlogs.map(b => ({ name: b.title, url: `/blogs/${b.slug}` })),
  ];
  const itemListJsonLd = generateItemListJsonLd(`${category.name} Editorial Stream`, itemListElements);

  return (
    <>
      {/* Server-rendered ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="space-y-6">
        {/* Visible Breadcrumbs matching Schema */}
        <Breadcrumbs
          items={[
            {
              name: `${category.name} Desk`,
              url: `/categories/${category.slug}`,
            },
          ]}
        />

        {/* Category Header Banner with Curated Intro Copy */}
        <div className="p-6 md:p-8 rounded-3xl border border-border bg-surface text-text-primary shadow-card relative overflow-hidden">
          <div
            className="absolute top-0 left-0 bottom-0 w-2"
            style={{ backgroundColor: category.color }}
          />
          <div className="space-y-3 max-w-3xl pl-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-tertiary">
                EDITORIAL COVERAGE DESK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-muted border border-border text-text-secondary">
                {articles.length} Briefs Active
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm md:text-base text-text-secondary font-body leading-relaxed">
              {editorialDescription}
            </p>
          </div>
        </div>

        {/* Categories Navigation Strip */}
        <CategoryStrip
          categories={allCategories as unknown as CategoryItem[]}
          activeSlug={category.slug}
        />

        {/* Category Hub Highlights (Essays & Case Studies in this Category) */}
        {(categoryCaseStudies.length > 0 || categoryBlogs.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryCaseStudies.map(cs => (
              <Link
                key={cs.id}
                href={`/case-studies/${cs.slug}`}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-brand/40 transition-all shadow-xs block group space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                  <span className="flex items-center gap-1.5 font-bold text-text-primary">
                    <Briefcase size={13} className="text-amber-500" />
                    <span>{cs.company} Blueprint</span>
                  </span>
                  <span>{cs.valuation || 'Deep Dive'}</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base font-display text-text-primary group-hover:text-brand transition-colors line-clamp-2">
                  {cs.title}
                </h4>
              </Link>
            ))}

            {categoryBlogs.map(blog => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-brand/40 transition-all shadow-xs block group space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                  <span className="flex items-center gap-1.5 font-bold text-text-primary">
                    <BookOpen size={13} className="text-purple-500" />
                    <span>Editorial Essay</span>
                  </span>
                  <span>{blog.readTimeMinutes} min read</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base font-display text-text-primary group-hover:text-brand transition-colors line-clamp-2">
                  {blog.title}
                </h4>
              </Link>
            ))}
          </div>
        )}

        {/* Grid of Articles in this Desk */}
        {articles.length === 0 ? (
          <div className="text-center py-16 p-8 border border-border/80 rounded-3xl bg-surface">
            <p className="text-sm text-text-secondary font-body">
              No briefings published in {category.name} yet. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(articles as unknown as ArticleItem[]).map(article => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}


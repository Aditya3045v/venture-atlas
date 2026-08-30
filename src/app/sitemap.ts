import { MetadataRoute } from 'next';
import { fetchArticles, fetchBlogs, fetchCaseStudies, fetchCategories } from '@/lib/supabase-db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ventureatlas.io';

  let articles: any[] = [];
  let blogs: any[] = [];
  let caseStudies: any[] = [];
  let categories: any[] = [];

  try {
    [articles, blogs, caseStudies, categories] = await Promise.all([
      fetchArticles({ limit: 100 }),
      fetchBlogs(50),
      fetchCaseStudies(50),
      fetchCategories(),
    ]);
  } catch (err) {
    console.warn('Sitemap data fetch warning:', err);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(cat => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(art => ({
    url: `${baseUrl}/articles/${art.slug}`,
    lastModified: art.updatedAt ? new Date(art.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = (blogs || []).map(b => ({
    url: `${baseUrl}/blogs/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const caseStudyPages: MetadataRoute.Sitemap = (caseStudies || []).map(cs => ({
    url: `${baseUrl}/case-studies/${cs.slug}`,
    lastModified: cs.updatedAt ? new Date(cs.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...blogPages, ...caseStudyPages];
}

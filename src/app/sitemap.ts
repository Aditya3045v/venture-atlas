import { MetadataRoute } from 'next';
import { prisma, ensureDatabaseSeeded } from '../lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureDatabaseSeeded();
  const baseUrl = 'https://ventureatlas.io';

  const [articles, blogs, caseStudies, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.caseStudy.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

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

  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map(art => ({
    url: `${baseUrl}/articles/${art.slug}`,
    lastModified: art.updatedAt,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogs.map(b => ({
    url: `${baseUrl}/blogs/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const caseStudyPages: MetadataRoute.Sitemap = caseStudies.map(cs => ({
    url: `${baseUrl}/case-studies/${cs.slug}`,
    lastModified: cs.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...blogPages, ...caseStudyPages];
}

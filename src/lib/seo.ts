import { Metadata } from 'next';
import { ArticleItem } from '../types';

export function constructMetadata({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string | null;
  url?: string;
}): Metadata {
  const siteName = 'Venture Atlas';
  const fullTitle = `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      images: image ? [{ url: image }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : [],
    },
  };
}

export function generateArticleJsonLd(article: ArticleItem, baseUrl = 'https://ventureatlas.io') {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: [
      {
        '@type': 'Person',
        name: article.author?.name || article.sourceAuthor || 'Venture Atlas Editorial',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Venture Atlas',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/articles/${article.slug}`,
    },
  };
}

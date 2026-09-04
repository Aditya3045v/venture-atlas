import { Metadata } from 'next';
import { ArticleItem, BlogItem, CaseStudyItem, CategoryItem, UserProfile } from '../types';
import { SITE_URL } from './site-url';

export const APP_BASE_URL = SITE_URL;
const SITE_NAME = 'Venture Atlas';
const DEFAULT_OG_IMAGE = `${APP_BASE_URL}/og-default.png`;
const TWITTER_HANDLE = '@VentureAtlas';

/**
 * Truncates string at word boundary without splitting words.
 */
export function truncateAtWordBoundary(text: string, maxLen: number, suffix = '...'): string {
  if (!text) return '';
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= maxLen) return clean;

  const targetLen = maxLen - suffix.length;
  if (targetLen <= 0) return clean.slice(0, maxLen);

  const lastSpace = clean.lastIndexOf(' ', targetLen);
  if (lastSpace === -1) {
    return clean.slice(0, targetLen) + suffix;
  }
  return clean.slice(0, lastSpace).replace(/[,.:;!?-]+$/, '') + suffix;
}

/**
 * Formats meta title to strictly stay under 60 characters.
 * Pattern: "{title} — Venture Atlas"
 */
export function formatMetaTitle(rawTitle: string, isCategory = false): string {
  const brandSuffix = ` — ${SITE_NAME}`;
  const maxTitleLen = 60 - brandSuffix.length; // 44 chars max for title

  if (isCategory) {
    const cleanCat = truncateAtWordBoundary(rawTitle, maxTitleLen, '');
    return `${cleanCat}${brandSuffix}`;
  }

  const truncated = truncateAtWordBoundary(rawTitle, maxTitleLen);
  return `${truncated}${brandSuffix}`;
}

/**
 * Formats meta description to strictly stay under 155 characters.
 */
export function formatMetaDescription(rawDesc: string): string {
  if (!rawDesc) return 'Executive startup intelligence and venture capital briefs in 60 words.';
  return truncateAtWordBoundary(rawDesc, 155);
}

/**
 * Constructs Next.js standard Metadata object adhering to SEO specification.
 */
export function constructMetadata({
  title,
  description,
  canonicalPath = '',
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  section,
  noIndex = false,
}: {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string | null;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  section?: string;
  noIndex?: boolean;
}): Metadata {
  const cleanTitle = title.includes(SITE_NAME) ? title : formatMetaTitle(title);
  const cleanDesc = formatMetaDescription(description);
  const canonicalUrl = canonicalPath.startsWith('http') 
    ? canonicalPath 
    : `${APP_BASE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  
  const ogImageUrl = image || `${APP_BASE_URL}/api/og?title=${encodeURIComponent(title)}&section=${encodeURIComponent(section || 'Venture')}`;

  const metadata: Metadata = {
    title: cleanTitle,
    description: cleanDesc,
    metadataBase: new URL(APP_BASE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: type as any,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt || cleanTitle,
        },
      ],
      ...(type === 'article' && {
        publishedTime: publishedTime || undefined,
        modifiedTime: modifiedTime || publishedTime || undefined,
        authors: authors && authors.length > 0 ? authors : ['Venture Atlas Editorial Board'],
        section: section || 'Venture Capital',
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDesc,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [ogImageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };

  return metadata;
}

/**
 * -------------------------------------------------------------
 * STRUCTURED DATA (JSON-LD) GENERATORS
 * -------------------------------------------------------------
 */

/**
 * Generates Google-compliant NewsArticle schema for /articles/[slug] 60-word briefs.
 */
export function generateNewsArticleJsonLd(article: ArticleItem, baseUrl = APP_BASE_URL) {
  const url = `${baseUrl}/articles/${article.slug}`;
  const authorName = article.sourceAuthor || article.author?.name || 'Aditya Poddar';
  const authorSlug = (article.author?.name || article.sourceAuthor || 'aditya-poddar')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const authorUrl = `${baseUrl}/authors/${authorSlug}`;
  const publishedDate = article.publishedAt 
    ? new Date(article.publishedAt).toISOString()
    : new Date(article.createdAt).toISOString();
  
  const modifiedDate = article.updatedAt 
    ? new Date(article.updatedAt).toISOString()
    : publishedDate;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${url}#newsarticle`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    image: article.coverImage ? [article.coverImage] : [`${baseUrl}/og-default.png`],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    articleSection: article.category?.name || 'Venture Capital',
    wordCount: article.wordCount || 60,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    author: {
      '@type': 'Person',
      '@id': `${authorUrl}#author`,
      name: authorName,
      jobTitle: article.authorRole || article.author?.role || 'Senior Venture Reporter',
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: SITE_NAME,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
  };
}

/**
 * Generates Google-compliant Article (NOT NewsArticle) schema for blogs and case studies.
 */
export function generateArticleJsonLd(
  item: BlogItem | CaseStudyItem,
  type: 'blog' | 'case-study',
  baseUrl = APP_BASE_URL
) {
  const segment = type === 'blog' ? 'blogs' : 'case-studies';
  const url = `${baseUrl}/${segment}/${item.slug}`;
  const authorName = item.author?.name || 'Aditya Poddar';
  const authorSlug = authorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const authorUrl = `${baseUrl}/authors/${authorSlug}`;

  const publishedDate = item.publishedAt
    ? new Date(item.publishedAt).toISOString()
    : new Date(item.createdAt).toISOString();

  const modifiedDate = item.updatedAt
    ? new Date(item.updatedAt).toISOString()
    : publishedDate;

  const headline = item.title;
  const description = 'excerpt' in item ? item.excerpt : item.summary;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline,
    description,
    image: item.coverImage ? [item.coverImage] : [`${baseUrl}/og-default.png`],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    articleSection: item.category?.name || (type === 'blog' ? 'Essays' : 'Case Studies'),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    author: {
      '@type': 'Person',
      '@id': `${authorUrl}#author`,
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: SITE_NAME,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
  };
}

/**
 * Generates Organization schema for Homepage and About.
 */
export function generateOrganizationJsonLd(baseUrl = APP_BASE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: SITE_NAME,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 600,
      height: 60,
    },
    description:
      'Venture Atlas delivers rapid, high-impact news briefs and deep dive case studies across venture capital, startups, and private markets.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/VentureAtlas',
      'https://linkedin.com/company/ventureatlas',
    ],
    publishingPrinciples: `${baseUrl}/about`,
  };
}

/**
 * Generates WebSite schema with SearchAction for Homepage.
 */
export function generateWebSiteJsonLd(baseUrl = APP_BASE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: SITE_NAME,
    url: baseUrl,
    description: 'Startup & Business News in 60 Words',
    publisher: {
      '@id': `${baseUrl}#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates BreadcrumbList schema for navigation and content pages.
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
  baseUrl = APP_BASE_URL
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

/**
 * Generates ItemList schema for category and directory index pages.
 */
export function generateItemListJsonLd(
  name: string,
  items: { name: string; url: string; position?: number }[],
  baseUrl = APP_BASE_URL
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: item.position ?? idx + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

/**
 * Generates Person schema for author pages (/authors/[slug]).
 */
export function generateAuthorJsonLd(
  author: {
    name: string;
    jobTitle?: string;
    bio?: string;
    avatar?: string;
    slug: string;
  },
  baseUrl = APP_BASE_URL
) {
  const authorUrl = `${baseUrl}/authors/${author.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${authorUrl}#author`,
    name: author.name,
    jobTitle: author.jobTitle || 'Venture Journalist & Analyst',
    description: author.bio || `${author.name} is an editorial contributor at Venture Atlas covering startups and venture capital.`,
    image: author.avatar || `${baseUrl}/default-avatar.png`,
    url: authorUrl,
    worksFor: {
      '@id': `${baseUrl}#organization`,
    },
  };
}

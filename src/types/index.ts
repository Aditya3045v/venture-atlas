export type UserRole = 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';

export type ContentStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'UNPUBLISHED';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  plan: string;
  mfaEnabled: boolean;
  bio?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  order: number;
  articleCount?: number;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleItem {
  id: string;
  type: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  sourceName?: string | null;
  sourceUrl?: string | null;
  sourceAuthor?: string | null;
  categoryId: string;
  category?: CategoryItem;
  authorId?: string | null;
  author?: UserProfile | null;
  coverImage?: string | null;
  photoCredit?: string | null;
  readTimeMinutes: number;
  wordCount: number;
  status: ContentStatus;
  isFeatured: boolean;
  isTrending: boolean;
  scheduledFor?: Date | string | null;
  publishedAt?: Date | string | null;
  viewCount: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags?: { tag: TagItem }[];
  isSaved?: boolean;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage?: string | null;
  authorId?: string | null;
  author?: UserProfile | null;
  categoryId: string;
  category?: CategoryItem;
  readTimeMinutes: number;
  status: ContentStatus;
  publishedAt?: Date | string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CaseStudyItem {
  id: string;
  title: string;
  slug: string;
  company: string;
  companyLogo?: string | null;
  valuation?: string | null;
  stage?: string | null;
  keyMetric?: string | null;
  summary: string;
  challenge?: string | null;
  strategy?: string | null;
  outcome?: string | null;
  body: string;
  coverImage?: string | null;
  categoryId: string;
  category?: CategoryItem;
  authorId?: string | null;
  author?: UserProfile | null;
  readTimeMinutes: number;
  status: ContentStatus;
  publishedAt?: Date | string | null;
  viewCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
}

export interface MediaAssetItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  uploadedBy?: string | null;
  createdAt: Date | string;
}

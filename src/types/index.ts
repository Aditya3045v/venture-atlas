export type UserRole = 'USER' | 'WRITER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';

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

export interface CanvasMetric {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  icon: 'calendar' | 'unicorn' | 'funding' | 'building' | 'users' | 'trending' | 'dollar' | 'award';
  color?: string;
}

export interface CanvasCalloutBox {
  id: string;
  title: string;
  content: string;
  icon: 'trending' | 'star' | 'lightbulb' | 'alert' | 'award' | 'target' | 'rocket' | 'briefcase' | 'zap' | 'shield' | 'check';
  variant: 'green' | 'blue' | 'amber' | 'rose' | 'purple' | 'slate' | 'custom';
  customBg?: string;
  customBorder?: string;
  customTextColor?: string;
}

export interface CanvasProfile {
  founderName?: string;
  founderRole?: string;
  founderAvatar?: string;
  businessModelTitle?: string;
  businessModelPoints?: string[];
}

export interface CanvasHeader {
  bannerBg?: string;
  founderPhoto?: string;
  companyLogo?: string;
  tagline?: string;
  heroHeadline?: string;
}

export interface CanvasData {
  header?: CanvasHeader;
  metrics?: CanvasMetric[];
  profile?: CanvasProfile;
  calloutBoxes?: CanvasCalloutBox[];
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
  authorName?: string | null;
  authorRole?: string | null;
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
  likeCount?: number;
  isLiked?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags?: { tag: TagItem }[];
  isSaved?: boolean;
  canvasData?: CanvasData | null;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  authorRole?: string | null;
  author?: UserProfile | null;
  categoryId: string;
  category?: CategoryItem;
  readTimeMinutes: number;
  status: ContentStatus;
  publishedAt?: Date | string | null;
  viewCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  canvasData?: CanvasData | null;
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
  authorName?: string | null;
  authorRole?: string | null;
  author?: UserProfile | null;
  readTimeMinutes: number;
  status: ContentStatus;
  publishedAt?: Date | string | null;
  viewCount: number;
  likeCount?: number;
  isLiked?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  isSaved?: boolean;
  canvasData?: CanvasData | null;
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

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  orderNum: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}


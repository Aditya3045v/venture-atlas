import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(500, 'Summary cannot exceed 500 characters'),
  body: z.string().min(20, 'Body content must be at least 20 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  sourceName: z.string().optional().nullable(),
  sourceUrl: z.string().url('Source URL must be a valid URL').optional().or(z.literal('')).nullable(),
  sourceAuthor: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  authorRole: z.string().optional().nullable(),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')).nullable(),
  photoCredit: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'UNPUBLISHED']),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  scheduledFor: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(70, 'SEO title max 70 characters').optional().nullable(),
  seoDescription: z.string().max(160, 'SEO description max 160 characters').optional().nullable(),
  company: z.string().optional().nullable(),
  canvasData: z.any().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === 'PUBLISHED') {
    if (!data.seoTitle || data.seoTitle.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['seoTitle'],
        message: 'SEO Title is strictly required before publishing',
      });
    }
    if (!data.seoDescription || data.seoDescription.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['seoDescription'],
        message: 'SEO Description is strictly required before publishing',
      });
    }
    if (data.coverImage && data.coverImage.trim().length > 0 && (!data.photoCredit || data.photoCredit.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['photoCredit'],
        message: 'Cover image alt text / attribution is strictly required before publishing',
      });
    }
  }
});

export const caseStudySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  company: z.string().min(2, 'Company name is required').max(100),
  valuation: z.string().optional().nullable(),
  stage: z.string().optional().nullable(),
  keyMetric: z.string().optional().nullable(),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(500),
  challenge: z.string().optional().nullable(),
  strategy: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  authorRole: z.string().optional().nullable(),
  body: z.string().min(10, 'Body content is required'),
  categoryId: z.string().min(1, 'Category is required'),
  coverImage: z.string().url().optional().or(z.literal('')).nullable(),
  photoCredit: z.string().optional().nullable(),
  readTimeMinutes: z.number().int().positive().default(4),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'UNPUBLISHED']),
  canvasData: z.any().optional().nullable(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === 'PUBLISHED') {
    if (data.coverImage && data.coverImage.trim().length > 0 && (!data.photoCredit || data.photoCredit.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['photoCredit'],
        message: 'Cover image alt text is strictly required before publishing',
      });
    }
  }
});

export const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(300),
  body: z.string().min(50, 'Body content must be at least 50 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  authorName: z.string().optional().nullable(),
  authorRole: z.string().optional().nullable(),
  coverImage: z.string().url().optional().or(z.literal('')).nullable(),
  photoCredit: z.string().optional().nullable(),
  readTimeMinutes: z.number().int().positive().default(4),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'UNPUBLISHED']),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === 'PUBLISHED') {
    if (!data.seoTitle || data.seoTitle.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['seoTitle'],
        message: 'SEO Title is strictly required before publishing',
      });
    }
    if (!data.seoDescription || data.seoDescription.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['seoDescription'],
        message: 'SEO Description is strictly required before publishing',
      });
    }
    if (data.coverImage && data.coverImage.trim().length > 0 && (!data.photoCredit || data.photoCredit.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['photoCredit'],
        message: 'Cover image alt text is strictly required before publishing',
      });
    }
  }
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  slug: z.string().min(2).max(50),
  description: z.string().max(200).optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex code').default('#3B82F6'),
  order: z.number().int().default(0),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mfaCode: z.string().length(6, 'MFA Code must be 6 digits').optional(),
});

export const statusChangeSchema = z.object({
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'UNPUBLISHED']),
  reason: z.string().optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Search term cannot be empty').max(100),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

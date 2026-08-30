import { PrismaClient } from '@prisma/client';
import { SEED_CATEGORIES, SEED_USERS, SEED_ARTICLES, SEED_BLOGS, SEED_CASE_STUDIES } from '../data/seedData';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isSeeding: boolean | undefined;
  isSeeded: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Ensures initial database records exist on startup safely
 */
export async function ensureDatabaseSeeded() {
  if (globalForPrisma.isSeeded || globalForPrisma.isSeeding) return;
  globalForPrisma.isSeeding = true;

  try {
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log('🌱 Seeding initial Venture Atlas database...');

      // 1. Seed Categories with upsert
      const categoryMap = new Map<string, string>();
      for (const cat of SEED_CATEGORIES) {
        const created = await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            color: cat.color,
            order: cat.order,
          },
        });
        categoryMap.set(cat.slug, created.id);
      }

      // 2. Seed Users with upsert
      const userMap = new Map<string, string>();
      for (const user of SEED_USERS) {
        const created = await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.plan,
            avatar: user.avatar,
            bio: user.bio,
            passwordHash: 'venture-atlas-demo-hash',
            mfaEnabled: user.role === 'ADMIN',
          },
        });
        userMap.set(user.email, created.id);
      }

      const adminId = userMap.get('admin@ventureatlas.io');

      // 3. Seed Articles with upsert
      for (const art of SEED_ARTICLES) {
        const categoryId = categoryMap.get(art.categorySlug) || Array.from(categoryMap.values())[0];

        const createdArticle = await prisma.article.upsert({
          where: { slug: art.slug },
          update: {},
          create: {
            title: art.title,
            slug: art.slug,
            summary: art.summary,
            body: art.body,
            sourceName: art.sourceName,
            sourceUrl: art.sourceUrl,
            sourceAuthor: art.sourceAuthor,
            categoryId,
            authorId: adminId,
            coverImage: art.coverImage,
            photoCredit: art.photoCredit,
            readTimeMinutes: art.readTimeMinutes,
            wordCount: art.wordCount,
            status: art.status,
            isFeatured: art.isFeatured,
            isTrending: art.isTrending,
            publishedAt: art.publishedAt ? new Date(art.publishedAt) : null,
            viewCount: art.viewCount,
          },
        });

        // Seed Tags
        if (art.tags && art.tags.length > 0) {
          for (const tagName of art.tags) {
            const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: { name: tagName, slug: tagSlug },
            });

            await prisma.articleTag.upsert({
              where: {
                articleId_tagId: {
                  articleId: createdArticle.id,
                  tagId: tag.id,
                },
              },
              update: {},
              create: {
                articleId: createdArticle.id,
                tagId: tag.id,
              },
            });
          }
        }
      }

      // 4. Seed Blogs with upsert
      for (const blog of SEED_BLOGS) {
        const categoryId = categoryMap.get(blog.categorySlug) || Array.from(categoryMap.values())[0];
        await prisma.blogPost.upsert({
          where: { slug: blog.slug },
          update: {},
          create: {
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            body: blog.body,
            coverImage: blog.coverImage,
            authorId: adminId,
            categoryId,
            readTimeMinutes: blog.readTimeMinutes,
            status: blog.status,
            publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
          },
        });
      }

      // 5. Seed Case Studies with upsert
      for (const cs of SEED_CASE_STUDIES) {
        const categoryId = categoryMap.get(cs.categorySlug) || Array.from(categoryMap.values())[0];
        await prisma.caseStudy.upsert({
          where: { slug: cs.slug },
          update: {},
          create: {
            title: cs.title,
            slug: cs.slug,
            company: cs.company,
            companyLogo: cs.companyLogo,
            valuation: cs.valuation,
            stage: cs.stage,
            keyMetric: cs.keyMetric,
            summary: cs.summary,
            challenge: cs.challenge,
            strategy: cs.strategy,
            outcome: cs.outcome,
            body: cs.body,
            coverImage: cs.coverImage,
            categoryId,
            authorId: adminId,
            readTimeMinutes: cs.readTimeMinutes,
            status: cs.status,
            publishedAt: cs.publishedAt ? new Date(cs.publishedAt) : null,
          },
        });
      }

      // 6. Initial Audit Log
      await prisma.auditLog.create({
        data: {
          action: 'SYSTEM_SEED',
          entityType: 'SYSTEM',
          actorEmail: 'admin@ventureatlas.io',
          actorRole: 'ADMIN',
          metadata: JSON.stringify({ message: 'Initial system seed executed successfully' }),
        },
      });

      console.log('✅ Venture Atlas database seeded successfully.');
    } else {
      // If categories already exist, ensure Case Studies are seeded if count is 0
      const csCount = await prisma.caseStudy.count();
      if (csCount === 0) {
        const categories = await prisma.category.findMany();
        const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

        for (const cs of SEED_CASE_STUDIES) {
          const categoryId = categoryMap.get(cs.categorySlug) || categories[0].id;
          await prisma.caseStudy.upsert({
            where: { slug: cs.slug },
            update: {},
            create: {
              title: cs.title,
              slug: cs.slug,
              company: cs.company,
              companyLogo: cs.companyLogo,
              valuation: cs.valuation,
              stage: cs.stage,
              keyMetric: cs.keyMetric,
              summary: cs.summary,
              challenge: cs.challenge,
              strategy: cs.strategy,
              outcome: cs.outcome,
              body: cs.body,
              coverImage: cs.coverImage,
              categoryId,
              authorId: adminUser?.id,
              readTimeMinutes: cs.readTimeMinutes,
              status: cs.status,
              publishedAt: cs.publishedAt ? new Date(cs.publishedAt) : null,
            },
          });
        }
        console.log('✅ Case studies seeded successfully.');
      }
    }

    globalForPrisma.isSeeded = true;
  } catch (error) {
    console.error('Database seed error:', error);
  } finally {
    globalForPrisma.isSeeding = false;
  }
}

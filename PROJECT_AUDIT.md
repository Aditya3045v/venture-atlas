# Venture Atlas — Technical Codebase Audit

**Date:** September 1, 2026  
**Auditor:** Antigravity AI  
**Scope:** Full codebase review of `venture-atlas` (13,298 lines across 97 source files in `src/`, `prisma/`, and `public/`).

---

## 1. Project identity
* **Name:** Venture Atlas
* **Description:** A venture capital intelligence and executive news wire designed for investors, startup founders, and LP decision-makers. The platform delivers strict 60-word micro-briefs, startup architecture breakdowns, and long-form editorial teardowns. It features an interactive mobile-first feed with a curved slide-over reader, canvas design studio for admins, real-time database-backed likes, accessible typography controls, and an animated View Transitions theme toggler.
* **Target User:** Early/growth-stage venture investors, angel syndicates, founders, tech executives, and corporate strategy analysts.
* **Current Stage:** Functional MVP / Pre-Production (active local development and database synchronization).
* **Deployment Status:** Configured for Netlify / Vercel deployment with Supabase PostgreSQL cloud sync; currently running strictly in local execution on `http://localhost:3000`.

---

## 2. Tech stack

| Layer | Technology | Exact Version | Configuration / Location |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `>=18.x` / `22.x` | `package.json` |
| **Framework** | Next.js (App Router) | `14.2.23` (runtime: `14.2.35`) | `next.config.mjs`, `src/app/` |
| **Language** | TypeScript | `5.7.3` | `tsconfig.json` |
| **UI Library** | React / React DOM | `18.3.1` | `package.json` |
| **Database & ORM** | Prisma Client & CLI | `5.22.0` | `prisma/schema.prisma` |
| **Primary Local DB** | SQLite | `file:./dev.db` | `DATABASE_URL="file:./dev.db"` |
| **Cloud Backend** | Supabase JS & SSR | `@supabase/supabase-js: 2.112.4`, `@supabase/ssr: 0.12.5` | `src/lib/supabase/` |
| **Direct PG Driver** | `pg` / `@types/pg` | `8.23.0` / `8.23.1` | `package.json` |
| **Styling & CSS** | Tailwind CSS / PostCSS | `3.4.17` / `8.5.1` | `tailwind.config.ts`, `src/app/globals.css` |
| **Animations** | Framer Motion & Cobe 3D | `framer-motion: 13.1.1`, `cobe: 2.0.1` | Interactive landing globe & carousels |
| **Validation** | Zod | `3.24.1` | `src/lib/validation.ts` |
| **Icons** | Lucide React & Tabler Icons | `lucide-react: 0.474.0`, `@tabler/icons-react: 3.46.0` | `src/components/` |
| **Class Utilities** | `clsx` & `tailwind-merge` | `clsx: 2.1.1`, `tailwind-merge: 2.6.0` | `src/lib/utils.ts` |
| **Date Utilities** | Date-fns | `4.1.0` | `src/components/news/StoryCard.tsx` |

---

## 3. Repository structure

```
Venture Atlas/
├── prisma/
│   ├── dev.db                      # Local SQLite database instance
│   └── schema.prisma               # Complete Prisma schema definition (10 models)
├── public/
│   ├── logo-dark.png               # Official dark mode brand asset
│   └── logo-light.png              # Official light mode brand asset
├── src/
│   ├── app/                        # Next.js App Router (pages & API routes)
│   │   ├── (public)/               # Publicly accessible routes (feed, search, articles)
│   │   ├── account/                # User profile & account overview
│   │   ├── admin/                  # Protected CMS & Admin Management Dashboard
│   │   │   ├── analytics/          # Readership & traffic analytics view
│   │   │   ├── articles/           # News briefs CMS list and editors ([id]/edit, new)
│   │   │   ├── audit/              # Immutable audit logging history view
│   │   │   ├── blogs/              # Long-form essay CMS management
│   │   │   ├── case-studies/       # Teardown & architecture CMS management
│   │   │   ├── categories/         # Desk & category manager
│   │   │   ├── media/              # Media library & asset upload management
│   │   │   └── users/              # RBAC user & writer management
│   │   ├── api/                    # Serverless Next.js Route Handlers
│   │   │   ├── admin/users/        # Admin user creation & deletion API
│   │   │   ├── articles/           # News briefs CRUD, like, and status routes
│   │   │   ├── auth/               # Session login & cookie management
│   │   │   ├── blogs/              # Essay CRUD API
│   │   │   ├── bookmarks/          # User library bookmark toggle API
│   │   │   ├── case-studies/       # Teardowns CRUD API
│   │   │   ├── categories/         # Category desk CRUD API
│   │   │   ├── search/             # Multi-entity search API
│   │   │   └── subscribers/        # Newsletter gate & subscriber ingestion API
│   │   ├── articles/[slug]/        # Full-page article & Canvas design studio view
│   │   ├── blogs/ & blogs/[slug]/  # Long-form essay listing & reader pages
│   │   ├── bookmarks/              # User reading list & saved articles
│   │   ├── case-studies/[slug]/    # Case study deep dive page
│   │   ├── categories/[slug]/      # Category desk filtered wire
│   │   ├── feed/                   # Dedicated feed view
│   │   ├── landing/                # Public pre-email showcase landing page
│   │   ├── login/                  # Staff & user login portal
│   │   ├── search/                 # Live search page
│   │   ├── globals.css             # Base styles, OLED dark mode, View Transitions
│   │   ├── layout.tsx              # Root HTML wrapper with accessibility & theme providers
│   │   ├── not-found.tsx           # Custom 404 view
│   │   ├── page.tsx                # Post-email core homepage router (gated)
│   │   ├── robots.ts               # Automated robots.txt generator
│   │   └── sitemap.ts              # Automated sitemap.xml generator
│   ├── components/                 # React UI Components
│   │   ├── admin/                  # Admin form editors & canvas block builders
│   │   ├── canvas/                 # Canvas design studio & story view modal
│   │   ├── home/                   # Mobile-first homepage view (HomeMobileView.tsx)
│   │   ├── landing/                # Interactive landing sections (Globe, Bento, Audio)
│   │   ├── layout/                 # Sticky Header, Footer, MobileNav
│   │   ├── news/                   # StoryCard, FeaturedStory, StoryDetailSheet, GatedNewsFeed
│   │   ├── providers/              # ThemeProvider, AccessibilityProvider, ToastProvider
│   │   └── ui/                     # Primitives (AnimatedThemeToggler, Badge, Modal, Input)
│   ├── data/
│   │   └── seedData.ts             # Baseline seed data for articles, case studies, blogs
│   ├── lib/
│   │   ├── audit.ts                # Structured audit logging engine
│   │   ├── auth.ts                 # Role hierarchy, RBAC checks, session parser
│   │   ├── db.ts                   # Prisma client singleton & automated seeding
│   │   ├── sanitize.ts             # Text sanitizer and 60-word counter
│   │   ├── seo.ts                  # JSON-LD and meta tag generators
│   │   ├── supabase-db.ts          # Unified Supabase -> Prisma -> Seed fallback data layer
│   │   ├── utils.ts                # Tailwind class merge utility
│   │   ├── validation.ts           # Zod schemas for all models
│   │   └── supabase/               # Supabase admin, client, and server wrappers
│   └── types/
│       └── index.ts                # Global TypeScript definitions & interfaces
└── package.json
```

* **Total Source Files:** 97 files
* **Total Lines of Code:** 13,298 lines

---

## 4. Routes and pages

| Route Path | Render Strategy | Component / File Path | Auth / Gate Requirement | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | SSR (Dynamic) | [`src/app/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/page.tsx) | Gated (Redirects to `/landing` if `va_unlocked_user` cookie absent) | **WORKING** |
| `/landing` | Static / Client | [`src/app/landing/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/landing/page.tsx) | Public | **WORKING** |
| `/feed` | SSR (Dynamic) | [`src/app/feed/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/feed/page.tsx) | Public / Reader | **WORKING** |
| `/articles/[slug]` | SSR (Dynamic) | [`src/app/articles/[slug]/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/articles/%5Bslug%5D/page.tsx) | Public | **WORKING** |
| `/case-studies` | SSR (Dynamic) | [`src/app/case-studies/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/case-studies/page.tsx) | Public | **WORKING** |
| `/case-studies/[slug]` | SSR (Dynamic) | [`src/app/case-studies/[slug]/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/case-studies/%5Bslug%5D/page.tsx) | Public | **WORKING** |
| `/blogs` | SSR (Dynamic) | [`src/app/blogs/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/blogs/page.tsx) | Public | **WORKING** |
| `/blogs/[slug]` | SSR (Dynamic) | [`src/app/blogs/[slug]/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/blogs/%5Bslug%5D/page.tsx) | Public | **WORKING** |
| `/categories/[slug]` | SSR (Dynamic) | [`src/app/categories/[slug]/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/categories/%5Bslug%5D/page.tsx) | Public | **WORKING** |
| `/bookmarks` | SSR / Client | [`src/app/bookmarks/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/bookmarks/page.tsx) | Public (Syncs with `localStorage` & API) | **WORKING** |
| `/search` | SSR / Client | [`src/app/search/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/search/page.tsx) | Public | **WORKING** |
| `/account` | SSR / Client | [`src/app/account/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/account/page.tsx) | Public / Session | **WORKING** |
| `/login` | SSR / Client | [`src/app/login/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/login/page.tsx) | Public | **WORKING** |
| `/admin` | SSR (Dynamic) | [`src/app/admin/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/page.tsx) | RBAC (`WRITER`, `EDITOR`, `ADMIN`) | **WORKING** |
| `/admin/articles` | SSR (Dynamic) | [`src/app/admin/articles/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/articles/page.tsx) | RBAC | **WORKING** |
| `/admin/articles/new` | Client | [`src/app/admin/articles/new/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/articles/new/page.tsx) | RBAC | **WORKING** |
| `/admin/articles/[id]/edit` | Client | [`src/app/admin/articles/[id]/edit/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/articles/%5Bid%5D/edit/page.tsx) | RBAC | **WORKING** |
| `/admin/case-studies` | SSR (Dynamic) | [`src/app/admin/case-studies/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/case-studies/page.tsx) | RBAC | **WORKING** |
| `/admin/case-studies/new` | Client | [`src/app/admin/case-studies/new/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/case-studies/new/page.tsx) | RBAC | **WORKING** |
| `/admin/case-studies/[id]/edit` | Client | [`src/app/admin/case-studies/[id]/edit/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/case-studies/%5Bid%5D/edit/page.tsx) | RBAC | **WORKING** |
| `/admin/blogs` | SSR (Dynamic) | [`src/app/admin/blogs/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/blogs/page.tsx) | RBAC | **WORKING** |
| `/admin/blogs/new` | Client | [`src/app/admin/blogs/new/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/blogs/new/page.tsx) | RBAC | **WORKING** |
| `/admin/blogs/[id]/edit` | Client | [`src/app/admin/blogs/[id]/edit/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/blogs/%5Bid%5D/edit/page.tsx) | RBAC | **WORKING** |
| `/admin/categories` | SSR (Dynamic) | [`src/app/admin/categories/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/categories/page.tsx) | RBAC | **WORKING** |
| `/admin/media` | SSR (Dynamic) | [`src/app/admin/media/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/media/page.tsx) | RBAC | **WORKING** |
| `/admin/users` | SSR / Client | [`src/app/admin/users/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/users/page.tsx) | RBAC (`ADMIN` only) | **WORKING** |
| `/admin/analytics` | SSR (Dynamic) | [`src/app/admin/analytics/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/analytics/page.tsx) | RBAC | **WORKING** |
| `/admin/audit` | SSR (Dynamic) | [`src/app/admin/audit/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/audit/page.tsx) | RBAC (`ADMIN` only) | **WORKING** |
| `/robots.txt` | Static Generated | [`src/app/robots.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/robots.ts) | Public | **WORKING** |
| `/sitemap.xml` | Dynamic XML | [`src/app/sitemap.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/sitemap.ts) | Public | **WORKING** |

---

## 5. Features — complete list

### 1. News Feed & 60-Word Micro-Briefs
* **Description:** Continuous stream of strictly enforced 60-word micro-briefs. Includes reading time calculation, word counter badge, text-to-speech audio reader, and interactive modal/canvas expansion.
* **Files:** [`src/components/news/StoryCard.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/news/StoryCard.tsx), [`src/components/news/FeaturedStory.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/news/FeaturedStory.tsx), [`src/lib/sanitize.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/lib/sanitize.ts).
* **Status:** **WORKING**

### 2. Mobile-First App Experience (`HomeMobileView`)
* **Description:** Dedicated mobile UI matching native iOS apps with `rounded-[28px]` vertical featured cards, horizontal snap carousel, 2-row multi-color category grid, list cards with left thumbnails, and a floating bottom iOS dock.
* **Files:** [`src/components/home/HomeMobileView.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/home/HomeMobileView.tsx), [`src/components/news/StoryDetailSheet.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/news/StoryDetailSheet.tsx).
* **Status:** **WORKING**

### 3. Canvas Design Studio & Detailed Story Breakdown
* **Description:** Dynamic canvas layout system rendering 4 analytical stat badges, author monogram, executive summary, key quotes, and structured analytical callout boxes for every story. Admins can format layout, box colors, and content in real-time.
* **Files:** [`src/components/canvas/CanvasStoryView.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/canvas/CanvasStoryView.tsx), [`src/components/admin/CanvasBlockEditor.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/admin/CanvasBlockEditor.tsx).
* **Status:** **WORKING**

### 4. Real Database-Backed Likes System
* **Description:** Zero mock multipliers. Likes are stored in SQLite and Supabase via `Article.likeCount` and `Like` tracking records. Increments and decrements are performed in real-time via `/api/articles/[id]/like`.
* **Files:** [`src/app/api/articles/[id]/like/route.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/api/articles/%5Bid%5D/like/route.ts), [`src/components/news/StoryCard.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/news/StoryCard.tsx), [`src/lib/supabase-db.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/lib/supabase-db.ts).
* **Status:** **WORKING**

### 5. Multi-User RBAC & Writer Management
* **Description:** Admin interface allowing creation and role assignments for `WRITER`, `AUTHOR`, `EDITOR`, `ADMIN`, and `USER`. Writers can be assigned to posts with custom author names and titles.
* **Files:** [`src/components/admin/AdminUsersClient.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/admin/AdminUsersClient.tsx), [`src/app/api/admin/users/route.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/api/admin/users/route.ts), [`src/lib/auth.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/lib/auth.ts).
* **Status:** **WORKING**

### 6. Email Gate & Landing Page Ingestion
* **Description:** Public landing page with 3D interactive globe, live audio sample brief, interactive Bento grid, and email capture. Unlocks feed upon email submission by writing session cookies and creating subscriber records.
* **Files:** [`src/components/landing/LandingView.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/landing/LandingView.tsx), [`src/app/api/subscribers/route.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/api/subscribers/route.ts).
* **Status:** **WORKING**

### 7. Startup Architecture & Teardown Case Studies
* **Description:** Structured deep dives containing company stage, valuation, key metrics, challenges, strategies, and outcome breakdowns.
* **Files:** [`src/app/case-studies/[slug]/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/case-studies/%5Bslug%5D/page.tsx), [`src/components/admin/CaseStudyEditorForm.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/admin/CaseStudyEditorForm.tsx).
* **Status:** **WORKING**

### 8. Long-Form Editorial Essays
* **Description:** Multi-paragraph macro essays with author attribution, reading times, and category categorization.
* **Files:** [`src/app/blogs/[slug]/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/blogs/%5Bslug%5D/page.tsx), [`src/components/admin/BlogEditorForm.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/admin/BlogEditorForm.tsx).
* **Status:** **WORKING**

### 9. View Transitions Animated Theme Toggler
* **Description:** `@magicui/animated-theme-toggler` utilizing native browser View Transitions API with geometric clip-paths (`circle`) morphing smoothly from the button center.
* **Files:** [`src/components/ui/animated-theme-toggler.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/ui/animated-theme-toggler.tsx), [`src/app/globals.css`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/globals.css).
* **Status:** **WORKING**

### 10. Accessibility Engine
* **Description:** Modal controls for font sizing (`sm`, `base`, `lg`, `xl`), OpenDyslexic mode, high-contrast borders, and reduced motion toggling.
* **Files:** [`src/components/providers/AccessibilityProvider.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/providers/AccessibilityProvider.tsx), [`src/components/ui/AccessibilityModal.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/ui/AccessibilityModal.tsx).
* **Status:** **WORKING**

### 11. Multi-Entity Search & Filtering
* **Description:** Live search querying across articles, case studies, blogs, and categories with category desk filtering.
* **Files:** [`src/app/search/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/search/page.tsx), [`src/app/api/search/route.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/api/search/route.ts).
* **Status:** **WORKING**

### 12. Bookmarks & Personal Library
* **Description:** Saves stories locally in `localStorage` and synchronizes with `/api/bookmarks` when authenticated.
* **Files:** [`src/app/bookmarks/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/bookmarks/page.tsx), [`src/app/api/bookmarks/route.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/api/bookmarks/route.ts).
* **Status:** **WORKING**

### 13. Audit Logging Engine
* **Description:** Automatically records administrative actions (article edits, user creation, role changes, deletions) with IP hash and user agent.
* **Files:** [`src/lib/audit.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/lib/audit.ts), [`src/app/admin/audit/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/admin/audit/page.tsx).
* **Status:** **WORKING**

### 14. Monetization & Subscriptions
* **Description:** Plan labels (`FREE`, `PRO`, `ENTERPRISE`) exist in database models and UI badges, but payment gateway integration (Stripe / LemonSqueezy) is not yet wired.
* **Files:** [`src/app/account/page.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/account/page.tsx), [`prisma/schema.prisma`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/prisma/schema.prisma).
* **Status:** **PARTIAL**

### 15. Comments & Deal Sentiment Polls
* **Description:** Comment submission forms exist in UI modal with client toasts; database comment schema table is not yet migrated to DB.
* **Files:** [`src/components/news/StoryDetailSheet.tsx`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/components/news/StoryDetailSheet.tsx).
* **Status:** **PARTIAL**

---

## 6. Data layer

### Database Engine & Architecture
* **Primary Local Engine:** SQLite via Prisma ORM (`prisma/dev.db`).
* **Cloud Database:** PostgreSQL on Supabase (`https://fckmhqyhglfnqhpjzrvu.supabase.co`).
* **Data Access Layer:** `src/lib/supabase-db.ts` orchestrates Supabase direct REST queries with transparent fallback to local Prisma SQLite and `src/data/seedData.ts`.

### Full Prisma Database Schema

```prisma
model User {
  id           String      @id @default(cuid())
  email        String      @unique
  name         String
  passwordHash String
  role         String      @default("USER") // USER, WRITER, AUTHOR, EDITOR, ADMIN
  avatar       String?
  plan         String      @default("FREE")
  mfaEnabled   Boolean     @default(false)
  mfaSecret    String?
  bio          String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  articles     Article[]
  blogPosts    BlogPost[]
  caseStudies  CaseStudy[]
  bookmarks    Bookmark[]
  auditLogs    AuditLog[]
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  source    String   @default("LANDING_PAGE")
  createdAt DateTime @default(now())
}

model Category {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  description String?
  color       String      @default("#3B82F6")
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  articles    Article[]
  blogPosts   BlogPost[]
  caseStudies CaseStudy[]
}

model Tag {
  id        String       @id @default(cuid())
  name      String       @unique
  slug      String       @unique
  createdAt DateTime     @default(now())
  articles  ArticleTag[]
}

model ArticleTag {
  id        String   @id @default(cuid())
  articleId String
  tagId     String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([articleId, tagId])
}

model Article {
  id               String       @id @default(cuid())
  type             String       @default("NEWS")
  title            String
  slug             String       @unique
  summary          String       // Concise 60-word summary
  body             String       // Full article markdown
  sourceName       String?
  sourceUrl        String?
  sourceAuthor     String?
  categoryId       String
  category         Category     @relation(fields: [categoryId], references: [id])
  authorId         String?
  author           User?        @relation(fields: [authorId], references: [id])
  coverImage       String?
  photoCredit      String?
  readTimeMinutes  Int          @default(1)
  wordCount        Int          @default(60)
  status           String       @default("DRAFT")
  isFeatured       Boolean      @default(false)
  isTrending       Boolean      @default(false)
  scheduledFor     DateTime?
  publishedAt      DateTime?
  viewCount        Int          @default(0)
  likeCount        Int          @default(0)
  seoTitle         String?
  seoDescription   String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  tags             ArticleTag[]
  bookmarks        Bookmark[]
  viewEvents       ViewEvent[]
  likes            Like[]

  @@index([status, publishedAt])
  @@index([categoryId, status])
  @@index([slug])
}

model BlogPost {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  excerpt         String
  body            String
  coverImage      String?
  authorId        String?
  author          User?     @relation(fields: [authorId], references: [id])
  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])
  readTimeMinutes Int       @default(4)
  status          String    @default("DRAFT")
  publishedAt     DateTime?
  viewCount       Int       @default(0)
  likeCount       Int       @default(0)
  seoTitle        String?
  seoDescription  String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  likes           Like[]

  @@index([status, publishedAt])
  @@index([slug])
}

model CaseStudy {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  company         String
  companyLogo     String?
  valuation       String?
  stage           String?
  keyMetric       String?
  summary         String
  challenge       String?
  strategy        String?
  outcome         String?
  body            String
  coverImage      String?
  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])
  authorId        String?
  author          User?     @relation(fields: [authorId], references: [id])
  readTimeMinutes Int       @default(8)
  status          String    @default("PUBLISHED")
  publishedAt     DateTime? @default(now())
  viewCount       Int       @default(0)
  likeCount       Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  likes           Like[]

  @@index([status, publishedAt])
  @@index([slug])
}

model Like {
  id          String     @id @default(cuid())
  articleId   String?
  caseStudyId String?
  blogPostId  String?
  userIp      String?
  userId      String?
  createdAt   DateTime   @default(now())
  article     Article?   @relation(fields: [articleId], references: [id], onDelete: Cascade)
  caseStudy   CaseStudy? @relation(fields: [caseStudyId], references: [id], onDelete: Cascade)
  blogPost    BlogPost?  @relation(fields: [blogPostId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@index([caseStudyId])
  @@index([blogPostId])
}

model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  articleId String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, articleId])
}

model MediaAsset {
  id           String   @id @default(cuid())
  filename     String
  originalName String
  url          String
  mimeType     String
  sizeBytes    Int
  width        Int?
  height       Int?
  uploadedBy   String?
  createdAt    DateTime @default(now())
}

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String?
  actorEmail  String?
  actorRole   String?
  action      String
  entityType  String
  entityId    String?
  metadata    String?
  ipHash      String?
  userAgent   String?
  createdAt   DateTime @default(now())
  user        User?    @relation(fields: [actorId], references: [id])

  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}

model ViewEvent {
  id        String   @id @default(cuid())
  articleId String
  path      String
  referrer  String?
  userAgent String?
  createdAt DateTime @default(now())
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@index([createdAt])
}
```

---

## 7. Content pipeline

1. **Ingestion & Authoring:**
   * **Manual Entry:** Via Admin CMS Form Studio (`/admin/articles/new`, `/admin/case-studies/new`, `/admin/blogs/new`).
   * **Canvas Block Builder:** Interactive visual block editor (`CanvasBlockEditor.tsx`) allowing admins to add custom callout boxes, color highlights, and stat badge metrics.
   * **Automated Seeding:** On startup, `src/lib/db.ts` checks database count and seeds initial verified venture briefs from `src/data/seedData.ts`.
2. **Validation & Moderation:**
   * Handled by Zod schemas in `src/lib/validation.ts`.
   * Enforces slug formatting, URL validation, and word limits (`countWords()` in `src/lib/sanitize.ts`).
3. **Publishing States:**
   * `DRAFT` (Saved for internal review)
   * `SCHEDULED` (Configured with `scheduledFor` date)
   * `PUBLISHED` (Live on public feeds)
   * `ARCHIVED` (Removed from active wire)

---

## 8. APIs and integrations

### Internal API Endpoints

| Method | Endpoint Path | Query / Body Params | Auth Required | Returns |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth` | `{ email, password }` | None | `{ success, user, supabaseSession }` |
| `GET` | `/api/articles` | `?limit=10&categoryId=...&status=...` | None | `{ articles: ArticleItem[] }` |
| `POST` | `/api/articles` | `ArticleSchema` JSON payload | Editor / Admin | `{ article: ArticleItem }` |
| `GET` | `/api/articles/[id]` | `[id]` (UUID or slug) | None | `{ article: ArticleItem }` |
| `PUT` | `/api/articles/[id]` | `ArticleSchema` JSON payload | Editor / Admin | `{ article: ArticleItem }` |
| `DELETE`| `/api/articles/[id]` | `[id]` | Admin | `{ success: true }` |
| `POST` | `/api/articles/[id]/like` | `{ liked: boolean }` | None (IP tracked) | `{ success, likeCount, liked }` |
| `PATCH`| `/api/articles/[id]/status` | `{ status: 'PUBLISHED' \| 'DRAFT' }` | Editor / Admin | `{ success, status }` |
| `GET` | `/api/case-studies` | `?limit=10` | None | `{ caseStudies: CaseStudyItem[] }` |
| `POST` | `/api/case-studies` | `CaseStudySchema` payload | Editor / Admin | `{ caseStudy: CaseStudyItem }` |
| `GET` | `/api/blogs` | `?limit=10` | None | `{ blogs: BlogItem[] }` |
| `POST` | `/api/blogs` | `BlogSchema` payload | Editor / Admin | `{ blog: BlogItem }` |
| `GET` | `/api/categories` | None | None | `{ categories: CategoryItem[] }` |
| `POST` | `/api/categories` | `{ name, slug, description, color, order }` | Admin | `{ category: CategoryItem }` |
| `GET` | `/api/search` | `?q=search_term&category=...` | None | `{ results, total }` |
| `POST` | `/api/subscribers` | `{ email }` | None | `{ success: true, isUnlocked: true }` |
| `GET` | `/api/bookmarks` | None | Session User | `{ bookmarks: BookmarkItem[] }` |
| `POST` | `/api/bookmarks` | `{ articleId, saved: boolean }` | Session User | `{ success: true, saved: boolean }` |
| `GET` | `/api/admin/users` | None | Admin | `{ users: UserProfile[] }` |
| `POST` | `/api/admin/users` | `{ email, name, role, password }` | Admin | `{ success, user }` |
| `DELETE`| `/api/admin/users` | `?id=usr-...` | Admin | `{ success: true }` |

### Third-Party Services

| Service | Purpose | Integration File | Status |
| :--- | :--- | :--- | :--- |
| **Supabase Cloud** | Remote PostgreSQL database, Auth, & Storage | `src/lib/supabase/` | **LIVE & CONFIGURED** |
| **Prisma SQLite** | Fast local data engine & migration management | `prisma/` | **LIVE & CONFIGURED** |
| **Web Speech API** | Client-side Text-to-Speech audio narration | `src/components/news/StoryCard.tsx` | **LIVE & WORKING** |

---

## 9. Auth and permissions

* **Mechanism:** Hybrid session cookie (`va_session_user`, `va_unlocked_user`) with Supabase JWT support (`sb-access-token`).
* **Role Hierarchy:**
  * `ADMIN` (Level 4): Full CMS control, user role management, audit log review, category configuration.
  * `EDITOR` (Level 3): Create, edit, publish, and delete news briefs, case studies, and essays.
  * `WRITER` / `AUTHOR` (Level 2): Draft news briefs and essays; assign custom bylines.
  * `USER` (Level 1): Read briefs, bookmark stories, like posts, participate in comments.
* **Enforcement Points:**
  * Server-side in API routes (`src/lib/auth.ts`: `getCurrentUser()`, `hasRole()`).
  * Layout & Component guards in `src/app/admin/layout.tsx`.

---

## 10. State management and data fetching

* **Server State:** Next.js Server Components with direct Prisma / Supabase database calls (`revalidate = 0` for real-time dynamic updates).
* **Client State:** React hooks (`useState`, `useEffect`, `useCallback`, `useRef`) paired with React Context Providers:
  * `ThemeProvider`: Theme switching, OLED dark mode, `localStorage` persistence.
  * `AccessibilityProvider`: Font sizing, dyslexia modes, contrast toggles.
  * `ToastProvider`: Micro-notifications and feedback toasts.
* **Error Boundaries & Fallbacks:** Fallback waterfall in `src/lib/supabase-db.ts` (Supabase $\rightarrow$ Prisma SQLite $\rightarrow$ In-Memory Seed Data).

---

## 11. Configuration and environment

| Environment Variable Name | Purpose | Current Status |
| :--- | :--- | :--- |
| `DATABASE_URL` | Prisma SQLite local connection URL | **SET** (in `.env`) |
| `NEXT_PUBLIC_APP_URL` | Base application URL for SEO canonicals & sitemaps | **SET** (in `.env`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Public URL for Supabase API gateway | **SET** (in `.env`) |
| `SUPABASE_URL` | Server-side URL for Supabase backend | **SET** (in `.env`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client requests | **SET** (in `.env`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin privileged key for server mutations | **SET** (in `.env`) |
| `SUPABASE_JWKS_URL` | JSON Web Key Set URL for token verification | **SET** (in `.env`) |

---

## 12. Deployment and infrastructure

* **Build Command:** `npm run build` (`prisma generate && next build`).
* **Static / Dynamic Split:** 26 routes total (prerendered static landing, dynamic database API routes and SSR detail pages).
* **Image Assets:** Local assets in `public/` (`logo-dark.png`, `logo-light.png`), Unsplash CDN for news thumbnails.
* **Local Run Command:** `npm run dev` (starts Next.js development server on `http://localhost:3000`).

---

## 13. Design and UI

* **Design Philosophy:** Minimalist Financial Terminal meets Apple iOS Human Interface Guidelines.
* **Color Tokens:**
  * Background: Light `#F8F9FA` / Dark OLED `#000000`
  * Surface: Light `#FFFFFF` / Dark `#0A0A0C`
  * Border: Light `#E2E8F0` / Dark `rgba(255, 255, 255, 0.1)`
  * Accent / Brand: Amber `#FACC15` / Electric Blue `#0066FF` / Emerald `#10B981` / Rose `#EF4444`
* **Typography:** System SF Pro Display, Plus Jakarta Sans, Inter, Monospace for metrics/tickers.
* **Key Custom Components:**
  * `AnimatedThemeToggler`: View Transitions API circular morphing toggle.
  * `HomeMobileView`: Native iOS-style mobile wire with horizontal snap carousels and dock.
  * `StoryDetailSheet`: Deep curved sheet (`rounded-t-[36px]`) slide-over modal with drop-cap.
  * `CanvasStoryView`: Interactive canvas design studio with live callout customization.

---

## 14. Quality state

* **Automated Tests:** No unit test runner (Jest/Vitest/Playwright) is currently configured in `package.json`.
* **TODO / FIXME Comments:** **0 found** across all `src` files.
* **Known Bugs / Broken Features:**
  * Stripe payment webhook is not yet connected (plan selection is cosmetic).
  * Direct comments in `StoryDetailSheet` toast success but are not yet persisted to a dedicated `Comment` table in Prisma.
* **Security State:**
  * Passwords currently hashed with basic demo salt in development; production bcrypt/argon2 hashing needed for live production launch.
  * Input payloads validated with Zod in API route handlers.
* **Console Warnings:** Clean compilation; no active build or TypeScript errors.

---

## 15. SEO and metadata

* **Robots Configuration:** Handled dynamically via [`src/app/robots.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/robots.ts).
* **Sitemap Generation:** Automated multi-entity generator in [`src/app/sitemap.ts`](file:///C:/Users/ADITYA%20PODDAR/Downloads/Venture%20Atlas/src/app/sitemap.ts) covering all articles, categories, case studies, and essays.
* **Structured Data:** JSON-LD schema builder in `src/lib/seo.ts` generating `NewsArticle` and `Organization` schemas.

---

## 16. What's missing

### Features Missing Compared to Tier-1 Platforms
1. **Live Community Sentiment Polls:** Bullish/Bearish investor voting on valuations.
2. **Continuous Audio Playlist Player:** Ambient sticky bottom player streaming the top 5 briefings back-to-back.
3. **Stripe Billing & Paid Subscriptions:** Automated webhook processing for Pro/Enterprise tiers.
4. **Automated RSS / News Ingestion:** Scraping / API connectors for automated draft generation.
5. **PDF / Slack Export Utilities:** 1-click deal memo generation for partner meetings.

### Top 5 Next Priority Actions
1. **Implement Live Investor Sentiment Polls:** Add 1-tap Bullish/Bearish deal sentiment widget on story cards and canvas views.
2. **Build Continuous 5-Minute Executive Audio Briefing Player:** Sticky bottom player streaming the day's top briefs with waveform visualizer.
3. **Integrate Stripe Subscription Gateway:** Connect webhook endpoint and checkout sessions for paid tier upgrades.
4. **Deploy Full-Screen 60-Word Story Swiper for Mobile:** Instagram Stories / Reels style flick interaction for mobile users.
5. **Implement 1-Click AI Brief & Canvas Synthesizer:** Admin studio button to auto-summarize articles into strict 60-word briefs via AI.

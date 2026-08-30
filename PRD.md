# Venture Atlas — Product Requirements Document

## 1. Product Overview

**Venture Atlas** is a production-grade web application focused exclusively on startup, venture, entrepreneurship, technology-business, funding, founders, acquisitions, and broader business news.

The consumer experience takes inspiration from the **content model and speed of consumption** popularized by short-form news products such as Inshorts: users should be able to discover a story quickly, understand the key facts immediately, and open the full article when they want more context.

Venture Atlas must **not** copy proprietary branding, UI assets, wording, or implementation from Inshorts. The product should establish its own visual identity and interaction language.

The platform has two major surfaces:

1. **Public Web App** — discovery, short news summaries, full articles/blogs, search, categories, bookmarks, notifications, sharing, and profiles/preferences.
2. **Admin Panel** — secure content management, publishing workflow, media management, categories/tags, user management, analytics, moderation, and audit logs.

## 2. Goals

### Primary goals
- Make startup/business news extremely fast to scan.
- Build a high-quality editorial destination for founders, students, investors, operators, and business professionals.
- Give the client a simple but powerful publishing workflow.
- Support short-form news cards and long-form blogs in the same platform.
- Be SEO-friendly, accessible, responsive, and fast.
- Provide production-grade security and operational reliability.
- Create an architecture that can scale beyond the initial launch.

### Success metrics
- First Contentful Paint / Largest Contentful Paint consistently within good Core Web Vitals ranges.
- High article completion rate.
- High card-to-article open rate.
- Returning-user rate.
- Search usage and bookmark usage.
- Publishing turnaround time from admin draft to live article.
- Low error rate and low API latency.
- Organic search impressions and indexed articles.
- Zero critical security incidents.

## 3. Target Users

### Reader segments
- Startup founders
- Aspiring entrepreneurs
- Investors and angel investors
- Startup employees/operators
- Business students
- Technology professionals
- Business/news enthusiasts

### Admin segments
- **Owner/Admin:** client, full access.
- **Editor:** creates, edits, schedules, and publishes content but has restricted system settings.
- **Author/Contributor:** creates drafts and submits them for review.
- Optional future **Analyst/Viewer:** analytics-only access.

## 4. MVP Scope

### Public app
- Homepage/news feed
- Category feeds
- News cards with:
  - headline
  - concise summary
  - source
  - publish date
  - thumbnail/cover image
  - category
  - read time
- Full article page
- Long-form blogs
- Search
- Trending/latest sections
- Bookmarks
- Share actions
- Responsive mobile-first UI
- Authentication for account-based features
- Basic user profile/preferences
- Optional email/push notification preferences
- SEO metadata and structured data
- 404/error/loading states

### Admin panel
- Secure login
- Dashboard
- Create/edit/delete draft
- Publish/unpublish
- Schedule publication
- News article editor
- Blog editor
- Category management
- Tag management
- Media upload/library
- Featured/trending controls
- Search
- Content status filters
- Basic analytics
- User management
- Audit log
- Admin account settings

## 5. Content Model

A story is represented by a normalized content entity rather than storing everything as free-form pages.

### News
Designed for quick consumption:
- title
- short summary
- full body
- source name
- source URL
- source author where available
- hero image
- thumbnail
- category
- tags
- location/market
- companies
- people/entities
- publishedAt
- updatedAt
- status
- SEO fields

### Blog
Long-form editorial content:
- title
- subtitle/excerpt
- body
- cover image
- author
- category
- tags
- reading time
- SEO fields
- publishedAt
- status

### Suggested categories
- Startups
- Funding
- Venture Capital
- Founders
- Business
- Technology
- M&A
- IPOs
- Fintech
- SaaS
- Consumer
- AI
- Policy & Regulation
- Global Markets
- Indian Startups

Categories should be editable from the admin panel.

## 6. Editorial Workflow

Recommended lifecycle:

`DRAFT -> IN_REVIEW -> APPROVED -> SCHEDULED -> PUBLISHED`

Alternative terminal states:
- `REJECTED`
- `ARCHIVED`
- `UNPUBLISHED`

Every state transition should be audited.

## 7. Reader Experience

### Feed behavior
The default feed should prioritize:
1. Freshness
2. Editorial importance
3. Personal preferences
4. Category relevance
5. Engagement signals

Do not create opaque personalization that cannot be explained or controlled.

### Story interaction
- Tap/click story card to open article.
- Swipe-like interaction can be added later if a native/PWA-style experience proves useful.
- Save/bookmark.
- Share.
- Related stories.
- Source attribution.
- Clear indication of sponsored content when introduced.

## 8. Search

Search should cover:
- title
- summary
- body
- tags
- category
- company/entity names

MVP can use PostgreSQL full-text search. A dedicated search engine can be added when scale or relevance requirements justify it.

## 9. Authentication

Account features should support:
- email/password or passwordless authentication
- OAuth providers if required
- email verification
- password reset
- session management
- account deletion

Admin authentication must be separated from public-user privileges and protected with:
- strong password policy
- MFA for administrators
- rate limiting
- session expiration/rotation
- audit trails

## 10. Non-Functional Requirements

### Performance
- Server-render content where beneficial.
- Cache public content safely.
- Optimize images automatically.
- Avoid unnecessary client-side JavaScript.
- Paginate or cursor-load large feeds.
- Avoid N+1 queries.
- Use CDN/object storage for media.

### Security
- OWASP-aligned secure development.
- Parameterized queries/ORM.
- Schema validation on every external input.
- HTML sanitization for rich content.
- CSRF protection where cookie-based mutations are used.
- Secure, HTTP-only, SameSite cookies.
- Content Security Policy.
- Rate limiting.
- Brute-force protection.
- RBAC.
- Audit logging.
- Secret management.
- Dependency and vulnerability scanning.
- Backups and restore testing.

### Reliability
Target:
- graceful degradation
- centralized error logging
- health checks
- database backups
- queue retry strategy
- idempotent jobs
- observability

## 11. Analytics

Admin analytics should cover:
- views
- unique readers
- article opens
- completion/engagement proxy
- top categories
- top articles
- search terms
- bookmarks
- shares
- traffic source
- device breakdown
- publishing activity

Use privacy-conscious analytics practices.

## 12. Monetization Readiness

Do not overbuild monetization in MVP, but design extension points for:
- display ads
- sponsored stories
- branded content
- premium subscription
- newsletter sponsorships
- affiliate content

Sponsored/editorial separation must be technically and visually explicit.

## 13. SEO

Every public article/blog should support:
- canonical URL
- title
- meta description
- Open Graph
- Twitter/X card metadata
- Article structured data where appropriate
- breadcrumbs
- XML sitemap
- robots.txt
- category pages
- clean slugs

## 14. Accessibility

Target WCAG 2.2 AA principles:
- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- alt text
- reduced-motion support
- screen-reader labels
- accessible forms and error messages

## 15. Out of Scope for Initial MVP

- Native iOS/Android apps
- Complex recommendation ML
- Real-time market trading
- User-generated public articles
- Full social network
- Live chat
- Advanced ad marketplace
- Multi-tenant SaaS architecture

These can be considered later.

## 16. Acceptance Criteria

The MVP is ready for production when:
- Admin can securely sign in and manage content.
- A draft can move through review and publication states.
- Published content appears correctly on public feeds.
- Full articles have stable SEO URLs.
- Reader bookmarks persist across sessions.
- Search returns relevant content.
- Unauthorized users cannot access admin functionality.
- Sensitive admin actions are audited.
- Media uploads are validated and safely stored.
- Application has backups, monitoring, error handling, and deployment documentation.
- Core pages pass agreed performance and accessibility checks.

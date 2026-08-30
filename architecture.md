# Venture Atlas — System Architecture

## 1. Architecture Principles

Venture Atlas should use a **modular monolith first**, not microservices.

The goal is to keep the system easy to develop and operate while creating clear boundaries so individual modules can later be extracted.

Core principles:
- Next.js App Router
- TypeScript end-to-end
- PostgreSQL as source of truth
- ORM with strict typing
- Server-first rendering
- API boundaries for external and mutable operations
- Background jobs for slow/retryable work
- Object storage for media
- Redis for caching/rate limiting/queues where required
- Least-privilege security
- Observability from day one

## 2. High-Level Architecture

```text
Browser / PWA
      |
      v
CDN / WAF / TLS
      |
      v
Next.js Application
  |       |       |
  |       |       +--> Authentication / RBAC
  |       +----------> Content Services
  +------------------> Search / Feed / User Services
      |
      +--> PostgreSQL
      +--> Redis / Cache
      +--> Object Storage
      +--> Background Worker / Job Queue
      +--> Email / Notification Provider
      +--> Analytics / Observability
```

## 3. Recommended Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS Modules, Tailwind, or another controlled design system
- Accessible component primitives
- React Hook Form for complex forms if needed
- Zod for validation

### Backend
- Next.js Route Handlers / Server Actions where appropriate
- PostgreSQL
- Prisma or Drizzle ORM
- Redis
- Background queue such as BullMQ when async workloads justify it

### Storage
- S3-compatible object storage
- CDN for public media

### Auth
Use a mature authentication system or a carefully designed server-side session model. Do not hand-roll cryptography.

Possible implementation:
- Auth.js / equivalent
- PostgreSQL session persistence
- OAuth support
- MFA for admin accounts

## 4. Application Modules

Suggested code structure:

```text
src/
  app/
    (public)/
    admin/
    api/
  components/
    ui/
    news/
    blog/
    navigation/
    admin/
  features/
    auth/
    content/
    categories/
    tags/
    media/
    search/
    bookmarks/
    notifications/
    analytics/
    admin/
  server/
    db/
    auth/
    services/
    repositories/
    jobs/
    security/
  lib/
    validation/
    logging/
    rate-limit/
    seo/
    utils/
  types/
```

Keep domain logic out of random page components.

## 5. Data Model

Main entities:

```text
User
Role
Session
Article
BlogPost
Category
Tag
ArticleTag
MediaAsset
Author
Bookmark
Notification
AuditLog
ViewEvent
SearchEvent
ArticleVersion
PublicationSchedule
```

### Article

Core fields:
- id
- type
- title
- slug
- summary
- body
- sourceName
- sourceUrl
- sourceAuthor
- categoryId
- authorId
- status
- coverMediaId
- publishedAt
- createdAt
- updatedAt

### ArticleVersion

Store editorial revisions for:
- rollback
- audit
- editorial comparison

### AuditLog

Fields should include:
- id
- actorUserId
- action
- entityType
- entityId
- metadata
- IP hash/approved privacy-safe representation
- userAgent metadata where justified
- createdAt

Avoid storing raw sensitive credentials or secrets.

## 6. Feed Architecture

Do not compute complex feed ranking from scratch on every request.

MVP:
- database query
- indexed category/status/publishedAt fields
- cursor pagination
- cache popular queries

Later:
- precomputed feed candidates
- ranking workers
- personalization service

### Cursor pagination

Prefer cursor pagination:

```text
GET /api/feed?cursor=<opaque-token>&category=startups
```

Avoid large offset-based pagination on high-volume feeds.

## 7. Content Rendering

Article body should be represented as sanitized structured content.

Prefer:
- Markdown converted to safe HTML, or
- structured rich text JSON

Never directly render unsanitized admin input as HTML.

For rich HTML:
- sanitize on write
- sanitize again on read if the rendering boundary requires it
- apply an allowlist rather than a denylist

## 8. API Boundaries

Suggested API groups:

```text
/api/auth/*
/api/feed
/api/articles/*
/api/blogs/*
/api/categories
/api/search
/api/bookmarks/*
/api/user/*
/api/admin/articles/*
/api/admin/blogs/*
/api/admin/media/*
/api/admin/users/*
/api/admin/analytics/*
/api/admin/audit/*
```

Admin endpoints must independently enforce authorization. Never rely only on hiding UI controls.

## 9. Security Architecture

### Trust boundaries

```text
Public Internet
   |
   +--> WAF / rate limit
   |
   +--> Next.js
          |
          +--> Auth boundary
          +--> Validation boundary
          +--> Authorization boundary
          +--> Database boundary
          +--> Storage boundary
```

### Controls
- TLS everywhere
- secure session cookies
- rotating sessions
- MFA for admins
- RBAC
- request schema validation
- strict file validation
- signed upload URLs
- rate limits
- CSP
- secure headers
- dependency scanning
- secret rotation
- audit logs
- backups

## 10. Media Pipeline

Recommended flow:

```text
Admin selects image
      |
      v
Server authorizes upload
      |
      v
Signed upload URL
      |
      v
Object storage
      |
      v
Validation / processing job
      |
      +--> dimensions
      +--> MIME verification
      +--> compression
      +--> metadata stripping
      +--> variants
      |
      v
CDN delivery
```

Never trust a browser-provided file extension.

## 11. Caching

Cache only data that can safely be stale.

Good candidates:
- public category lists
- public article pages
- popular feed segments
- static assets

Avoid caching private/admin responses at shared caches.

Invalidation must happen after:
- publish
- unpublish
- update
- category changes

## 12. Background Jobs

Use jobs for:
- image processing
- scheduled publishing
- email notifications
- web push notifications
- sitemap regeneration
- analytics aggregation
- cache warming
- search indexing

Jobs must be:
- idempotent
- retryable
- observable
- safe against duplicate execution

## 13. Deployment

Recommended production pattern:

```text
Git repository
    |
    v
CI checks
    |
    +--> lint
    +--> typecheck
    +--> unit tests
    +--> integration tests
    +--> security/dependency checks
    |
    v
Preview
    |
    v
Production
```

Production infrastructure should separate:
- app
- database
- object storage
- cache/queue
- monitoring

Use managed services where possible.

## 14. Observability

Track:
- request latency
- status codes
- database latency
- queue failures
- authentication failures
- upload failures
- publication failures
- application exceptions

Use:
- structured logs
- error tracking
- uptime monitoring
- health endpoint
- basic tracing when justified

## 15. Disaster Recovery

Define:
- backup frequency
- retention
- recovery point objective (RPO)
- recovery time objective (RTO)

At minimum:
- automated database backups
- object-storage durability/versioning where available
- documented restore process
- periodic restore test

## 16. Scaling Path

### Phase 1
Single Next.js app + PostgreSQL + object storage.

### Phase 2
Add Redis/cache + queue worker.

### Phase 3
Add dedicated search only if PostgreSQL search becomes insufficient.

### Phase 4
Extract high-load modules only when measurable bottlenecks justify it.

Do not introduce microservices for theoretical scalability.

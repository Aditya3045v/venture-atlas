# Venture Atlas — Project Memory

This document is the persistent project context that should be read before making significant product or architectural changes.

## 1. Project Identity

**Project:** Venture Atlas

**Type:** Production web application

**Primary technology:** Next.js + TypeScript

**Core concept:** A fast, focused news and editorial platform for startup, venture, entrepreneurship, technology-business, funding, founders, and business news.

**Experience inspiration:** Short-form news consumption similar in spirit to Inshorts, while maintaining an original Venture Atlas brand and UI.

## 2. Primary Stakeholder

The client operates the platform through a secure admin panel.

The client needs to:
- upload news
- create blogs
- edit drafts
- review content
- publish/unpublish
- schedule articles
- manage categories/tags
- upload media
- view analytics
- manage users/roles
- review audit history

## 3. Product Priorities

Priority order:

1. Security
2. Reliability
3. Content management
4. Reading experience
5. Performance
6. SEO
7. Analytics
8. Growth/monetization

Do not sacrifice security or data integrity for cosmetic speed of delivery.

## 4. Technical Direction

Default architecture:
- modular monolith
- Next.js App Router
- TypeScript
- PostgreSQL
- ORM
- object storage
- CDN
- Redis when justified
- background jobs for asynchronous processing

Avoid premature microservices.

## 5. User Roles

Initial role model:

```text
USER
AUTHOR
EDITOR
ADMIN
```

Admin is the client's privileged role.

Admin must use MFA.

## 6. Content Types

Supported:
- News
- Blog

Potential future types:
- interviews
- explainers
- newsletters
- reports
- sponsored stories

Do not add future content types to MVP unless there is a concrete requirement.

## 7. Content Lifecycle

```text
DRAFT
IN_REVIEW
APPROVED
SCHEDULED
PUBLISHED
ARCHIVED
```

Rejected content can return to draft.

Every meaningful transition must be auditable.

## 8. Brand & UI Memory

Design direction:
- clean
- premium
- editorial
- modern
- business-centric
- highly readable
- rounded cards
- controlled whitespace
- subtle motion
- mobile-first

The uploaded UI reference is inspiration only.

Venture Atlas must maintain an original identity.

## 9. Editorial Principles

Every published news item should answer:
- What happened?
- Who is involved?
- Why does it matter?
- What is the source?
- When did it happen?

Use concise summaries for fast scanning.

Do not intentionally mislead users with clickbait headlines.

Sponsored content must be clearly labeled.

## 10. Security Memory

Never:
- store plaintext passwords
- expose privileged API keys to browser code
- trust client-side role flags
- render untrusted HTML without sanitization
- accept arbitrary file uploads without validation
- expose admin endpoints without authorization
- log credentials or tokens

Always:
- validate inputs
- authorize server-side
- use secure cookies/session handling
- rate-limit abuse-prone endpoints
- audit privileged changes
- back up production data

## 11. Performance Memory

Always consider:
- server rendering
- caching
- image optimization
- CDN
- pagination
- database indexes
- bundle size
- client/server boundaries

Do not add client-side state management by default. Introduce it only for a real need.

## 12. SEO Memory

All public articles should be:
- indexable when intended
- canonical
- shareable
- structured with article metadata
- included in sitemap

Admin pages should never be publicly indexed.

## 13. Data Governance

Collect the minimum user data required.

Provide:
- privacy policy
- terms
- cookie/consent behavior as legally required
- account deletion workflow where accounts are provided

Avoid collecting sensitive personal information without a clearly justified product need.

## 14. Important Architectural Decisions

### Decision: Modular monolith
Reason:
- faster initial development
- easier deployment
- easier debugging
- lower operational complexity

### Decision: PostgreSQL as source of truth
Reason:
- strong relational model
- transactions
- mature indexing/search features
- strong ecosystem

### Decision: Object storage for media
Reason:
- scalable
- safer separation from app runtime
- CDN compatibility

### Decision: Background jobs
Reason:
- prevents slow operations from blocking requests
- supports retries
- improves reliability for scheduled publishing and media processing

## 15. Future Decisions to Make Explicitly

Before implementing any of the following, record a decision:
- exact auth provider
- exact hosting provider
- exact object storage vendor
- exact ORM
- exact analytics provider
- push notification provider
- search engine
- monetization provider

Do not silently couple the entire application to one vendor without documenting the tradeoff.

## 16. Change Log

Use this section to record important changes.

### Template

```text
Date:
Decision:
Reason:
Impact:
Migration required:
Owner:
```

## 17. Current Product North Star

> Venture Atlas should become the fastest, cleanest, and most credible way for its audience to understand what is happening in the startup and business ecosystem.

Any feature that makes the product slower, noisier, less trustworthy, or harder to maintain should be challenged before being added.

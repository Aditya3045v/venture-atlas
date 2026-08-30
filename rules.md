# Venture Atlas — Engineering & Product Rules

These rules are mandatory guardrails for development.

## 1. General

1. Build for production, not a demo.
2. Prefer simple, explicit solutions over clever abstractions.
3. Keep business logic server-side where it protects trust or consistency.
4. Never assume the client/browser is trusted.
5. Do not duplicate domain logic across pages.
6. Do not ship secrets in frontend code.
7. Do not hardcode credentials, API keys, or privileged IDs.

## 2. Next.js Rules

- Prefer the App Router.
- Default to Server Components.
- Use Client Components only when interactivity requires them.
- Keep sensitive server logic outside client bundles.
- Use route handlers/server actions only with explicit validation and authorization.
- Do not expose database models directly to the client.

## 3. TypeScript Rules

- Use strict TypeScript.
- Avoid `any`.
- Define explicit input/output types for service boundaries.
- Validate external data at runtime using schemas.
- Treat environment variables as untrusted until validated.

## 4. Database Rules

- Use migrations for every schema change.
- Never manually alter production schema without a migration.
- Add indexes based on query patterns.
- Use foreign keys for relational integrity.
- Use transactions for multi-step state changes.
- Avoid N+1 queries.
- Use soft deletion only where business/audit needs justify it.

## 5. Content Rules

Every article must have:
- unique slug
- title
- summary
- category
- publication status
- source attribution when sourced externally

Do not publish copied content without editorial/legal permission.

Maintain source attribution where relevant.

## 6. Editorial Rules

Publication transitions must be explicit:

```text
DRAFT
  -> IN_REVIEW
  -> APPROVED
  -> SCHEDULED
  -> PUBLISHED
```

Only authorized roles may perform each transition.

Publishing and unpublishing must create audit records.

## 7. Security Rules

### Authentication
- MFA is mandatory for privileged admin accounts.
- Never store plaintext passwords.
- Never log passwords, tokens, session cookies, or secrets.
- Rotate sessions after authentication privilege changes.
- Revoke sessions after high-risk account changes.

### Authorization
Use server-side RBAC:
- USER
- AUTHOR
- EDITOR
- ADMIN

Authorization checks must happen on the server for every privileged operation.

### Input validation
Validate:
- query params
- JSON payloads
- form data
- uploaded files
- URLs
- rich text

Reject unexpected fields when practical.

### File uploads
- allowlist MIME types
- verify file signatures
- enforce size limits
- generate safe filenames
- remove dangerous metadata where appropriate
- store outside the application filesystem
- never execute uploaded files

### Web security
Implement:
- CSP
- HSTS in production
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy as appropriate
- secure cookie flags
- appropriate CORS policy
- rate limiting

## 8. Rate Limits

At minimum, rate-limit:
- login
- password reset
- verification
- search
- public APIs
- bookmark mutations
- admin APIs
- file upload creation

Rate limits should be stricter for authentication/admin actions.

## 9. Admin Rules

The admin panel is a privileged application.

Admin pages must:
- require authentication
- require role authorization
- avoid sensitive data leakage
- use anti-CSRF protections where applicable
- record critical mutations in audit logs
- support session revocation
- support MFA

Dangerous operations should require confirmation.

Examples:
- delete content
- delete user
- unpublish high-visibility content
- remove media
- modify admin permissions

## 10. SEO Rules

- Every indexable page needs deterministic metadata.
- Slugs must be stable.
- Use canonical URLs.
- Avoid accidental duplicate pages.
- Do not expose admin routes to search engines.
- Generate XML sitemaps from published content.

## 11. UI Rules

- Mobile-first.
- Responsive at all common breakpoints.
- No unnecessary animation.
- Respect `prefers-reduced-motion`.
- Loading states must be intentional.
- Empty states must explain what happened.
- Error states must be actionable.
- Never rely on color alone to communicate status.

## 12. Accessibility Rules

- Keyboard support is mandatory.
- Interactive controls need accessible names.
- Form errors must be associated with inputs.
- Images require meaningful alt text unless decorative.
- Maintain sensible heading hierarchy.
- Focus must never become invisible.
- Contrast must meet WCAG targets.

## 13. Performance Rules

- Optimize image delivery.
- Avoid shipping large client bundles.
- Lazy-load below-the-fold media.
- Use caching strategically.
- Avoid repeated API calls.
- Use cursor pagination.
- Prefer server-rendered content for SEO-critical pages.

## 14. API Rules

Each mutation endpoint must follow:

```text
authenticate
   -> authorize
   -> validate
   -> execute transaction
   -> audit
   -> return safe response
```

Never return:
- password hashes
- session secrets
- internal credentials
- unnecessary private user metadata

## 15. Logging Rules

Use structured logs.

Log:
- request ID
- actor ID when available
- action
- result
- latency
- error category

Do not log:
- passwords
- auth headers
- access tokens
- refresh tokens
- full payment information
- sensitive personal data unless necessary

## 16. Testing Rules

Required layers:
- unit tests for pure business logic
- integration tests for database/services
- end-to-end tests for critical user journeys

Critical journeys:
- login
- admin login
- create article
- review article
- publish article
- unpublish article
- search
- bookmark
- media upload
- permission denial

## 17. Git Rules

Use small, reviewable commits.

Branch example:

```text
main
develop
feature/*
fix/*
chore/*
```

Do not commit:
- `.env`
- private keys
- generated secrets
- large binary dumps

## 18. Definition of Done

A feature is not done until:
- UI works responsively.
- Server validation exists.
- Authorization exists.
- Errors are handled.
- Loading/empty states exist.
- Tests cover critical behavior.
- Analytics/logging is considered.
- SEO/accessibility impact is considered.
- No new security regression is introduced.

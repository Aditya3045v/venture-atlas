# Venture Atlas — Design System & UI Direction

## 1. Design Goal

Venture Atlas should feel like a **premium business/news product**: clean, fast, credible, editorial, modern, and easy to scan.

The uploaded reference image establishes the desired design direction:
- generous whitespace
- rounded cards
- concise content blocks
- strong hierarchy
- soft surfaces
- clear primary actions
- content-first composition
- mobile-first behavior

Use the reference as inspiration for interaction density and clarity, not as a pixel-for-pixel reproduction.

## 2. Brand Personality

The product should communicate:
- trustworthy
- intelligent
- energetic
- modern
- business-focused
- efficient

Avoid:
- noisy dashboards
- excessive gradients
- excessive glassmorphism
- giant decorative illustrations
- cluttered cards
- too many competing primary actions

## 3. Visual System

### Color roles

Use semantic tokens rather than hardcoded colors throughout components.

```text
--background
--surface
--surface-muted
--text-primary
--text-secondary
--text-tertiary
--border
--brand
--brand-strong
--success
--warning
--danger
```

Suggested visual direction:
- light neutral background
- white/near-white content surfaces
- dark readable text
- one recognizable brand accent
- subtle status colors

Dark mode can be added after the core light theme is stable.

## 4. Typography

Prioritize readability.

Recommended hierarchy:

```text
Display
H1
H2
H3
Body Large
Body
Caption
Label
```

Headlines should feel editorial and confident.

Avoid using many font families. One primary sans-serif plus an optional editorial display face is enough.

## 5. Layout

### Desktop
Use a centered content container with a constrained reading width.

Suggested structure:

```text
Header
------------------------------------------------
Main content
    Featured story
    Category navigation
    Story feed
    Side/secondary content where useful
------------------------------------------------
Footer
```

### Mobile
The mobile feed is the primary experience.

```text
Top bar
Category/filter strip
Hero/featured story
Story cards
Bottom navigation
```

Avoid desktop-first layouts that simply collapse on mobile.

## 6. Public Components

Core components:
- Header
- Logo
- Search
- Category tabs
- StoryCard
- FeaturedStory
- CompactStoryRow
- ArticleHero
- ArticleBody
- SourceBadge
- ReadTime
- SaveButton
- ShareButton
- RelatedStories
- AuthorBadge
- Pagination/load-more
- BottomNav
- Toast
- Modal
- Skeletons

## 7. Story Card

A story card should answer:

> What happened, why should I care, and can I read more?

Recommended content:
- image
- category
- headline
- 1–3 line summary
- source
- relative/absolute time
- read time
- save/share actions when appropriate

Use a consistent card rhythm.

## 8. Article Page

Suggested composition:

```text
Back / category
Headline
Subtitle or summary
Source + date + author
Hero image
Article body
Related stories
Share/save
```

The article page should optimize for reading, not dashboard density.

## 9. Admin Design

The admin panel can be more information-dense than the public app.

### Dashboard
- today's publications
- drafts awaiting review
- scheduled articles
- top stories
- traffic snapshot
- content health

### Content list
Use:
- search
- filters
- status chips
- category filter
- date filter
- author filter
- bulk actions where safe

### Editor
Two-column desktop editor:

```text
------------------------------------------------
| Main editor                    | Publishing  |
|                                | Controls    |
| Title                          | Status      |
| Summary                        | Category    |
| Body                           | Tags        |
| Media                          | Publish     |
|                                | SEO         |
------------------------------------------------
```

On mobile this becomes a single-column flow.

## 10. Motion

Animation should reinforce state changes.

Use:
- subtle card transitions
- page transitions only where useful
- skeleton shimmer
- modal entrance/exit
- button feedback

Avoid:
- constant floating movement
- long page animations
- animation that delays reading

Respect reduced-motion settings.

## 11. Responsive Breakpoints

Use a small, consistent breakpoint system rather than device-specific hacks.

Example:
```text
mobile
tablet
desktop
wide
```

Components should respond to available space, not named devices.

## 12. States

Every data-driven component should define:
- loading
- success
- empty
- error
- disabled
- offline/degraded where applicable

Example:

```text
Loading: skeleton
Empty: useful explanation + next action
Error: concise reason + retry
```

## 13. Accessibility

Design from accessibility constraints:
- minimum comfortable touch target
- focus ring
- keyboard navigation
- semantic landmarks
- accessible modal behavior
- screen-reader labels
- reduced motion
- meaningful image alternatives

## 14. Editorial Trust

Because Venture Atlas is a news product, design must visibly communicate credibility:
- clear source attribution
- publication/update timestamp
- author identity where applicable
- editorial labels
- sponsored labels
- corrections/update notices

Do not hide important source information.

## 15. Design Tokens

Recommended token families:
- spacing
- radius
- typography
- shadows
- color
- motion
- z-index

Example spacing scale:
```text
4, 8, 12, 16, 24, 32, 48, 64
```

Use tokens consistently.

## 16. Reference Image Translation

The uploaded reference suggests a useful interaction language:
- compact mobile cards
- strong headings
- rounded surfaces
- step/state-based flows
- clean action buttons

For Venture Atlas, translate that into:
- concise news cards
- category onboarding
- preference selection
- clean sign-in
- lightweight notifications
- premium editorial feed

Do not reuse the reference's exact brand names, images, copy, icons, or layout geometry.

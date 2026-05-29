# A Curious Note — CLAUDE.md

Project notes for Claude Code. Read this before touching any file.

---

## What this project is

A personal blog by Sherly. Four pages: Homepage, Post detail, About, Recommendations.
The design lives in `/design`. The implementation uses Next.js 14 with Supabase backend.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | `/design/styles.css` + `/app/globals.css` — **do not rewrite in Tailwind** |
| Database | Supabase (Postgres) |
| Client | `@supabase/supabase-js` — no ORM |
| Deployment | Vercel (FE + API routes) + Supabase Cloud (DB) |

---

## What is dynamic (backend-driven)

| Feature | Table | Route |
|---|---|---|
| Post list on homepage | `posts` | `GET /api/posts` |
| Post filtering by category | `posts` | `GET /api/posts?category=X` |
| Post search | `posts` (FTS via `search_vector`) | `GET /api/posts?search=X` |
| Load more (pagination) | `posts` | `GET /api/posts?page=N&limit=8` |
| Post detail content | `posts` | `GET /api/posts/[slug]` |
| Related posts | `posts` | `GET /api/posts?category=X&exclude=slug` |
| Submit an idea (footer) | `ideas` | `POST /api/ideas` |
| Recent ideas chips (footer) | `ideas` | `GET /api/ideas/recent` |

Everything else (reading mode, font size, accent color, reactions, bookmark, theme toggle) stays **client-side only** — localStorage, no DB.

---

## Database tables

### `posts`
```
id, title, slug, content (markdown/html), excerpt, pull_quote,
category (essay|craft|field|reading|systems|science|language|perspective|book|personal|environment|animal|others|uncategorized), tags[],
read_time, issue, cover_art (jsonb), post_thumbnail, text_only, featured,
published, published_at, created_at, updated_at, search_vector (generated)
```

### `ideas`
```
id, content (max 280), source_page, post_slug (FK → posts.slug),
ip_hash (for rate-limiting), created_at
```

---

## Project structure

```
app/
├── page.tsx                 # Homepage with hero video, posts grid
├── layout.tsx               # Root layout with fonts, metadata
├── globals.css              # Global styles, theme variables, animations
├── about/page.tsx           # About page with profile, reading list
├── recommendations/page.tsx # Affiliate products showcase
├── posts/[slug]/page.tsx    # Post detail with reading UI
├── api/posts/route.ts       # Posts API with caching
└── api/ideas/route.ts       # Ideas submission API

components/
├── PostsGrid.tsx            # Homepage post grid with filtering
├── PostPageUI.tsx           # Post detail UI with celebration
├── PostCard.tsx             # Individual post card
├── CoverThumb.tsx           # Thumbnail with SVG support
├── Footer.tsx               # Footer with idea widget
├── IdeaWidget.tsx           # Submit ideas component
├── Nav.tsx                  # Navigation bar
├── NotFoundGame.tsx         # 404 page game
└── ...

public/thumbnails/           # 30 SVG thumbnails with embedded CSS
```

---

## Design rules — do not break these

- **Import `styles.css` as-is.** Never rewrite it. It's the entire design system.
- **Accent color is dynamic.** Always use `var(--video-tint)` or `rgba(var(--video-r), var(--video-g), var(--video-b), α)`. Never hardcode hex values in new components.
- **Three themes.** Any new surface must work in `light`, `dark`, and `sepia` (sepia on post page only). Wire `html[data-theme="dark"]` overrides.
- **Glass surfaces.** New cards/panels use the `.glass` class — not flat fills.
- **Fonts:** Newsreader (headings/body), Geist (UI chrome), Geist Mono (eyebrows/meta), Nunito (nav brand only). No others.
- **Toasts:** only via `window.showToast(msg)` from `shared.js`. No custom banners.
- **No engagement UI.** No badge counters, no "X people reading this", no viral mechanics.

---

## Page → component map

| Page | Next.js route | Key components |
|---|---|---|
| Homepage | `app/page.tsx` | `<PostsGrid />`, `<IdeaWidget />`, `<Footer />` |
| Post detail | `app/posts/[slug]/page.tsx` | `<PostPageUI />`, `<IdeaWidget />`, `<Footer />` |
| About | `app/about/page.tsx` | `<Footer />` |
| Recommendations | `app/recommendations/page.tsx` | `<Footer />` |
| 404 | `app/not-found.tsx` | `<NotFoundGame />` |

---

## Key features implemented

### SVG Thumbnails
- 30 SVG files in `/public/thumbnails/`
- Each SVG has embedded CSS variables for theme adaptation
- CoverThumb component loads SVGs with proper lazy loading
- Fallback to generated art if no thumbnail

### Reading Celebration
- Fireworks animation when reaching end of post
- "Thank you for reading" modal with post title
- Triggered by IntersectionObserver on `.post-end`
- Shows once per session per post

### OG Images (Open Graph)
- Absolute URLs required: `https://acuriousnote.com/og-image.png`
- Homepage, About, Recommendations use static OG image
- Post pages use post thumbnail or fallback
- Twitter cards use `summary_large_image`

### API Caching
- `GET /api/posts` has `Cache-Control` headers
- Homepage uses `revalidate = 60` (ISR)
- Unfiltered results cached 60s, filtered 30s

---

## Admin write protection

`POST /api/posts`, `PUT /api/posts/[slug]`, `DELETE /api/posts/[slug]` check:
```
Authorization: Bearer <ADMIN_SECRET>
```
Use `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to client) for admin DB writes.

---

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL         # public — used in browser + server
NEXT_PUBLIC_SUPABASE_ANON_KEY    # public — read-only queries
SUPABASE_SERVICE_ROLE_KEY        # server only — admin writes
ADMIN_SECRET                     # server only — protects write API routes
```

---

## What NOT to do

- Do not rewrite `styles.css`
- Do not add Tailwind
- Do not add analytics or tracking
- Do not add a comments system
- Do not sync reactions (heart/resonate/reply) to the database — keep them localStorage-only
- Do not add fonts beyond the four listed above
- Do not replace SVG icons with emoji or icon libraries
- Do not hard-delete posts — soft-delete only (`published = false`)
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client

# A Curious Note — CLAUDE.md

Project notes for Claude Code. Read this before touching any file.

---

## What this project is

A personal blog by Sherly. Three pages: Homepage, Post detail, About.
The design is already built — it lives in `/design`. The job is to make it dynamic with a real backend, not to redesign anything.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | `/design/styles.css` imported globally — **do not rewrite in Tailwind** |
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
id, title, slug, content (markdown), excerpt, pull_quote,
category (essay|craft|field|reading|systems), tags[],
read_time, issue, cover_art (jsonb), text_only, featured,
published, published_at, created_at, updated_at, search_vector (generated)
```

### `ideas`
```
id, content (max 280), source_page, post_slug (FK → posts.slug),
ip_hash (for rate-limiting), created_at
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

| Design file | Next.js route | Key components |
|---|---|---|
| `A Curious Note - Homepage.html` | `app/page.tsx` | `<PostsGrid />`, `<IdeaWidget />`, `<Footer />` |
| `A Curious Note - Post.html` | `app/posts/[slug]/page.tsx` | `<PostInteractions />`, `<IdeaWidget />`, `<Footer />` |
| `A Curious Note - About.html` | `app/about/page.tsx` | static, `<Footer />` |

---

## JS migration strategy

| File | Strategy |
|---|---|
| `shared.js` | Copy to `/public`, load via `<Script strategy="afterInteractive">` in layout |
| `home.js` | POSTS array → seed SQL; filter/load-more UI logic → React state in `<PostsGrid />` |
| `post.js` | Reading mode, font, TOC, accent, reactions → `useEffect` in `<PostInteractions />` client component |
| `image-slot.js` | Copy to `/public`, load on about page only |

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

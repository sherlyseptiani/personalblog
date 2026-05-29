# A Curious Note — Design System

The visual language for Sherly's blog. Slate base + Apple-liquid-glass surfaces + editorial type. Four pages, three themes, one accent that breathes.

---

## 1 · Principles

| | |
|---|---|
| **Quiet over loud** | Confident silence is an affordance. No notification badges, count-up stats, or attention-grabbing motion. |
| **Editorial first** | The page reads like a small magazine. Serif headlines, serif lede, body copy that feels written by hand. |
| **Glass over fill** | Surfaces are translucent and stacked, with the ambient orbs and dot grid showing through. Flat fills are reserved for utility chrome. |
| **The accent breathes** | One dynamic accent color drives the entire UI. It's sampled from the homepage hero video and visibly cycles through pink/blue/grey hues across the day. |
| **Three themes, no excuses** | Every surface ships light + dark from day one; sepia is added on the reading-heavy post page. |

---

## 2 · Tokens

### 2.1 Color — slate base

Defined as CSS variables on `:root` and overridden per `data-theme`.

```
--slate-50  #f8fafc      --slate-500 #64748b
--slate-100 #f1f5f9      --slate-600 #475569
--slate-200 #e2e8f0      --slate-700 #334155
--slate-300 #cbd5e1      --slate-800 #1e293b
--slate-400 #94a3b8      --slate-900 #0f172a
                         --slate-950 #020617
```

### 2.2 Semantic — light

```
--bg               #f8fafc      page field
--bg-elev          #ffffff      elevated surface
--ink              #0f172a      primary text
--ink-2            #334155      body copy
--ink-3            #64748b      meta / eyebrow text
--line             rgba(15,23,42,0.08)
--line-strong      rgba(15,23,42,0.14)
```

### 2.3 Semantic — dark

```
--bg               #0a0f1a
--bg-elev          #0f1623
--ink              #eef2f8
--ink-2            #b9c2d2
--ink-3            #7d889b
--line             rgba(255,255,255,0.07)
--line-strong      rgba(255,255,255,0.14)
```

### 2.4 Semantic — sepia (post page only)

```
--bg               #f3ead8
--bg-elev          #faf3e2
--ink              #3b2a18
--ink-2            #5b4632
--ink-3            #8a7458
```

### 2.5 Accent — `--video-tint`

Computed live from `--video-r`, `--video-g`, `--video-b` (0–255 each). Use as `var(--video-tint)` or `rgba(var(--video-r), var(--video-g), var(--video-b), α)`.

Default boot: `86, 124, 148` (calm slate-teal).

Curated swatches:
- `86,124,148` slate-teal
- `217,107,138` rose
- `160,122,181` lavender
- `107,163,154` mint
- `192,138,100` peach-clay

### 2.6 Thumbnail Colors (SVG)

CSS variables for SVG thumbnails that adapt to theme:

```
--thumb-purple: #9869D3;
--thumb-purple-dark: #7048B0;
--thumb-lavender: #C4A8E8;
--thumb-lav-light: #E0D4F8;
--thumb-pink: #E8A0C0;
--thumb-pink-light: #F4D0E4;
--thumb-blue: #8CA8D8;
--thumb-blue-light: #C4D8F4;
--thumb-teal: #6BA39A;
--thumb-amber: #C08A64;
--thumb-ink: rgba(15,10,40,0.75);
--thumb-white: rgba(255,255,255,0.9);
```

---

## 3 · Glass primitive

Every elevated surface extends `.glass`:

```
background:        var(--glass-bg)
border:            1px solid var(--glass-border)
backdrop-filter:   blur(28px) saturate(180%)
box-shadow:        inner highlight + 1px ring + soft outer drop
border-radius:     22px (default)
```

A `.glass::before` overlay paints a thin specular highlight along the top edge.

---

## 4 · Typography

| Family | Stack | Used for |
|---|---|---|
| Newsreader | `"Newsreader", "Iowan Old Style", Georgia, serif` | Headings, lede, article body, pull-quotes |
| Geist | `"Geist", -apple-system, sans` | UI chrome (buttons, nav links) |
| Geist Mono | `"Geist Mono", ui-monospace, …` | Eyebrows, tags, meta, kbd |
| Nunito | (additional) | Nav brand wordmark |

### 4.1 Scale

```
hero h1       clamp(56, 7.2vw, 96)px
section h2    clamp(36, 4vw, 52)px
post h1       clamp(40, 5.2vw, 64)px
card h3       22 → 26 → 30px
body          16px / 1.55
article       19px / 1.7
.eyebrow      11px / 0.14em tracking / mono / uppercase
```

---

## 5 · Layout

| Container | Width | Notes |
|---|---|---|
| `.wrap` | `min(1280px, 100% − 48px)` | Page max-width |
| `.post-wrap` | `max-width: 740px` | Article column |
| Posts grid | CSS columns | 4 → 3 → 2 → 1 responsive |

Spacing rhythm: 8 / 14 / 18 / 24 / 32 / 56 / 64 / 96px

Breakpoints: `1200 / 1100 / 1000 / 900 / 800 / 780 / 700 / 520 / 480`

---

## 6 · Components

### 6.1 Nav (`.nav.glass`)

Sticky pill bar with conic-gradient brand mark. Links use `.nav-links`. Right side: search + theme toggle.

### 6.2 Buttons

| Class | Use |
|---|---|
| `.btn.btn-primary` | Filled accent. Gradient + outer glow. |
| `.btn.btn-ghost-bordered` | Glass with stronger border. |
| `.icon-btn` | 36px circular icon button. |

### 6.3 Cards

| Class | Use |
|---|---|
| `.post-card.glass` | Homepage post card with thumb + meta |
| `.post-card.text-only.glass` | No thumbnail, pull-quote style |
| `.post-card.featured` | Larger title treatment |
| `.about-card.glass` | Generic About card with sigil |

### 6.4 Post Page UI

- **Reading progress bar**: 3px gradient fixed to top
- **Floating rail** (left): Reading mode, A−/A+, theme, bookmark, share
- **TOC** (right): Sticky table of contents with scrollspy
- **Celebration**: Fireworks + "Thank you" modal at end of article

### 6.5 Idea Widget (footer)

Textarea with accent halo on focus. Submit button with paper-plane icon. Recent ideas as italic-serif chips.

---

## 7 · Motion

All transitions use `cubic-bezier(.2, .7, .2, 1)` (soft swing-out).

| Pattern | Where |
|---|---|
| **Scroll-reveal** | Cards fade in + translate when in view |
| **Blob drift** | 18–32s alternating keyframes on About |
| **Headline cycle** | Y-fade swap every 2.4–6s on About |
| **Hover lift** | -1 to -4px on cards/buttons |
| **Celebration** | Canvas fireworks burst at post end |

`prefers-reduced-motion: reduce` disables non-essential animations.

---

## 8 · Thumbnails

30 custom SVG illustrations in `/public/thumbnails/`:
- Dynamically colored via CSS custom properties
- Theme-adaptive (light/dark/sepia color values)
- Lazy loaded with IntersectionObserver
- Fallback to generated art if missing

Thumbnail kinds:
- `orb`, `pages`, `lines`, `wave`, `glass`
- `spines`, `grid`, `topo`, `tools`, `room`
- `leaves`, `mesh`, `objects`

---

## 9 · Pages

### Homepage
- Full-bleed hero video with color sampling
- 4-column masonry post grid
- Category filters with glitter animation
- Load-more pagination (8 posts at a time)

### Post
- Reading progress bar
- Floating left rail controls
- Right TOC (desktop)
- Drop-cap article, pull-quotes
- Reading celebration at end
- Related posts

### About
- Animated color-mesh hero
- Profile card with image-slot
- Headline word-cycle
- Currently reading strip
- Masonry of bio/facts/recommendations

### Recommendations
- Affiliate product grid
- Category chips
- Glass cards with accent borders

### 404
- Animated 404 digits
- Mini-game (Flappy Bird style)
- Colorful floating orbs

---

## 10 · State (localStorage)

| Key | Surface |
|---|---|
| `acn-theme` | light / dark / sepia |
| `acn-font-step` | post-page font size offset |
| `acn-font-family` | post-page font family |
| `acn-accent` | post-page accent rgb |
| `acn-notify` | homepage notify-me state |
| `acn-read` | array of read post slugs |
| `acn-bookmarks` | array of bookmarked post slugs |

---

*Last updated: Post-celebration feature, SVG thumbnails, OG image fixes*

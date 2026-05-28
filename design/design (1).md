# A Curious Note — design system

The visual language for Sherly's blog. Slate base + Apple-liquid-glass surfaces + editorial type. Three pages, three themes, one accent that breathes.

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

Defined as CSS variables on `:root` and overridden per `data-theme`. The `--ink-*` ramp is the universal text scale; `--line` / `--line-strong` are hairlines and borders.

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
--bg-elev          #ffffff      elevated surface (modals, lifted cards)
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

Computed live from `--video-r`, `--video-g`, `--video-b` (0–255 each). Use as `var(--video-tint)` or `rgba(var(--video-r), var(--video-g), var(--video-b), α)` for alpha variants. Default boot: `86, 124, 148` (a calm slate-teal).

The homepage extractor (`shared.js#bindVideoColorSync`) buckets each frame's pixels into 12 hue bins weighted by saturation, picks the top 3 vivid bins, rotates between them across samples (~1.4s) and boosts saturation before applying. The result is a tint that visibly shifts between pink / blue / grey as the cover plays.

Curated swatches available in the About Tweaks panel:
- `86,124,148` slate-teal
- `217,107,138` rose
- `160,122,181` lavender
- `107,163,154` mint (← currently selected)
- `192,138,100` peach-clay

### 2.6 Mesh palette (About hero, Say-Hi panel)

Six drifting radial blobs animated in CSS, used wherever a "colorful" background is needed without video:

```
pink     #f5b8c7      lavender #c6b5e0
peach    #f6c7a3      mint     #a7d8c5
sky      #b3d0e8      accent   rgba(var(--video-r), var(--video-g), var(--video-b), 0.6)
```

---

## 3 · Glass primitive

Every elevated surface (nav, cards, panels, toasts, filters, post-hero rail) extends `.glass`:

```
background:        var(--glass-bg)          /* ~55% white in light, ~50% slate in dark */
border:            1px solid var(--glass-border)
backdrop-filter:   blur(28px) saturate(180%)
box-shadow:        inner highlight + 1px ring + soft outer drop
border-radius:     22px (default)
```

A `.glass::before` overlay paints a thin specular highlight along the top edge (`linear-gradient` 0–28% at low opacity, `mix-blend: overlay`) — what gives the cards their wet-glass feel.

Radius scale: `--radius-card 22 / --radius-lg 28 / --radius-xl 36 / --radius-pill 999`.

---

## 4 · Typography

| Family | Stack | Used for |
|---|---|---|
| Newsreader | `"Newsreader", "Iowan Old Style", Georgia, serif` | Headings, lede, article body, pull-quotes, brand mark text in nav |
| Geist | `"Geist", -apple-system, … sans` | UI chrome (buttons, nav links, form labels) |
| Geist Mono | `"Geist Mono", ui-monospace, …` | Eyebrows, tags, meta, kbd, "PALETTE" chip, idea-widget helper text |
| Nunito | (additional, About page only) | The "A Curious Note" wordmark in nav |

### 4.1 Scale (heading sizes are responsive — clamp(min, vw, max))

```
hero h1       clamp(56, 7.2vw, 96)px     -0.035em       0.96
about h1      clamp(40, 4.6vw, 68)px     -0.035em       0.96
section h2    clamp(36,   4vw, 52)px     -0.03em        1
post h1       clamp(40, 5.2vw, 64)px     -0.028em       1.05
card h3       22 → 26 → 30px (size, featured, post-card.text-only)
body          16px / 1.55                 0
lede (serif)  clamp(18, 1.4vw, 22)px      0              1.5
article (serif) 19px / 1.7
.eyebrow      11px / 0.14em tracking / mono / uppercase
```

Headings always sit at `font-weight: 400` (the serif's regular cut) and use `text-wrap: balance` so multi-line titles break gracefully.

### 4.2 Specials

- **Drop cap** on the article's first paragraph (`::first-letter`, 76px, accent color).
- **Pull quote** centered, italic, 30px serif, accent left border.
- **Headline word-cycle** on About: a `.em-cycle` span fades through phrases with `transform: translateY(0.18em)` + `opacity`; the gradient sweeps four colors.

---

## 5 · Layout

| Container | Width | Notes |
|---|---|---|
| `.wrap`             | `min(1280px, 100% − 48px)` | Page max-width |
| `.post-wrap`        | `max-width: 740px`         | Article column |
| Sticky nav          | Same width as `.wrap`, `top: 16px`, pill-shaped glass |
| Posts grid          | CSS `column-count: 4` → 3 / 2 / 1 responsive |
| About masonry       | CSS `columns: var(--mason-cols, 2)` — 1 / 2 / 3 user-controlled |
| Related grid (post) | `grid-template-columns: repeat(3, 1fr)` |

Spacing rhythm: 8 / 14 / 18 / 24 / 32 / 56 / 64 / 96px (no formal rem scale — values are picked from this set).

Responsive breakpoints: `1200 / 1100 / 1000 / 900 / 800 / 780 / 700 / 520`.

---

## 6 · Components

### 6.1 Nav (`.nav.glass`)

Sticky pill bar with conic-gradient brand mark (pink → lavender → blue → mint → peach, ~85% alpha in light, ~75% in dark). Links use `.nav-links` (text pills, hover background, `.active` for current page). Right side: search + theme toggle as 36px `.icon-btn` circles.

### 6.2 Buttons

| Class | Use |
|---|---|
| `.btn.btn-primary`        | Filled accent. Gradient + outer glow tinted by `--video-tint`. |
| `.btn.btn-ghost-bordered` | Glass with a stronger border. Used for secondary actions like Notify-me. |
| `.notify-btn.on`          | "On" state of the notify button — fills with accent, swaps icon to a checkmark. |
| `.icon-btn`               | 36px circular icon button. |

### 6.3 Cards

| Class | Use |
|---|---|
| `.post-card.glass`              | Homepage post card (thumb + tag + h3 + preview + footline). Hover lifts by 4px and scales the thumb +4%. The footline arrow rotates -45° and fills with the accent on hover. |
| `.post-card.text-only.glass`    | No thumb. Pull-quote between title and footline. |
| `.post-card.featured`           | Same skeleton, larger h3 (30px). |
| `.about-card.glass`             | Generic About card. Has a `.card-eyebrow` slot with a small gradient sigil (idle shimmer). |
| `.now-card.glass`               | Compact "what I'm doing" tile with eyebrow / title / sub / decorative line-art glyph in the corner. |

### 6.4 Filters (`.filters.glass`)

Pill cluster. Active state = elevated white pill with hairline + soft inner highlight. Used in homepage post-section header.

### 6.5 Tags (`.tag`)

Eyebrow-style chip with a colored dot. Category dot colors:

```
essay    #7c8db5      reading  #a07ab5
craft    #c08a64      systems  #3f7a8c
field    #6ba39a
```

### 6.6 Floating rails (post page)

`.post-controls.glass` — vertical pill on the left at 50% top. Buttons: reading mode (book), A− / A+ font size (with serif "A" + sans ± sign so they're visually distinct), theme/color (8-petal flower), bookmark, share. Shrinks on scroll past 240px, expands on hover. Active button fills with accent.

`.post-aside.glass` — right-side TOC, sticky at 50% top, only shown ≥1200px. Active anchor gets `→` and accent color.

### 6.7 Reading progress

3px gradient bar fixed to `top: 0`, width = scroll progress, glowing accent shadow.

### 6.8 Toast (`.toast`)

Glass, theme-aware (light/dark). Auto-hides after 3.2s, has × close. Green gradient check badge for icon. Off-screen + opacity 0 + pointer-events none when inactive. Surface via `window.showToast(msg)`.

### 6.9 Toggles & sliders (Tweaks panel)

Segmented control = `.tp-seg` (pill cluster, active = elevated). Toggle = 36×20 pill that fills with accent on `.on`. Slider = native range styled with a 14px accent thumb.

### 6.10 Idea widget (footer)

Textarea inside a `.field` rounded-rect that grows a 4px accent halo on focus. Submit button = gradient accent pill with paper-plane icon. Recent ideas shown as italic-serif chips below.

### 6.11 Say-Hi panel (About)

Glass card with three slowly-drifting blurred mesh blobs underneath, an italic gradient "Say Hi." with blinking caret, and a 6-up grid of social tiles. Each tile has a 30px gradient icon square (unique per platform) + label + handle.

---

## 7 · Motion

All transitions use `cubic-bezier(.2, .7, .2, 1)` (a soft swing-out) at 200ms for hover / 400ms for state changes / 600–700ms for reveals.

| Pattern | Where |
|---|---|
| **Scroll-reveal** | Cards fade in + translate(24px → 0) when 12% in view. Stagger via `.r-d1` … `.r-d4`. |
| **Blob drift**    | 18–32s alternating keyframes, translate + scale, distinct per blob. About hero, Say-Hi panel. |
| **Headline cycle**| Y-fade swap every 2.4–6s (Tweaks-controlled). |
| **Sigil shimmer** | A diagonal white sweep across each card's gradient sigil, 4.5s loop. |
| **Profile float** | 7s alternating Y + slight rotate on About portrait. (Off by default in current state.) |
| **Status pulse**  | The green dot on "Available for one new project" pulses at 2s. Same pattern on the homepage hero eyebrow dot. |
| **Reading-strip bar** | Animates 0 → `--rs-pct` on load (2.5s ease-in-out). |
| **Hover lift**    | -1 or -4px on cards/buttons. Post-card thumb scales +4% on hover. |

`prefers-reduced-motion: reduce` short-circuits `.reveal` and any non-essential idle animation.

---

## 8 · Iconography

All custom SVG, 16–18px stroke-1.7 line icons (Lucide vocabulary). No emoji. Brand-platform icons (X, GitHub, LinkedIn, Threads, Instagram) use filled paths from their official trademarks.

Decorative thumbnails on post cards are procedurally generated from a small SVG vocabulary (`orb`, `pages`, `lines`, `wave`, `glass`, `spines`, `grid`, `topo`, `tools`, `room`, `leaves`, `mesh`, `objects`) so the homepage looks designed without needing photography.

---

## 9 · Patterns

### 9.1 Glass card recipe

```html
<div class="card-class glass">
  <div class="card-eyebrow">
    <span class="sigil" style="--sigil-a:#f5b8c7;--sigil-b:#c6b5e0;"></span>
    <span class="eyebrow">Section label</span>
  </div>
  <h3>Card title.</h3>
  <p>…</p>
</div>
```

Pair with `.reveal` (+ optional `.r-d1` / `.r-d2`) for scroll-in.

### 9.2 Accent-gradient text

```css
background: linear-gradient(135deg, var(--video-tint), color-mix(in oklab, var(--video-tint), black 25%));
-webkit-background-clip: text; background-clip: text; color: transparent;
```

Used for `<em>` in hero h1 and `.about-headline h1 .em-cycle .word` (latter uses a fixed 4-stop rainbow).

### 9.3 Soft inner-highlight on filled surfaces

Filled accent buttons / mesh thumbnails get a top-left highlight via `radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.55), transparent 50%)` overlaid on a base gradient — what gives them dimension without a hard bevel.

### 9.4 Eyebrow + headline + sub pattern

`<span class="eyebrow">Section label</span>` → `<h2>Title.</h2>` → optional `<p>` 16px serif sub. Used in every section header.

---

## 10 · Pages — what's where

### Homepage (`A Curious Note - Homepage.html`)
- `.about-hero`-style full-bleed video on the hero section, scrim fading from `--bg` on the left to transparent on the right
- "Palette" chip bottom-right showing the current sampled hex
- Notify-me button (browser Notification API + localStorage fallback)
- 4-column CSS-columns masonry of posts, 5 category filters, 8-at-a-time load-more
- Footer with submit-an-idea widget (toasts on send)

### Post (`A Curious Note - Post.html`)
- Top reading-progress bar, `R`/`Esc` keyboard shortcuts
- Floating left rail (reading mode, A−/A+, theme/accent panel, bookmark, share)
- Right TOC sticky at 50% top, scrollspy with `→` indicator
- Drop-cap article, pull-quote, figure with caption, reactions row, next-up link
- Related posts (3 cards) + footer

### About (`A Curious Note - About.html`)
- Animated CSS color-mesh hero (6 drifting blobs)
- Profile-card with image-slot for drop-your-photo, monogram fallback, status pill
- Headline word-cycle ("a dog mom / an avid reader / a programmer / a tennis player / a language learner / an animal lover / a science enthusiast")
- 4 meta pills (location, live local time, current accent hex, archive size)
- "Currently reading" strip with animated progress bar
- CSS-columns masonry of cards: bio, quick facts, "for me" affiliate list, "for Mochi" affiliate list, "Say Hi." consolidated contact panel
- Tweaks panel (columns, density, profile shape, mesh intensity, floating toggle, headline cycle speed, currently-reading visibility, status pill visibility + text, accent swatches)

---

## 11 · State persisted to localStorage

| Key | Surface |
|---|---|
| `acn-theme`         | light / dark / sepia, applied site-wide |
| `acn-font-step`     | post-page font size offset (-3 … +4) |
| `acn-font-family`   | post-page article font family override |
| `acn-accent`        | post-page accent rgb triplet |
| `acn-notify`        | homepage notify-me subscription state |

Tweaks panel values (About page) persist through the host edit-mode protocol — they're written back to the `EDITMODE-BEGIN/END` JSON block in the file itself, not to localStorage.

---

*Last updated: end of the Tweaks-panel iteration. Three pages live; the design system is the second draft and probably the right one.*

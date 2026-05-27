# Sherly's blog — project notes for Claude

This is a small personal-blog design project. Three pages:

| File | Purpose |
|---|---|
| `A Curious Note - Homepage.html` | Hero with full-bleed video that tints the rest of the UI; masonry posts grid with filters and load-more; footer with submit-an-idea widget. |
| `A Curious Note - Post.html` | Long-form post page with reading mode, floating left rail (font size, theme, bookmark, share), right TOC, accent palette picker. |
| `A Curious Note - About.html` | Colorful animated mesh hero; CSS-columns masonry of glass cards; consolidated "Say Hi" panel with 6 socials. Has Tweaks panel. |

Shared infra: `styles.css`, `shared.js` (theme + toast + video color sampler), `image-slot.js` (drag-drop portrait).

## Design system in one paragraph
Slate base palette + Apple-liquid-glass surfaces; serif (Newsreader) for headings/lede, sans (Geist) for UI chrome, mono (Geist Mono) for eyebrows/labels. Accent color is dynamic — sampled from the homepage hero video and applied as `--video-r/g/b` everywhere. All three pages support **light / dark**; the post page also has **sepia**.

See `design.md` for tokens, components, and patterns.

## House rules

- **Liquid glass first.** New surfaces should use the `.glass` primitive (semi-transparent fill, backdrop blur, soft inner highlight + outer shadow) rather than flat fills. Always test against both `--bg` and the video-tinted ambient orbs.
- **Color sync is sacred.** Don't hard-code accent hexes in new components — bind to `var(--video-tint)` or `rgba(var(--video-r), var(--video-g), var(--video-b), …)` so the page keeps breathing with the hero.
- **Three themes.** Always wire `html[data-theme="dark"]` overrides for any new surface. Test sepia on post-page changes.
- **Editorial typography.** Headings use Newsreader and stay at `font-weight: 400` with a tight tracking (`-0.02em`+); body copy in serif feels intentional, sans is reserved for UI. Don't reach for system-ui defaults.
- **Animation is quiet.** Slow drifts, soft cubic-beziers, opacity+y reveals. No bouncy springs, no jitter, no parallax. The reading-progress bar and the headline word-cycle on About are about the loudest things on the page.
- **Toasts must auto-hide.** `window.showToast(msg)` from `shared.js` is the only sanctioned toast surface — never inject ad-hoc fixed banners.
- **No engagement-pattern UI.** No badges, no count-up animations on the article, no "X people are reading this now". Sherly's voice is restraint.

## Things to keep in sync when adding pages

1. Top nav: brand → conic-gradient mark + "A Curious Note" in Nunito. Links: Writing / Notes / Reading / About / Subscribe.
2. Footer: identity + Elsewhere + Submit-an-idea widget. Reuse the markup, not a copy.
3. Theme button in nav uses `data-theme-toggle` / `toggleTheme()` from shared.js.
4. Page body must include `.ambient` + `.grain` divs at the top for the background field.
5. Add `data-screen-label="NN Name"` to top-level sections so user comments anchor cleanly.

## Things the user has been clear about

- **Hero video color sync** must visibly cycle (pink/blue/grey) — extractor lives in `shared.js#bindVideoColorSync`. It buckets pixels by hue, picks vivid bins, rotates between top 3 each sample so the accent shifts noticeably. Don't replace with a flat average.
- **"Living cover" / extra ornament pills** are not wanted. Keep hero chrome to: eyebrow, headline, lede, CTAs, palette chip.
- **About page hero is a CSS mesh**, not a video. The video pattern stays on the homepage only.
- **Reading mode** (post page) is a top-level affordance — accessible from the floating left rail and the `R` key. `Escape` exits.
- **Tweaks panel** on About uses the host's edit-mode protocol (`__edit_mode_available` / `__activate_edit_mode` / `__edit_mode_set_keys`) and the `/*EDITMODE-BEGIN*/{…}/*EDITMODE-END*/` block for persistence. Don't break the markers when editing that file.

## What not to do

- Don't pad the design with "stats" sections, badge grids, KPI counters, or trust-logo strips. Cut, don't add.
- Don't introduce additional fonts. Three is enough.
- Don't replace SVG icons with emoji.
- Don't promote anything to a gradient background just because there's empty space — let the ambient orbs and dot grid do that work.
- Don't ship a new page without verifying the toast, theme toggle, and nav all still work.

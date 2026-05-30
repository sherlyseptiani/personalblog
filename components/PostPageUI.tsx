'use client'

import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Link from 'next/link'
import Footer from './Footer'
import { CATEGORIES, formatDate } from '@/lib/categories'
import { decodeEntities } from '@/lib/decode'
import type { Post } from '@/lib/types'

type TocItem = { level: number; text: string; id: string }

type Props = {
  post: Post
  nextPost: Post | null
  tocItems: TocItem[]
}

function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h[23]>/gi,
    (match, level, attrs = '', inner) => {
      if (/\bid\s*=/i.test(attrs)) return match
      const text = inner.replace(/<[^>]+>/g, '').trim()
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
      if (!id) return match
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`
    }
  )
}

export default function PostPageUI({ post, nextPost, tocItems }: Props) {
  const cat = CATEGORIES[post.category] ?? { label: post.category, color: '#7c8db5' }
  const date = formatDate(post.published_at)
  const art = post.cover_art ?? {}

  useEffect(() => {
    // Reading mode
    const readingBtn = document.getElementById('readingBtn')
    const readingBtnMobile = document.getElementById('readingBtnMobile')
    const syncReadingBtn = () => {
      const on = document.documentElement.classList.contains('reading-mode')
      readingBtn?.classList.toggle('active', on)
      readingBtnMobile?.classList.toggle('active', on)
    }
    window.enterReading = () => { document.documentElement.classList.add('reading-mode'); syncReadingBtn() }
    window.exitReading = () => { document.documentElement.classList.remove('reading-mode'); syncReadingBtn() }
    window.toggleReading = () => { document.documentElement.classList.toggle('reading-mode'); syncReadingBtn() }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.exitReading?.()
      if (e.key.toLowerCase() === 'r' && !/input|textarea/i.test((e.target as HTMLElement).tagName)) {
        window.toggleReading?.()
      }
    }
    document.addEventListener('keydown', handleKey)

    // Font size
    let fontStep = parseInt(localStorage.getItem('acn-font-step') || '0', 10)
    const applyFont = () => {
      fontStep = Math.max(-3, Math.min(4, fontStep))
      const article = document.querySelector('.article') as HTMLElement | null
      if (article) article.style.fontSize = (19 + fontStep) + 'px'
      try { localStorage.setItem('acn-font-step', String(fontStep)) } catch {}
    }
    window.adjustFont = (d: number) => { fontStep += d; applyFont() }
    applyFont()

    // Font family
    window.setFont = (family: string) => {
      const article = document.querySelector('.article') as HTMLElement | null
      const map: Record<string, string> = { serif: 'var(--font-serif)', sans: 'var(--font-sans)', mono: 'var(--font-mono)' }
      if (article) article.style.fontFamily = map[family] || map.serif
      try { localStorage.setItem('acn-font-family', family) } catch {}
      document.querySelectorAll('[data-font-target]').forEach(b =>
        b.classList.toggle('active', (b as HTMLElement).dataset.fontTarget === family)
      )
    }
    const savedFont = localStorage.getItem('acn-font-family')
    if (savedFont) window.setFont(savedFont)

    // Accent color
    const applyAccent = (rgbStr: string) => {
      const [r, g, b] = rgbStr.split(',').map(s => parseInt(s.trim(), 10))
      document.documentElement.style.setProperty('--video-r', String(r))
      document.documentElement.style.setProperty('--video-g', String(g))
      document.documentElement.style.setProperty('--video-b', String(b))
      try { localStorage.setItem('acn-accent', rgbStr) } catch {}
      document.querySelectorAll('#accentRow .swatch').forEach(s =>
        s.classList.toggle('active', (s as HTMLElement).dataset.color === rgbStr)
      )
    }
    applyAccent(localStorage.getItem('acn-accent') || '86,124,148')

    const accentRow = document.getElementById('accentRow')
    const handleAccent = (e: Event) => {
      const b = (e.target as HTMLElement).closest('.swatch') as HTMLElement | null
      if (b?.dataset.color) applyAccent(b.dataset.color)
    }
    accentRow?.addEventListener('click', handleAccent)

    // Theme panel toggle
    const themePanel = document.getElementById('themePanel')
    const themeBtn = document.getElementById('themeBtn')
    const themeBtnMobile = document.getElementById('themeBtnMobile')
    const syncThemeBtn = () => {
      const on = !!themePanel?.classList.contains('open')
      themeBtn?.classList.toggle('active', on)
      themeBtnMobile?.classList.toggle('active', on)
    }
    window.togglePanel = () => { themePanel?.classList.toggle('open'); syncThemeBtn() }
    const handleOutside = (e: MouseEvent) => {
      if (themePanel?.classList.contains('open') && !themePanel.contains(e.target as Node) && !(e.target as HTMLElement).closest('#themeBtn') && !(e.target as HTMLElement).closest('#themeBtnMobile')) {
        themePanel.classList.remove('open'); syncThemeBtn()
      }
    }
    document.addEventListener('click', handleOutside)
    ;['light', 'sepia', 'dark'].forEach(t => {
      document.querySelectorAll(`[data-theme-target="${t}"]`).forEach(b =>
        b.classList.toggle('active', document.documentElement.dataset.theme === t)
      )
    })

    // Reading progress
    const progress = document.getElementById('readProgress')
    const articleEl = document.querySelector('.post-wrap') as HTMLElement | null
    const postControls = document.getElementById('postControls')
    const updateProgress = () => {
      if (!articleEl || !progress) return
      const rect = articleEl.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))
      progress.style.width = (pct * 100) + '%'
      postControls?.classList.toggle('shrunk', window.scrollY > 240)
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    // TOC scrollspy
    const tocLinks = document.querySelectorAll('#toc a')
    const sectionIds = Array.from(tocLinks).map(a => a.getAttribute('href')?.slice(1)).filter(Boolean) as string[]
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const updateToc = () => {
      const y = window.scrollY + 200
      let active = sections[0]
      for (const s of sections) { if (s.offsetTop <= y) active = s }
      if (!active) return
      tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active.id))
    }
    window.addEventListener('scroll', updateToc, { passive: true })
    updateToc()

    // Mark as read + reading celebration when reaching the end of the article
    const postEndEl = document.querySelector('.post-end')
    let celebrated = false
    let readObserver: IntersectionObserver | null = null
    if (postEndEl) {
      readObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return
          // Show celebration if not already shown
          if (!celebrated) {
            celebrated = true
            try {
              showFireworks?.()
            } catch (e) {
              console.error('Celebration error:', e)
            }
          }
          // Mark as read in localStorage
          try {
            const stored = localStorage.getItem('acn-read')
            const readList: string[] = stored ? JSON.parse(stored) : []
            if (!readList.includes(post.slug)) {
              readList.push(post.slug)
              localStorage.setItem('acn-read', JSON.stringify(readList))
              window.dispatchEvent(new StorageEvent('storage', { key: 'acn-read', newValue: JSON.stringify(readList) }))
            }
          } catch {}
          readObserver?.disconnect()
        },
        { threshold: 0.5 }
      )
      readObserver.observe(postEndEl)
    }

    // Fireworks celebration
    function showFireworks() {
      const canvas = document.createElement('canvas')
      canvas.className = 'fireworks-canvas'
      canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1000;'
      document.body.appendChild(canvas)

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)

      const particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        alpha: number
        color: string
        size: number
        decay: number
      }> = []
      const colors = ['#ff4d8d', '#ff8f3f', '#ffd43b', '#43d17a', '#3fa9ff', '#b388ff', '#ff6ec7', '#ffffff']

      function createBurst(x: number, y: number) {
        const count = 34 + Math.random() * 22
        const hue = colors[Math.floor(Math.random() * colors.length)]
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
          const speed = 2.5 + Math.random() * 4.5
          const color = Math.random() < 0.7 ? hue : colors[Math.floor(Math.random() * colors.length)]
          particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color,
            size: 1.5 + Math.random() * 2.8,
            decay: 0.012 + Math.random() * 0.01
          })
        }
      }

      let burstCount = 0
      const maxBursts = 8
      function launchBurst() {
        if (burstCount >= maxBursts) return
        const x = (0.2 + Math.random() * 0.6) * rect.width
        const y = (0.3 + Math.random() * 0.4) * rect.height
        createBurst(x, y)
        burstCount++
        setTimeout(launchBurst, 220 + Math.random() * 280)
      }
      launchBurst()

      function animate() {
        if (!ctx) return
        ctx.clearRect(0, 0, rect.width, rect.height)
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.05
          p.vx *= 0.98
          p.alpha -= p.decay
          if (p.alpha <= 0) {
            particles.splice(i, 1)
            continue
          }
          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        if (particles.length > 0 || burstCount < maxBursts) {
          requestAnimationFrame(animate)
        } else {
          setTimeout(() => canvas.remove(), 500)
        }
      }
      animate()
    }

    // Reactions
    window.toggleReact = (btn: HTMLElement) => {
      btn.classList.toggle('active')
      const count = btn.querySelector('.count')
      if (count) {
        let n = parseInt(count.textContent || '0', 10)
        count.textContent = String(n + (btn.classList.contains('active') ? 1 : -1))
      }
    }

    // Share + bookmark
    window.shareLink = () => {
      try { navigator.clipboard?.writeText?.(location.href) } catch {}
      ;(window as any).showToast?.('Link copied')
    }
    window.toggleBookmark = () => {
      const btn = document.getElementById('bookmarkBtn')
      const btnMobile = document.getElementById('bookmarkBtnMobile')
      btn?.classList.toggle('active')
      btnMobile?.classList.toggle('active')

      // Try to trigger browser bookmark dialog
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D'

      // Try legacy IE method
      if ((window as any).external && 'AddFavorite' in (window as any).external) {
        try {
          (window as any).external.AddFavorite(location.href, document.title)
          return
        } catch {}
      }

      // Show instructions toast
      ;(window as any).showToast?.(`Press ${shortcut} to bookmark`)

      // Focus the bookmark star briefly to draw attention
      setTimeout(() => btn?.classList.add('pulse'), 100)
      setTimeout(() => btn?.classList.remove('pulse'), 600)
    }

    return () => {
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('scroll', updateToc)
      document.removeEventListener('click', handleOutside)
      accentRow?.removeEventListener('click', handleAccent)
      readObserver?.disconnect()
    }
  }, [post.slug])

  return (
    <>
      <div className="read-progress" id="readProgress"></div>

      <button className="reading-exit" onClick={() => window.exitReading?.()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
        Exit reading
        <span className="kbd">esc</span>
      </button>

      {/* Floating left controls */}
      <aside className="post-controls glass" id="postControls">
        <button onClick={() => window.toggleReading?.()} aria-label="Reading mode" id="readingBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="tooltip">Reading mode <span className="kbd" style={{ marginLeft: '6px' }}>R</span></span>
        </button>
        <button onClick={() => window.adjustFont?.(-1)} aria-label="Smaller text">
          <span className="font-icon"><span className="a small">A</span><span className="sign">−</span></span>
          <span className="tooltip">Smaller text</span>
        </button>
        <button onClick={() => window.adjustFont?.(1)} aria-label="Larger text">
          <span className="font-icon"><span className="a big">A</span><span className="sign">+</span></span>
          <span className="tooltip">Larger text</span>
        </button>
        <div className="sep"></div>
        <button onClick={() => window.togglePanel?.()} aria-label="Theme & color" id="themeBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            <ellipse cx="12" cy="6" rx="2.4" ry="3.2" />
            <ellipse cx="12" cy="18" rx="2.4" ry="3.2" />
            <ellipse cx="6" cy="12" rx="3.2" ry="2.4" />
            <ellipse cx="18" cy="12" rx="3.2" ry="2.4" />
            <ellipse cx="7.8" cy="7.8" rx="2.4" ry="3.2" transform="rotate(-45 7.8 7.8)" />
            <ellipse cx="16.2" cy="16.2" rx="2.4" ry="3.2" transform="rotate(-45 16.2 16.2)" />
            <ellipse cx="16.2" cy="7.8" rx="2.4" ry="3.2" transform="rotate(45 16.2 7.8)" />
            <ellipse cx="7.8" cy="16.2" rx="2.4" ry="3.2" transform="rotate(45 7.8 16.2)" />
          </svg>
          <span className="tooltip">Theme &amp; color</span>
        </button>
        <button onClick={() => window.toggleBookmark?.()} aria-label="Bookmark" id="bookmarkBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span className="tooltip">Bookmark</span>
        </button>
        <button onClick={() => window.shareLink?.()} aria-label="Share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
          </svg>
          <span className="tooltip">Copy link</span>
        </button>
      </aside>

      {/* Mobile bottom controls bar */}
      <div className="post-controls-mobile glass">
        <button onClick={() => window.toggleReading?.()} aria-label="Reading mode" id="readingBtnMobile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="18" height="18">
            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
          </svg>
        </button>
        <button onClick={() => window.adjustFont?.(-1)} aria-label="Smaller text">
          <span className="font-icon"><span className="a small">A</span><span className="sign">−</span></span>
        </button>
        <button onClick={() => window.adjustFont?.(1)} aria-label="Larger text">
          <span className="font-icon"><span className="a big">A</span><span className="sign">+</span></span>
        </button>
        <div className="mob-sep" />
        <button onClick={() => window.togglePanel?.()} aria-label="Theme & color" id="themeBtnMobile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            <ellipse cx="12" cy="6" rx="2.4" ry="3.2" />
            <ellipse cx="12" cy="18" rx="2.4" ry="3.2" />
            <ellipse cx="6" cy="12" rx="3.2" ry="2.4" />
            <ellipse cx="18" cy="12" rx="3.2" ry="2.4" />
            <ellipse cx="7.8" cy="7.8" rx="2.4" ry="3.2" transform="rotate(-45 7.8 7.8)" />
            <ellipse cx="16.2" cy="16.2" rx="2.4" ry="3.2" transform="rotate(-45 16.2 16.2)" />
            <ellipse cx="16.2" cy="7.8" rx="2.4" ry="3.2" transform="rotate(45 16.2 7.8)" />
            <ellipse cx="7.8" cy="16.2" rx="2.4" ry="3.2" transform="rotate(45 7.8 16.2)" />
          </svg>
        </button>
        <button onClick={() => window.toggleBookmark?.()} aria-label="Bookmark" id="bookmarkBtnMobile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="18" height="18">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button onClick={() => window.shareLink?.()} aria-label="Share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="18" height="18">
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
          </svg>
        </button>
      </div>

      {/* Theme panel */}
      <div className="theme-panel glass" id="themePanel">
        <div>
          <div className="col-title">Mode</div>
          <div className="theme-opts">
            <button data-theme-target="light" onClick={() => (window as any).setTheme?.('light')}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
              </svg>Light
            </button>
            <button data-theme-target="sepia" onClick={() => (window as any).setTheme?.('sepia')}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" />
              </svg>Sepia
            </button>
            <button data-theme-target="dark" onClick={() => (window as any).setTheme?.('dark')}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>Dark
            </button>
          </div>
        </div>
        <div>
          <div className="col-title">Accent</div>
          <div className="swatch-row" id="accentRow">
            {[
              ['86,124,148', 'rgb(86,124,148)'],
              ['192,138,100', 'rgb(192,138,100)'],
              ['107,163,154', 'rgb(107,163,154)'],
              ['160,122,181', 'rgb(160,122,181)'],
              ['180,90,90', 'rgb(180,90,90)'],
            ].map(([color, bg]) => (
              <button key={color} className="swatch" data-color={color} style={{ background: bg }} />
            ))}
          </div>
        </div>
        <div>
          <div className="col-title">Font</div>
          <div className="theme-opts">
            <button data-font-target="serif" className="active" onClick={() => window.setFont?.('serif')} style={{ fontFamily: 'var(--font-serif)' }}>Serif</button>
            <button data-font-target="sans" onClick={() => window.setFont?.('sans')} style={{ fontFamily: 'var(--font-sans)' }}>Sans</button>
            <button data-font-target="mono" onClick={() => window.setFont?.('mono')} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Mono</button>
          </div>
        </div>
      </div>

      {/* TOC */}
      {tocItems.length > 0 && (
        <aside className="post-aside glass" id="postAside">
          <div className="col-title">In this post</div>
          <nav className="toc" id="toc">
            {tocItems.map((item, i) => (
              <a
                key={i}
                href={`#${item.id}`}
                className={i === 0 ? 'active' : ''}
                style={item.level === 3 ? { paddingLeft: '16px', fontSize: '12px' } : undefined}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </aside>
      )}

      {/* Article */}
      <article className="post-wrap" data-screen-label="article">
        <header className="post-hero">
          <div className="meta">
            <span className="tag">
              <span className="tag-dot" style={{ background: cat.color }}></span>
              {cat.label}
            </span>
            <span className="sep">·</span>
            <span>{date}</span>
            <span className="sep">·</span>
            <span>{post.read_time} min read</span>
            {post.issue && (
              <><span className="sep">·</span><span>{post.issue}</span></>
            )}
          </div>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="deck">{decodeEntities(post.excerpt)}</p>}
          <div className="author-row">
            <img className="avatar" src="/portrait.jpg" alt="Sherly" style={{ objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />
            <div className="info">
              <div className="name">A Curious Note</div>
              <div className="sub">written by Sherly · Jakarta</div>
            </div>
            <div className="actions">
              <button className="icon-btn" title="Bookmark" onClick={() => window.toggleBookmark?.()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <button className="icon-btn" title="Share" onClick={() => window.shareLink?.()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {!post.text_only && art.p1 && (
          <div className="post-cover">
            <div className="ph-cover" style={{ '--p1': art.p1, '--p2': art.p2 } as React.CSSProperties}>
              <svg width="100%" height="100%" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <radialGradient id="cv1" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                  <pattern id="cvg" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="1200" height="675" fill="url(#cvg)" />
                <circle cx="380" cy="320" r="220" fill="url(#cv1)" />
                <circle cx="380" cy="320" r="220" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <circle cx="380" cy="320" r="140" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              </svg>
            </div>
            <div className="caption">Cover · {post.title}</div>
          </div>
        )}

        <div className="article" id="articleBody">
          {post.content && (post.content.match(/<\w+/) || post.content.includes('&lt;')) ? (
            <div dangerouslySetInnerHTML={{
              __html: injectHeadingIds(
                post.content.includes('&lt;')
                  ? post.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
                  : post.content
              )
            }} />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {post.content}
            </ReactMarkdown>
          )}
        </div>

        <div className="post-end glass">
          {nextPost ? (
            <div className="next-up">
              <span>Next up →</span>
              <Link href={`/posts/${nextPost.slug}`}>{nextPost.title}</Link>
            </div>
          ) : (
            <div className="next-up">
              <span>You&rsquo;ve reached the beginning.</span>
              <Link href="/">← Back to all posts</Link>
            </div>
          )}
        </div>
      </article>

      <Footer sourcePage={`post:${post.slug}`} postSlug={post.slug} compact />
    </>
  )
}

declare global {
  interface Window {
    enterReading?: () => void
    exitReading?: () => void
    toggleReading?: () => void
    adjustFont?: (d: number) => void
    setFont?: (family: string) => void
    togglePanel?: () => void
    toggleReact?: (btn: HTMLElement, kind: string) => void
    shareLink?: () => void
    toggleBookmark?: () => void
  }
}

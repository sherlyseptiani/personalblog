'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import './tools.css'

// IDR formatting
function rp(n: number) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(n))
}

const TOTAL = 500000

const MODES: Record<string, {
  acc: string
  sub: string
  shares: number[]
  pct: number[] | null
  status: string
}> = {
  equal: {
    acc: '111,155,209',
    sub: 'Everyone included pays the same share.',
    shares: [250000, 250000],
    pct: null,
    status: 'Fully allocated · Rp 250.000 each'
  },
  custom: {
    acc: '192,138,100',
    sub: 'Type exactly what each person owes.',
    shares: [300000, 200000],
    pct: null,
    status: 'Fully allocated'
  },
  percentage: {
    acc: '160,122,181',
    sub: 'Give everyone a percentage of the whole.',
    shares: [300000, 200000],
    pct: [60, 40],
    status: '100% assigned · balanced'
  },
  itemized: {
    acc: '217,107,138',
    sub: 'Tap who shared each item; tax follows along.',
    shares: [300000, 200000],
    pct: null,
    status: '3 items · all assigned'
  }
}

export default function ToolsClient() {
  const [currentMode, setCurrentMode] = useState('itemized')
  const [shown, setShown] = useState([250000, 250000])
  const [isLit, setIsLit] = useState(false)
  const featureRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const cloudRef = useRef<HTMLDivElement>(null)
  const wiresRef = useRef<SVGSVGElement>(null)
  const tweensRef = useRef<number[]>([0, 0])
  const userTouchedRef = useRef(false)
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const current = MODES[currentMode]

  function setMode(mode: string, animate: boolean) {
    const m = MODES[mode]
    if (!m) return

    setCurrentMode(mode)

    // Update bar widths and pct visibility
    const rows = document.querySelectorAll('#demo .tl-person')
    rows.forEach((row, i) => {
      const target = m.shares[i]
      const barEl = row.querySelector('[data-bar]') as HTMLElement
      const pctEl = row.querySelector('[data-pct]') as HTMLElement

      if (barEl) {
        barEl.style.width = (target / TOTAL * 100).toFixed(1) + '%'
      }

      if (m.pct) {
        row.classList.add('show-pct')
        if (pctEl) pctEl.textContent = m.pct[i] + '%'
      } else {
        row.classList.remove('show-pct')
      }

      // Number tween
      if (tweensRef.current[i]) cancelAnimationFrame(tweensRef.current[i])

      const amtEl = row.querySelector('[data-amt]') as HTMLElement
      if (!amtEl) return

      if (!animate || reduceMotion) {
        const newShown = [...shown]
        newShown[i] = target
        setShown(newShown)
        amtEl.textContent = rp(target)
        return
      }

      const from = shown[i]
      const dur = 620
      const t0 = performance.now()

      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur)
        const e = 1 - Math.pow(1 - k, 3)
        const v = from + (target - from) * e
        const newShown = [...shown]
        newShown[i] = v
        setShown(newShown)
        amtEl.textContent = rp(v)
        if (k < 1) {
          tweensRef.current[i] = requestAnimationFrame(step)
        }
      }

      tweensRef.current[i] = requestAnimationFrame(step)
    })
  }

  // Draw connector wires
  function drawWires() {
    const cloud = cloudRef.current
    const wires = wiresRef.current
    if (!cloud || !wires) return

    const live = cloud.querySelector('#liveToken') as HTMLElement
    const ghosts = cloud.querySelectorAll('.tl-token.ghost')
    const cr = cloud.getBoundingClientRect()

    if (!live) return
    const c = live.getBoundingClientRect()
    const cx = c.left + c.width / 2 - cr.left
    const cy = c.top + c.height / 2 - cr.top

    let svgContent = ''
    ghosts.forEach(g => {
      const b = g.getBoundingClientRect()
      const gx = b.left + b.width / 2 - cr.left
      const gy = b.top + b.height / 2 - cr.top
      svgContent += `<line x1="${cx.toFixed(0)}" y1="${cy.toFixed(0)}" x2="${gx.toFixed(0)}" y2="${gy.toFixed(0)}"/>`
    })

    wires.innerHTML = svgContent
  }

  useEffect(() => {
    // Initial setup
    setMode('itemized', false)

    // Draw wires after mount
    setTimeout(drawWires, 60)
    window.addEventListener('resize', drawWires)

    // Auto-advance once after a beat
    if (!reduceMotion) {
      setTimeout(() => {
        if (!userTouchedRef.current) setMode('equal', true)
      }, 1100)
    }

    // Scroll reveals
    const revealers = document.querySelectorAll('.reveal')
    if (revealers.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            obs.unobserve(en.target)
          }
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

      revealers.forEach(el => io.observe(el))
    } else {
      revealers.forEach(el => el.classList.add('in'))
    }

    return () => {
      window.removeEventListener('resize', drawWires)
    }
  }, [])

  // Hero pointer spotlight
  const handleHeroPointerMove = (e: React.PointerEvent) => {
    if (reduceMotion || !heroRef.current) return
    const r = heroRef.current.getBoundingClientRect()
    heroRef.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%')
    heroRef.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%')
    setIsLit(true)
  }

  const handleHeroPointerLeave = () => {
    setIsLit(false)
  }

  // Feature glow
  const handleFeaturePointerMove = (e: React.PointerEvent) => {
    if (!featureRef.current) return
    const r = featureRef.current.getBoundingClientRect()
    featureRef.current.style.setProperty('--fmx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%')
    featureRef.current.style.setProperty('--fmy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%')
  }

  // Cloud pointer drift
  const handleCloudPointerMove = (e: React.PointerEvent) => {
    if (reduceMotion || !cloudRef.current) return
    const r = cloudRef.current.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5

    const tokens = cloudRef.current.querySelectorAll('.tl-token')
    tokens.forEach((t, i) => {
      const el = t as HTMLElement
      const depth = el.classList.contains('live') ? 10 : 16 + (i % 3) * 5
      el.style.transform = `translate(${(dx * depth).toFixed(1)}px, ${(dy * depth).toFixed(1)}px)`
    })

    requestAnimationFrame(drawWires)
  }

  const handleCloudPointerLeave = () => {
    if (!cloudRef.current) return
    const tokens = cloudRef.current.querySelectorAll('.tl-token')
    tokens.forEach(t => {
      (t as HTMLElement).style.transform = ''
    })
    setTimeout(drawWires, 320)
  }

  // Segmented control click
  const handleSegClick = (e: React.MouseEvent) => {
    const b = (e.target as HTMLElement).closest('button[data-mode]') as HTMLButtonElement
    if (!b) return
    const mode = b.dataset.mode
    if (mode === currentMode) return
    userTouchedRef.current = true
    setMode(mode!, true)
  }

  // Keyboard navigation
  const handleSegKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const order = ['equal', 'custom', 'percentage', 'itemized']
    let i = order.indexOf(currentMode)
    i = e.key === 'ArrowRight' ? (i + 1) % 4 : (i + 3) % 4
    setMode(order[i], true)
    const btn = document.querySelector(`button[data-mode="${order[i]}"]`) as HTMLButtonElement
    if (btn) btn.focus()
    e.preventDefault()
  }

  // Show toast for coming soon items
  const showSoonToast = (name: string) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(`"${name}" is still on the workbench — soon.`)
    }
  }

  // Handle suggest form
  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = document.getElementById('suggestInput') as HTMLInputElement
    const v = input.value.trim()
    if (!v) {
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('Type an idea first — anything counts.')
      }
      input.focus()
      return
    }
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast('Noted — thank you for the nudge. ')
    }
    input.value = ''
    input.blur()
  }

  return (
    <main className="wrap">
      {/* Hero Section */}
      <header
        ref={heroRef}
        className={`tl-hero ${isLit ? 'lit' : ''}`}
        id="hero"
        data-screen-label="hero"
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={handleHeroPointerLeave}
      >
        <div className="tl-hero-copy">
          <div className="tl-eyebrow">
            <span className="dot"></span>
            <span className="eyebrow">The workshop</span>
          </div>
          <h1>Small tools,<br />quietly <em>useful</em>.</h1>
          <p className="lede">Little instruments I build for myself and leave out for you — no sign-ups, no tracking, nothing phoning home. They run entirely in your browser and remember their place on your device.</p>
          <div className="tl-hero-cta">
            <Link href="/split-bill" className="btn btn-primary" id="heroOpen">
              Open Split Bill
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </Link>
            <a href="#workshop" className="btn btn-ghost-bordered">See what&apos;s next</a>
          </div>
        </div>

        {/* Interactive token cloud */}
        <div className="tl-cloud" aria-hidden="true"
        >
          <div
            className="tl-cloud-inner"
            id="cloud"
            ref={cloudRef}
            onPointerMove={handleCloudPointerMove}
            onPointerLeave={handleCloudPointerLeave}
          >
            <svg className="tl-wires" id="wires" ref={wiresRef}></svg>

            <Link href="/split-bill" className="tl-token live" id="liveToken" style={{'--tok': 'var(--tl-itemized)'} as React.CSSProperties} aria-label="Open Split Bill">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M12 3v18"/>
                  <path d="M17 6H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6"/>
                </svg>
              </span>
              <span className="tk-name">Split Bill</span>
              <span className="tk-tag">Live now</span>
            </Link>

            <div className="tl-token ghost g1" onClick={() => showSoonToast('Reading Timer')} style={{'--tok': '160,122,181'} as React.CSSProperties}>
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <circle cx="12" cy="13" r="8"/>
                  <path d="M12 9v4l2.5 2.5M9 2h6"/>
                </svg>
              </span>
              <span className="tk-name">Reading Timer</span>
              <span className="tk-tag">Soon</span>
            </div>
            <div className="tl-token ghost g2" onClick={() => showSoonToast('Currency Notes')} style={{'--tok': '107,163,154'} as React.CSSProperties}>
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M4 7h13l-3-3M20 17H7l3 3"/>
                </svg>
              </span>
              <span className="tk-name">Currency Notes</span>
              <span className="tk-tag">Soon</span>
            </div>
            <div className="tl-token ghost g3" onClick={() => showSoonToast('Quiet Pomodoro')} style={{'--tok': '192,138,100'} as React.CSSProperties}>
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <circle cx="12" cy="13" r="8"/>
                  <path d="M12 13l3-2"/>
                  <path d="M10 2h4"/>
                </svg>
              </span>
              <span className="tk-name">Quiet Pomodoro</span>
              <span className="tk-tag">Soon</span>
            </div>
            <div className="tl-token ghost g4" onClick={() => showSoonToast('Color Memory')} style={{'--tok': '111,155,209'} as React.CSSProperties}>
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <circle cx="13.5" cy="6.5" r="2.5"/>
                  <circle cx="17.5" cy="13" r="2.5"/>
                  <circle cx="8.5" cy="7.5" r="2.5"/>
                  <path d="M3 12a9 9 0 1 0 9-9c-2 0-1 3-3 3"/>
                </svg>
              </span>
              <span className="tk-name">Color Memory</span>
              <span className="tk-tag">Soon</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Section */}
      <section className="tl-sec" data-screen-label="featured">
        <div className="tl-sec-head reveal">
          <span className="eyebrow">
            <span className="sig" style={{'--s1': '#f5b8c7', '--s2': '#d96b8a'} as React.CSSProperties}></span>
            Featured
          </span>
          <h2>The one that&apos;s ready.</h2>
          <p>Try it right here — switch how the bill is split and watch everyone&apos;s share settle.</p>
        </div>

        <div
          className="tl-feature glass reveal r-d1"
          id="feature"
          ref={featureRef}
          onPointerMove={handleFeaturePointerMove}
          style={{'--acc': current.acc} as React.CSSProperties}
        >
          <div className="tl-feat-info">
            <span className="tl-feat-eyebrow">
              <span className="live-dot"></span>
              Live now · free
            </span>
            <h3>Split Bill</h3>
            <p className="desc">Divide a shared bill fairly — equally, by custom amounts, by percentage, or item by item. The math settles instantly, and it handles the awkward parts: rounding, who paid upfront, someone sitting out.</p>
            <div className="tl-feat-list">
              <div className="row">
                <span className="tick">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </span>
                Four ways to split, one tap apart
              </div>
              <div className="row">
                <span className="tick">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </span>
                Honest rounding — no lost rupiah
              </div>
              <div className="row">
                <span className="tick">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </span>
                Works offline, saves on your device
              </div>
            </div>
            <div className="tl-feat-cta">
              <Link href="/split-bill" className="btn btn-primary">
                Open the tool
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </Link>
              <span className="tl-demo-hint" style={{fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-3)', letterSpacing: '0.04em'}}>
                a live preview, not a screenshot
              </span>
            </div>
          </div>

          {/* Live demo */}
          <div className="tl-feat-demo" id="demo">
            <div className="tl-demo-card">
              <div className="tl-demo-top">
                <span className="name">Dinner at Sushi House</span>
                <span className="total">Rp 500.000</span>
              </div>
              <div className="tl-demo-sub" id="demoSub">{current.sub}</div>

              <div
                className="tl-seg"
                id="demoSeg"
                role="tablist"
                aria-label="Split method preview"
                onClick={handleSegClick}
                onKeyDown={handleSegKeyDown}
              >
                <button data-mode="equal" className={currentMode === 'equal' ? 'active' : ''} role="tab" aria-selected={currentMode === 'equal'}>Equal</button>
                <button data-mode="custom" className={currentMode === 'custom' ? 'active' : ''} role="tab" aria-selected={currentMode === 'custom'}>Custom</button>
                <button data-mode="percentage" className={currentMode === 'percentage' ? 'active' : ''} role="tab" aria-selected={currentMode === 'percentage'}>%</button>
                <button data-mode="itemized" className={currentMode === 'itemized' ? 'active' : ''} role="tab" aria-selected={currentMode === 'itemized'}>Items</button>
              </div>

              <div className="tl-rows">
                <div className={`tl-person ${current.pct ? 'show-pct' : ''}`} data-p="0">
                  <span className="av" style={{'--a1': '#f5b8c7', '--a2': '#d96b8a'} as React.CSSProperties}>S</span>
                  <div className="body">
                    <div className="pn">
                      Sherly <span className="pct" data-pct>{current.pct ? current.pct[0] + '%' : ''}</span>
                    </div>
                    <div className="tl-bar">
                      <span data-bar style={{width: `${(current.shares[0] / TOTAL * 100)}%`}}></span>
                    </div>
                  </div>
                  <span className="amt" data-amt>{rp(current.shares[0])}</span>
                </div>
                <div className={`tl-person ${current.pct ? 'show-pct' : ''}`} data-p="1">
                  <span className="av" style={{'--a1': '#b3d0e8', '--a2': '#6f9bd1'} as React.CSSProperties}>K</span>
                  <div className="body">
                    <div className="pn">
                      Kris <span className="pct" data-pct>{current.pct ? current.pct[1] + '%' : ''}</span>
                    </div>
                    <div className="tl-bar">
                      <span data-bar style={{width: `${(current.shares[1] / TOTAL * 100)}%`}}></span>
                    </div>
                  </div>
                  <span className="amt" data-amt>{rp(current.shares[1])}</span>
                </div>
              </div>

              <div className="tl-demo-foot">
                <span className="st">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <span id="demoStatus">{current.status}</span>
                </span>
                <span className="spacer"></span>
                <span className="hint">tap a mode</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Section */}
      <section className="tl-sec" id="workshop" data-screen-label="workshop">
        <div className="tl-sec-head reveal">
          <span className="eyebrow">
            <span className="sig" style={{'--s1': '#c6b5e0', '--s2': '#6f9bd1'} as React.CSSProperties}></span>
            In the workshop
          </span>
          <h2>What I&apos;m tinkering with.</h2>
          <p>Sketches on the bench — half-built, no promises on timing. They&apos;ll appear here when they&apos;re honestly ready.</p>
        </div>

        <div className="tl-workshop-grid">
          <div className="tl-soon reveal r-d1" onClick={() => showSoonToast('Reading Timer')} style={{'--sc': '160,122,181'} as React.CSSProperties}>
            <span className="s-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                <circle cx="12" cy="13" r="8"/>
                <path d="M12 9v4l2.5 2.5M9 2h6"/>
              </svg>
            </span>
            <h4>Reading Timer</h4>
            <p>Paste any text and get an honest minutes-to-read — tuned to a calm pace, not a speed-reading boast.</p>
            <span className="s-tag"><span className="d"></span>Sketching</span>
          </div>
          <div className="tl-soon reveal r-d2" onClick={() => showSoonToast('Currency Notes')} style={{'--sc': '107,163,154'} as React.CSSProperties}>
            <span className="s-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                <path d="M4 7h13l-3-3M20 17H7l3 3"/>
              </svg>
            </span>
            <h4>Currency Notes</h4>
            <p>A tiny converter that remembers the handful of rates you actually use, so you&apos;re not re-typing them every trip.</p>
            <span className="s-tag"><span className="d"></span>Sketching</span>
          </div>
          <div className="tl-soon reveal r-d3" onClick={() => showSoonToast('Quiet Pomodoro')} style={{'--sc': '192,138,100'} as React.CSSProperties}>
            <span className="s-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                <circle cx="12" cy="13" r="8"/>
                <path d="M12 13l3-2"/>
                <path d="M10 2h4"/>
              </svg>
            </span>
            <h4>Quiet Pomodoro</h4>
            <p>A focus timer with no streaks, no badges, no guilt — just a soft chime and a clean count of the work you did.</p>
            <span className="s-tag"><span className="d"></span>Sketching</span>
          </div>
        </div>

        <div className="tl-suggest glass reveal">
          <div className="copy">
            <h4>Something you wish existed?</h4>
            <p>Tell me the small, annoying task you&apos;d love a calm little tool for.</p>
          </div>
          <form id="suggestForm" onSubmit={handleSuggestSubmit}>
            <input type="text" id="suggestInput" placeholder="e.g. a splitwise for recurring rent…" aria-label="Suggest a tool" autoComplete="off" />
            <button type="submit" className="btn btn-primary">
              Send
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      </section>

      <Footer sourcePage="tools" />
    </main>
  )
}
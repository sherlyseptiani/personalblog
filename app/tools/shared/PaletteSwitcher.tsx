'use client'

import { useState, useEffect } from 'react'
import { usePalette, PALETTES } from './PaletteContext'

export default function PaletteSwitcher() {
  const { activePalette, setPalette } = usePalette()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  const active = PALETTES.find(p => p.id === activePalette) || PALETTES[0]

  useEffect(() => {
    setMounted(true)
    const sync = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const handleToggleTheme = () => {
    if (typeof window !== 'undefined' && (window as any).toggleTheme) {
      (window as any).toggleTheme()
    }
  }

  return (
    <div className="tools-palette-switcher">
      {open && (
        <div className="tools-palette-panel">
          {PALETTES.map(p => (
            <button
              key={p.id}
              className={`tools-swatch${activePalette === p.id ? ' active' : ''}`}
              style={{ background: `linear-gradient(135deg, ${p.p1}, ${p.p2})` }}
              title={p.label}
              onClick={() => { setPalette(p.id); setOpen(false) }}
              type="button"
              aria-label={`${p.label} palette`}
            />
          ))}
          {/* Theme toggle */}
          <div className="tools-theme-toggle-wrapper">
            <button
              className="tools-theme-toggle"
              onClick={handleToggleTheme}
              type="button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              data-is-dark={mounted ? (isDark ? 'true' : 'false') : 'false'}
              suppressHydrationWarning
            >
              <span className="tools-theme-toggle-track">
                <span className="tools-theme-toggle-thumb">
                  <svg className="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  </svg>
                  <svg className="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </span>
              </span>
              <span className="tools-theme-toggle-label">
                {isDark ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>
        </div>
      )}
      <button
        className="tools-palette-btn"
        onClick={() => setOpen(o => !o)}
        type="button"
        aria-label="Change colour palette"
        title="Change colour palette"
        style={{ '--active-gradient': `linear-gradient(135deg, ${active.p1}, ${active.p2})` } as React.CSSProperties}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
          <path d="M12 2v8" />
          <rect x="8" y="10" width="8" height="2.5" rx="1" />
          <rect x="3.5" y="12.5" width="17" height="7" rx="2" />
        </svg>
      </button>
    </div>
  )
}

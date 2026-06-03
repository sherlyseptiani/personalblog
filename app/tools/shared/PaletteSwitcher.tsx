'use client'

import { useState } from 'react'
import { usePalette, PALETTES } from './PaletteContext'

export default function PaletteSwitcher() {
  const { activePalette, setPalette } = usePalette()
  const [open, setOpen] = useState(false)

  const active = PALETTES.find(p => p.id === activePalette) || PALETTES[0]

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
          <path d="M12 2v8"/>
          <rect x="8" y="10" width="8" height="2.5" rx="1"/>
          <rect x="3.5" y="12.5" width="17" height="7" rx="2"/>
        </svg>
      </button>
    </div>
  )
}

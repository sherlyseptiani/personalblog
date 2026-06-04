'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type PaletteId = 'rose' | 'ocean' | 'amber' | 'violet' | 'teal' | 'coral'

export interface Palette {
  id: PaletteId
  label: string
  p1: string
  p2: string
  r: number
  g: number
  b: number
}

export const PALETTES: Palette[] = [
  { id: 'rose',   label: 'Rose',   p1: '#d96b8a', p2: '#a07ab5', r: 217, g: 107, b: 138 },
  { id: 'ocean',  label: 'Ocean',  p1: '#6f9bd1', p2: '#6ba39a', r: 111, g: 155, b: 209 },
  { id: 'amber',  label: 'Amber',  p1: '#c08a64', p2: '#d96b8a', r: 192, g: 138, b: 100 },
  { id: 'violet', label: 'Violet', p1: '#a07ab5', p2: '#6f9bd1', r: 160, g: 122, b: 181 },
  { id: 'teal',   label: 'Teal',   p1: '#6ba39a', p2: '#4a8f9a', r: 107, g: 163, b: 154 },
  { id: 'coral',  label: 'Coral',  p1: '#e07878', p2: '#c08a64', r: 224, g: 120, b: 120 },
]

const STORAGE_KEY = 'tools-palette'
const DEFAULT_PALETTE: PaletteId = 'rose'

interface PaletteContextType {
  activePalette: PaletteId
  palette: Palette
  setPalette: (id: PaletteId) => void
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined)

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [activePalette, setActivePalette] = useState<PaletteId>(DEFAULT_PALETTE)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as PaletteId | null
    if (saved && PALETTES.find(p => p.id === saved)) {
      setActivePalette(saved)
      applyPalette(saved)
    }
    // Reset palette on unmount (when leaving tools pages)
    return () => {
      resetPalette()
    }
  }, [])

  const applyPalette = useCallback((id: PaletteId) => {
    const p = PALETTES.find(x => x.id === id) || PALETTES[0]
    const r = document.documentElement
    r.style.setProperty('--video-r', String(p.r))
    r.style.setProperty('--video-g', String(p.g))
    r.style.setProperty('--video-b', String(p.b))
    r.style.setProperty('--video-tint', `rgb(${p.r}, ${p.g}, ${p.b})`)
    // For split-bill specific variables
    r.style.setProperty('--sb2-pal-1', p.p1)
    r.style.setProperty('--sb2-pal-2', p.p2)
  }, [])

  const resetPalette = useCallback(() => {
    const r = document.documentElement
    // Remove the inline styles to let the homepage video adaptive color take over
    r.style.removeProperty('--video-r')
    r.style.removeProperty('--video-g')
    r.style.removeProperty('--video-b')
    r.style.removeProperty('--video-tint')
    r.style.removeProperty('--sb2-pal-1')
    r.style.removeProperty('--sb2-pal-2')
  }, [])

  const setPalette = useCallback((id: PaletteId) => {
    setActivePalette(id)
    applyPalette(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [applyPalette])

  const palette = PALETTES.find(p => p.id === activePalette) || PALETTES[0]

  return (
    <PaletteContext.Provider value={{ activePalette, palette, setPalette }}>
      {children}
    </PaletteContext.Provider>
  )
}

export function usePalette() {
  const context = useContext(PaletteContext)
  if (!context) {
    // Return default values when not in provider (during SSR or before hydration)
    return {
      activePalette: DEFAULT_PALETTE,
      palette: PALETTES[0],
      setPalette: () => {},
    }
  }
  return context
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { spawnGlitter } from '@/lib/glitter'
import Search from './Search'

type ActivePage = 'writing' | 'about' | undefined

export default function Nav({ activePage }: { activePage?: ActivePage }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isHomePage = pathname === '/'
  const isPostPage = pathname?.startsWith('/posts/')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const brandTapCount = useRef(0)
  const brandTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Handle / key to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen])

  const handleGlitter = useCallback((e: React.MouseEvent) => {
    spawnGlitter(e.clientX, e.clientY)
    brandTapCount.current += 1
    if (brandTapTimer.current) clearTimeout(brandTapTimer.current)
    if (brandTapCount.current >= 5) {
      brandTapCount.current = 0
      window.dispatchEvent(new Event('corgi-trigger'))
    } else {
      brandTapTimer.current = setTimeout(() => { brandTapCount.current = 0 }, 800)
    }
  }, [])

  const handleBrandClick = useCallback((e: React.MouseEvent) => {
    handleGlitter(e)
    // Always scroll to top when clicking brand, even on homepage
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [handleGlitter])

  const handleOpenSearch = (e: React.MouseEvent) => {
    spawnGlitter(e.clientX, e.clientY)
    setIsSearchOpen(true)
  }

  return (
    <>
      <nav className="nav glass" aria-label="Primary">
        <Link href="/" className="brand" onClick={handleBrandClick}>
          <span className="mark"></span>
          <span className="brand-text">A Curious Note</span>
        </Link>
        <div className="nav-actions">
          {!isPostPage && (
            <button
              type="button"
              className="icon-btn"
              aria-label="Search"
              onClick={handleOpenSearch}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}

          <button
            className="icon-btn"
            aria-label="Toggle theme"
            data-theme-toggle=""
            onClick={(e) => { handleGlitter(e); (window as any).toggleTheme?.() }}
          ></button>

          <Link href="/about" className="icon-btn" aria-label="About" onClick={handleGlitter}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </nav>

      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

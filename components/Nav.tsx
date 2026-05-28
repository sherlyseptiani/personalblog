'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { spawnGlitter } from '@/lib/glitter'

type ActivePage = 'writing' | 'about' | undefined

export default function Nav({ activePage }: { activePage?: ActivePage }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isHomePage = pathname === '/'
  const isPostPage = pathname?.startsWith('/posts/')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const brandTapCount = useRef(0)
  const brandTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sync search input with URL query
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
      setIsSearchOpen(true)
    } else {
      setSearchQuery('')
    }
  }, [searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const trimmedQuery = searchQuery.trim()

    if (isHomePage) {
      // On homepage: update URL with shallow routing (no page reload)
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('search', trimmedQuery)
      router.push(`/?${newParams.toString()}#latest`, { scroll: false })
    } else {
      // On other pages: navigate to homepage with search
      router.push(`/?search=${encodeURIComponent(trimmedQuery)}#latest`)
    }
    setIsSearchOpen(false)
  }

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

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      // Closing search - if there was a search query, clear it and return home
      if (searchQuery.trim()) {
        setSearchQuery('')
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('search')
        const newQuery = newParams.toString()
        router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false })
      } else {
        setIsSearchOpen(false)
      }
    } else {
      // Opening search
      setIsSearchOpen(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    // If user clears the input completely and there was a search, clear it
    if (!value.trim() && searchParams.get('search')) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('search')
      const newQuery = newParams.toString()
      router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false })
    }
  }

  const handleBrandClick = useCallback((e: React.MouseEvent) => {
    handleGlitter(e)
    // Always scroll to top when clicking brand, even on homepage
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [handleGlitter])

  return (
    <nav className="nav glass" aria-label="Primary">
      <Link href="/" className="brand" onClick={handleBrandClick}>
        <span className="mark"></span>
        <span className="brand-text">A Curious Note</span>
      </Link>
      <div className="nav-actions">
        {!isPostPage && (
        <div className={`search-expand ${isSearchOpen ? 'open' : ''}`}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search posts…"
              aria-label="Search posts"
            />
          </form>
          <button
            type="button"
            className="icon-btn search-toggle"
            aria-label={isSearchOpen ? 'Close search' : 'Search'}
            onClick={(e) => { handleGlitter(e); handleToggleSearch() }}
          >
            {isSearchOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </button>
        </div>
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
  )
}

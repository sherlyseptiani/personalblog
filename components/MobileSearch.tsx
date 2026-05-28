'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { spawnGlitter } from '@/lib/glitter'

export default function MobileSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleOpen = (e: React.MouseEvent) => {
    spawnGlitter(e.clientX, e.clientY)
    setIsOpen(true)
  }

  const handleClose = (e?: React.MouseEvent) => {
    if (e) spawnGlitter(e.clientX, e.clientY)
    // Reset search and show all posts if there's an active search
    if (searchParams.get('search')) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('search')
      const newQuery = newParams.toString()
      router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false })
    }
    setIsOpen(false)
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const trimmedQuery = query.trim()
    router.push(`/?search=${encodeURIComponent(trimmedQuery)}#latest`)
    setIsOpen(false)
    setQuery('')
  }

  // Only show on homepage
  if (!pathname?.match(/^\/($|\?)/)) {
    return null
  }

  return (
    <>
      {/* Floating search button */}
      <button
        className="mobile-search-fab"
        onClick={handleOpen}
        aria-label="Search posts"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {/* Search overlay */}
      {isOpen && (
        <div className="mobile-search-overlay open" onClick={() => handleClose()}>
          <div className="mobile-search-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-search-header">
              <h3>Search</h3>
              <button className="mobile-search-close" onClick={handleClose} aria-label="Close search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mobile-search-form">
              <div className="mobile-search-input-wrap">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts..."
                  aria-label="Search posts"
                />
              </div>
              <button type="submit" className="mobile-search-submit" disabled={!query.trim()}>
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

type ActivePage = 'writing' | 'about' | undefined

export default function Nav({ activePage }: { activePage?: ActivePage }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Close search on escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`
    }
    setIsSearchOpen(false)
  }

  return (
    <nav className="nav glass" aria-label="Primary">
      <Link href="/" className="brand">
        <span className="mark"></span>
        <span className="brand-text">A Curious Note</span>
      </Link>

      {isSearchOpen ? (
        <form onSubmit={handleSearchSubmit} className="nav-search-form" style={{ flex: 1, display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts…"
            autoFocus
            style={{
              flex: 1,
              padding: '8px 14px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
          />
          <button type="submit" className="btn btn-ghost-bordered" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Search
          </button>
          <button type="button" className="icon-btn" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </form>
      ) : (
        <div className="nav-links" role="navigation">
          <Link href="/#latest" className={activePage === 'writing' ? 'active' : ''}>Writing</Link>
          <a href="#">Notes</a>
          <a href="#">Reading</a>
          <Link href="/about" className={activePage === 'about' ? 'active' : ''}>About</Link>
          <a href="#">Subscribe</a>
        </div>
      )}

      <div className="nav-actions">
        <button className="icon-btn" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
        <button
          className="icon-btn"
          aria-label="Toggle theme"
          data-theme-toggle=""
          onClick={() => (window as any).toggleTheme?.()}
        ></button>
        <Link href="/about" className="icon-btn" aria-label="About">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>
      </div>
    </nav>
  )
}

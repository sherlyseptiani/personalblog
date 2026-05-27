'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

type ActivePage = 'writing' | 'about' | undefined

export default function Nav({ activePage }: { activePage?: ActivePage }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}#latest`
    }
    setIsSearchOpen(false)
  }

  return (
    <nav className="nav glass" aria-label="Primary">
      <Link href="/" className="brand">
        <span className="mark"></span>
        <span className="brand-text">A Curious Note</span>
      </Link>

      <div className="nav-links" role="navigation">
        <Link href="/#latest" className={activePage === 'writing' ? 'active' : ''}>Writing</Link>
        <a href="#">Notes</a>
        <a href="#">Reading</a>
        <Link href="/about" className={activePage === 'about' ? 'active' : ''}>About</Link>
        <a href="#">Subscribe</a>
      </div>

      <div className="nav-actions">
        <div className={`search-expand ${isSearchOpen ? 'open' : ''}`}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts…"
              aria-label="Search posts"
            />
          </form>
          <button
            type="button"
            className="icon-btn search-toggle"
            aria-label={isSearchOpen ? 'Close search' : 'Search'}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            )}
          </button>
        </div>

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

      <style jsx>{`
        .search-expand {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-form {
          position: absolute;
          right: 44px;
          width: 0;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateX(20px);
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.25s ease,
                      visibility 0.25s ease,
                      transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-expand.open .search-form {
          width: 240px;
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }

        .search-form input {
          width: 100%;
          padding: 10px 18px;
          background: var(--glass-bg-strong);
          border: 1.5px solid var(--glass-border);
          border-radius: 999px;
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-form input:hover {
          border-color: rgba(var(--video-r), var(--video-g), var(--video-b), 0.5);
        }

        .search-form input:focus {
          border-color: var(--video-tint);
          box-shadow: 0 0 0 3px rgba(var(--video-r), var(--video-g), var(--video-b), 0.2);
        }

        .search-form input::placeholder {
          color: var(--ink-3);
        }

        .search-toggle {
          z-index: 2;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .search-toggle:hover {
          transform: scale(1.05);
        }

        .search-toggle:active {
          transform: scale(0.95);
        }

        @media (max-width: 680px) {
          .search-expand.open .search-form {
            width: 180px;
          }

          .search-form input {
            font-size: 16px;
            padding: 10px 14px;
          }
        }

        @media (max-width: 520px) {
          .search-expand.open .search-form {
            width: 160px;
          }
        }
      `}</style>
    </nav>
  )
}

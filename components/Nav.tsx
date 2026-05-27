'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { spawnGlitter } from '@/lib/glitter'

type ActivePage = 'writing' | 'about' | undefined

export default function Nav({ activePage }: { activePage?: ActivePage }) {
  const pathname = usePathname()
  const isPostPage = pathname?.startsWith('/posts/')
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

  // Sync search input with URL query on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const searchParam = urlParams.get('search')
      if (searchParam) {
        setSearchQuery(searchParam)
        setIsSearchOpen(true)
      }
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}#latest`
    }
    setIsSearchOpen(false)
  }

  const handleGlitter = useCallback((e: React.MouseEvent) => {
    spawnGlitter(e.clientX, e.clientY)
  }, [])

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      // Closing search - if there was a search query, clear it and return home
      if (searchQuery.trim()) {
        setSearchQuery('')
        window.location.href = '/'
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
    // If user clears the input completely and there was a search, return to normal
    if (!value.trim() && window.location.search.includes('search=')) {
      window.location.href = '/'
    }
  }

  return (
    <nav className="nav glass" aria-label="Primary">
      <Link href="/" className="brand" onClick={handleGlitter}>
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

      <style jsx>{`
        .search-expand {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-form {
          position: absolute;
          right: 40px;
          width: 0;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateX(8px);
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.2s ease,
                      visibility 0.2s ease,
                      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-expand.open .search-form {
          width: 220px;
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }

        .search-form input {
          width: 100%;
          height: 36px;
          padding: 0 16px;
          background: var(--glass-bg-strong);
          border: 1px solid var(--line);
          border-radius: 999px;
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .search-form input:hover {
          border-color: rgba(var(--video-r), var(--video-g), var(--video-b), 0.5);
        }

        .search-form input:focus {
          border-color: var(--video-tint);
          box-shadow: 0 0 0 2px rgba(var(--video-r), var(--video-g), var(--video-b), 0.15);
        }

        .search-form input::placeholder {
          color: var(--ink-3);
        }

        .search-toggle {
          z-index: 2;
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--glass-inner-light);
          color: var(--ink-2);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-toggle:hover {
          background: var(--bg-elev);
          color: var(--ink);
          transform: translateY(-1px);
        }

        .search-toggle:active {
          transform: scale(0.95);
        }

        .search-toggle svg {
          flex-shrink: 0;
        }

        @media (max-width: 680px) {
          .search-expand.open .search-form {
            width: 160px;
          }
        }

        @media (max-width: 520px) {
          .search-expand.open .search-form {
            width: 140px;
          }
        }
      `}</style>
    </nav>
  )
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { spawnGlitter } from '@/lib/glitter'

interface Post {
  id: string
  title: string
  slug: string
  category: string
  excerpt?: string
  read_time?: number
}

interface SearchProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_COLORS: Record<string, [string, string]> = {
  essay: ['#f5b8c7', '#d96b8a'],
  craft: ['#c6b5e0', '#a07ab5'],
  field: ['#a7d8c5', '#6ba39a'],
  reading: ['#b3d0e8', '#6f9bd1'],
  systems: ['#f6c7a3', '#c08a64'],
  science: ['#6f9bd1', '#3f5e8c'],
  language: ['#d96b8a', '#a07ab5'],
  perspective: ['#c08a64', '#d96b8a'],
  book: ['#6ba39a', '#3f5547'],
  personal: ['#a07ab5', '#6f9bd1'],
  environment: ['#3f5547', '#6ba39a'],
  animal: ['#f5b8c7', '#f6c7a3'],
  others: ['#b3d0e8', '#c6b5e0'],
  uncategorized: ['#9ca3af', '#6b7280'],
}

export default function Search({ isOpen, onClose }: SearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [results, setResults] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Load categories and recent searches on mount
  useEffect(() => {
    // Fetch categories from API
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories)
        }
      })
      .catch(() => {
        // Fallback categories
        setCategories(['essay', 'craft', 'field', 'reading', 'systems', 'science', 'language', 'personal'])
      })

    // Load recent searches from localStorage
    const saved = localStorage.getItem('acn-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {}
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          // This would need to be handled by parent - we just handle close here
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Search posts when query or category changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('search', query)
        params.set('limit', '5')
        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory)
        }
        const res = await fetch(`/api/posts?${params.toString()}`)
        const data = await res.json()
        setResults(data.posts || [])
      } catch {
        setResults([])
      }
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timeout)
  }, [query, selectedCategory])

  const saveRecentSearch = useCallback((term: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== term.toLowerCase())
      const updated = [term, ...filtered].slice(0, 5)
      localStorage.setItem('acn-recent-searches', JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem('acn-recent-searches')
  }, [])

  const removeRecentSearch = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term)
      localStorage.setItem('acn-recent-searches', JSON.stringify(updated))
      return updated
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    saveRecentSearch(query.trim())
    setIsLoading(true)

    // Navigate to homepage with search
    const params = new URLSearchParams()
    params.set('search', query.trim())
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory)
    }

    onClose()

    if (pathname === '/') {
      router.push(`/?${params.toString()}#latest`, { scroll: false })
    } else {
      router.push(`/?${params.toString()}#latest`)
    }

    // Scroll to posts grid after a short delay to ensure content loads
    setTimeout(() => {
      const postsSection = document.getElementById('latest')
      if (postsSection) {
        postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setIsLoading(false)
    }, 300)
  }

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat === selectedCategory ? 'all' : cat)
    spawnGlitter(window.innerWidth / 2, window.innerHeight / 3)
  }

  const handleRecentClick = async (term: string) => {
    setQuery(term)
    saveRecentSearch(term)
    setIsLoading(true)

    const params = new URLSearchParams()
    params.set('search', term)
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory)
    }

    onClose()

    if (pathname === '/') {
      router.push(`/?${params.toString()}#latest`, { scroll: false })
    } else {
      router.push(`/?${params.toString()}#latest`)
    }

    // Scroll to posts grid after a short delay
    setTimeout(() => {
      const postsSection = document.getElementById('latest')
      if (postsSection) {
        postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setIsLoading(false)
    }, 300)
  }

  const handleResultClick = (post: Post) => {
    saveRecentSearch(query || post.title)
    onClose()
    router.push(`/posts/${post.slug}`)
  }

  const getCategoryColors = (cat: string): [string, string] => {
    return CATEGORY_COLORS[cat] || CATEGORY_COLORS.uncategorized
  }

  if (!isOpen) return null

  return (
    <div className="acn-search-root open" onClick={onClose}>
      <div className="acn-search-scrim" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="acn-search-dialog"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Search posts"
      >
        {/* Search input */}
        <form onSubmit={handleSubmit} className={`acn-search-field ${query ? 'has-text' : ''}`}>
          <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search posts…"
            aria-label="Search posts"
          />
          <span className="acn-search-kbd">
            <kbd>ESC</kbd> to close
          </span>
          <button
            type="button"
            className="acn-search-clear"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </form>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="acn-search-chips">
            <button
              className={`acn-chip ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`acn-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Search body */}
        <div className="acn-search-body">
          {/* Search results */}
          {query.trim() && (
            <>
              <div className="acn-search-secthead">
                <span>Results</span>
                {results.length > 0 && <span>{results.length} found</span>}
              </div>
              {isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  Searching…
                </div>
              ) : results.length > 0 ? (
                results.map(post => {
                  const [c1, c2] = getCategoryColors(post.category)
                  return (
                    <div
                      key={post.id}
                      className="acn-result"
                      onClick={() => handleResultClick(post)}
                    >
                      <span
                        className="r-dot"
                        style={{ '--rc1': c1, '--rc2': c2 } as React.CSSProperties}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </span>
                      <span className="r-main">
                        <span className="r-title">{post.title}</span>
                        <span className="r-sub">
                          {post.category}
                          <span className="sep" />
                          {post.read_time ? `${post.read_time} min read` : 'Essay'}
                        </span>
                      </span>
                      <svg className="r-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </div>
                  )
                })
              ) : (
                <div className="acn-search-empty">
                  <div className="ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <h4>No results</h4>
                  <p>Try a different search term or category</p>
                </div>
              )}
            </>
          )}

          {/* Recent searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <>
              <div className="acn-search-secthead">
                <span>Recent</span>
                <button onClick={clearRecentSearches}>Clear</button>
              </div>
              {recentSearches.map(term => (
                <div
                  key={term}
                  className="acn-recent"
                  onClick={() => handleRecentClick(term)}
                >
                  <svg className="rc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="rc-text">{term}</span>
                  <button
                    className="rc-del"
                    onClick={e => removeRecentSearch(term, e)}
                    aria-label={`Remove ${term}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Empty state when no recent searches */}
          {!query.trim() && recentSearches.length === 0 && (
            <div className="acn-search-empty">
              <div className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h4>Search posts</h4>
              <p>Type to search through all essays and notes</p>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="acn-search-foot">
          <span className="hint">
            <kbd>↑</kbd><kbd>↓</kbd> to navigate
          </span>
          <span className="hint">
            <kbd>↵</kbd> to select
          </span>
          <span className="spacer" />
          <span className="hint">
            Press <kbd>/</kbd> to search from anywhere
          </span>
        </div>
      </div>
    </div>
  )
}

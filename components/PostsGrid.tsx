'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PostCard from './PostCard'
import type { Post } from '@/lib/types'
import { CATEGORIES } from '@/lib/categories'
import { spawnGlitter } from '@/lib/glitter'

type Props = {
  initialPosts: Post[]
  initialTotal: number
  initialCategories: string[]
}

const LIMIT = 8

export default function PostsGrid({ initialPosts, initialTotal, initialCategories }: Props) {
  const searchParams = useSearchParams()

  // All initial state matches server-rendered output (no browser APIs).
  // Browser state (sessionStorage, window.innerWidth) is restored in useEffect
  // after hydration to avoid server/client HTML mismatch.
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [total, setTotal] = useState<number>(initialTotal)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [newPostSlugs, setNewPostSlugs] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [colCount, setColCount] = useState(1)
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set())
  const postsGridRef = useRef<HTMLDivElement>(null)

  // After hydration: restore scroll position, grid state, and column count from browser APIs
  useEffect(() => {
    // Scroll restoration
    try {
      const saved = sessionStorage.getItem('acn-scroll-y')
      if (saved) {
        sessionStorage.removeItem('acn-scroll-y')
        const y = parseInt(saved, 10)
        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' })
        }))
      }
    } catch {}

    // Grid state restoration (load-more pages)
    try {
      const saved = sessionStorage.getItem('acn-posts-state')
      if (saved) {
        const { posts: p, total: t, page: pg } = JSON.parse(saved)
        if (Array.isArray(p) && p.length > initialPosts.length) {
          setPosts(p)
          setTotal(t ?? initialTotal)
          setPage(pg ?? 1)
        }
      }
    } catch {}

    // Column count from actual viewport width
    const w = window.innerWidth
    setColCount(w < 520 ? 1 : w < 780 ? 2 : w < 1100 ? 3 : 4)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist grid state on every change so back-navigation restores it.
  // Only save unfiltered/unsearched state — filtered results aren't worth restoring.
  useEffect(() => {
    if (activeFilter !== 'all' || search) {
      try { sessionStorage.removeItem('acn-posts-state') } catch {}
      return
    }
    try {
      sessionStorage.setItem('acn-posts-state', JSON.stringify({ posts, total, page }))
    } catch {}
  }, [posts, total, page, activeFilter, search])

  // Load read slugs from localStorage and keep in sync across tabs
  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('acn-read')
        setReadSlugs(new Set(stored ? JSON.parse(stored) : []))
      } catch {}
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  // Background refresh — only needed if SSR categories were unavailable
  useEffect(() => {
    if (initialCategories.length > 0) return
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => { if (data.categories) setCategories(data.categories) })
      .catch(console.error)
  }, [initialCategories.length])

  // Track container width to match CSS breakpoints for column distribution
  useEffect(() => {
    const el = postsGridRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setColCount(w < 520 ? 1 : w < 780 ? 2 : w < 1100 ? 3 : 4)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const fetchPosts = useCallback(
    async (filter: string, q: string, pg: number, append: boolean) => {
      setLoading(true)
      const params = new URLSearchParams({ page: String(pg), limit: String(LIMIT) })
      if (filter && filter !== 'all') params.set('category', filter)
      if (q.trim()) params.set('search', q.trim())

      const res = await fetch(`/api/posts?${params}`)
      const json = await res.json()

      if (append) {
        const existingSlugs = new Set(posts.map(p => p.slug))
        const newPosts = json.posts.filter((p: Post) => !existingSlugs.has(p.slug))
        if (newPosts.length > 0) {
          setNewPostSlugs(new Set(newPosts.map((p: Post) => p.slug)))
          setPosts(prev => [...prev, ...newPosts])
          // Clear animation after it completes
          setTimeout(() => setNewPostSlugs(new Set()), 600)
        }
      } else {
        setPosts(json.posts)
        setNewPostSlugs(new Set())
      }
      setTotal(json.total)
      setLoading(false)
    },
    [posts]
  )

  // Watch for URL search param changes and fetch results
  useEffect(() => {
    // Skip if we just restored from sessionStorage (posts would be longer than initial)
    if (posts.length > initialPosts.length) return

    const q = searchParams.get('search')
    if (q) {
      setSearch(q)
      setActiveFilter('all')
      setPage(1)
      fetchPosts('all', q, 1, false)
      document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (search) {
      setSearch('')
      setActiveFilter('all')
      setPage(1)
      fetchPosts('all', '', 1, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleFilter = (key: string, e: React.MouseEvent) => {
    setActiveFilter(key)
    setPage(1)
    fetchPosts(key, search, 1, false)
    spawnGlitter(e.clientX, e.clientY)
  }

  const handleClearSearch = (e: React.MouseEvent) => {
    setSearch('')
    setActiveFilter('all')
    setPage(1)
    fetchPosts('all', '', 1, false)
    spawnGlitter(e.clientX, e.clientY)
    // Clear URL search param
    const url = new URL(window.location.href)
    url.searchParams.delete('search')
    window.history.pushState({}, '', url.toString())
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(activeFilter, search, next, true)
  }

  const showing = posts.length

  // Get category label from CATEGORIES lookup
  const getCategoryLabel = (key: string) => {
    return CATEGORIES[key as keyof typeof CATEGORIES]?.label || key
  }

  return (
    <>
      <header className="section-head" style={{ position: 'relative', zIndex: 1 }}>
        <div className="titles">
          <span className="eyebrow">{search ? `Search: "${search}"` : 'The archive'}</span>
          <h2>{search ? `Found ${total} post${total !== 1 ? 's' : ''}` : 'Recent writing.'}</h2>
          {search ? (
            <button
              className="clear-search-btn"
              onClick={handleClearSearch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                border: '1px solid var(--line)',
                background: 'var(--glass-bg)',
                color: 'var(--ink-2)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--video-tint)'
                e.currentTarget.style.color = 'var(--video-tint)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.color = 'var(--ink-2)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Clear search
            </button>
          ) : (
            <p>
              New entries will arrive most Sundays - quiet weeks are part of the practice. I will write more often!
            </p>
          )}
        </div>
        <div className="filters glass" id="filters" style={{ '--glass-bg': 'var(--glass-bg-strong)' } as React.CSSProperties}>
          <button
            key="all"
            data-filter="all"
            className={activeFilter === 'all' ? 'active' : ''}
            onClick={(e) => handleFilter('all', e)}
          >
            All
          </button>
          {categories.length === 0 ? (
            // Loading skeleton for filters
            <>
              <span className="filter-skeleton" style={{ width: '70px' }} />
              <span className="filter-skeleton" style={{ width: '80px' }} />
              <span className="filter-skeleton" style={{ width: '60px' }} />
              <span className="filter-skeleton" style={{ width: '75px' }} />
            </>
          ) : (
            categories.map(cat => (
              <button
                key={cat}
                data-filter={cat}
                className={activeFilter === cat ? 'active' : ''}
                onClick={(e) => handleFilter(cat, e)}
              >
                {getCategoryLabel(cat)}
              </button>
            ))
          )}
        </div>
      </header>

      <div className="posts" id="postsGrid" ref={postsGridRef}
        style={{ position: 'relative', zIndex: 1, display: 'flex', gap: colCount === 1 ? '10px' : '24px', alignItems: 'flex-start' }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a[href^="/posts/"]')) {
            try { sessionStorage.setItem('acn-scroll-y', String(window.scrollY)) } catch {}
          }
        }}
      >
        {loading && posts.length === 0 ? (
          <div className="posts-loader" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', minHeight: '300px' }}>
            <div className="loader-shimmer" style={{ width: '100%', maxWidth: '600px', height: '200px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 50%, var(--surface-1) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            <div className="loader-shimmer" style={{ width: '100%', maxWidth: '600px', height: '200px', borderRadius: '16px', background: 'linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 50%, var(--surface-1) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', animationDelay: '0.2s' }} />
          </div>
        ) : posts.length === 0 ? (
          <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-serif)', padding: '40px 0' }}>
            No posts found.
          </p>
        ) : (
          Array.from({ length: colCount }, (_, col) => (
            <div key={col} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: colCount === 1 ? '10px' : '24px' }}>
              {posts
                .filter((_, i) => i % colCount === col)
                .map(post => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    isRead={readSlugs.has(post.slug)}
                    className={newPostSlugs.has(post.slug) ? 'post-anim-new' : undefined}
                  />
                ))}
            </div>
          ))
        )}
      </div>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .post-anim-new {
          animation: fadeInUp 0.45s ease-out forwards;
          opacity: 0;
        }
        .search-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          background: transparent;
          border: none;
          color: var(--ink-2);
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .search-toggle:hover {
          color: var(--video-tint);
        }
        .search-toggle.active {
          color: var(--video-tint);
          background: var(--glass-inner-light);
          border-radius: 6px;
        }
        .search-toggle svg {
          width: 16px;
          height: 16px;
        }
      `}</style>

      <div className="load-more-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="count" id="postCount">
          {loading ? (
            <span className="juggle-dots" aria-label="Loading">
              <span className="juggle-dot" style={{ '--d': '0ms', '--c': '#c6b5e0' } as React.CSSProperties} />
              <span className="juggle-dot" style={{ '--d': '150ms', '--c': '#a7d8c5' } as React.CSSProperties} />
              <span className="juggle-dot" style={{ '--d': '300ms', '--c': '#f5b8c7' } as React.CSSProperties} />
              <span className="juggle-dot" style={{ '--d': '450ms', '--c': '#f6c7a3' } as React.CSSProperties} />
            </span>
          ) : `Showing ${showing} of ${total}`}
        </div>
        {showing < total && !loading && (
          <button
            className="btn btn-ghost-bordered load-more"
            id="loadMore"
            onClick={handleLoadMore}
          >
            Load more notes
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
      </div>
    </>
  )
}

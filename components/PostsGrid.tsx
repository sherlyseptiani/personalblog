'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import PostCard from './PostCard'
import type { Post } from '@/lib/types'

type Props = {
  initialPosts: Post[]
  initialTotal: number
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'essay', label: 'Essays' },
  { key: 'craft', label: 'Craft' },
  { key: 'field', label: 'Field notes' },
  { key: 'reading', label: 'Reading' },
  { key: 'systems', label: 'Systems' },
]

const LIMIT = 8

export default function PostsGrid({ initialPosts, initialTotal }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [total, setTotal] = useState(initialTotal)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [newPostSlugs, setNewPostSlugs] = useState<Set<string>>(new Set())
  const postsGridRef = useRef<HTMLDivElement>(null)
  const shouldScrollRef = useRef(false)

  // Handle smooth scroll after new posts are loaded
  useEffect(() => {
    if (shouldScrollRef.current && newPostSlugs.size > 0 && !loading) {
      shouldScrollRef.current = false
      // Small delay to allow DOM to update
      setTimeout(() => {
        const firstNewCard = postsGridRef.current?.querySelector('.post-anim-new')
        if (firstNewCard) {
          firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
        }
      }, 50)
    }
  }, [newPostSlugs, loading])

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

  const handleFilter = (key: string) => {
    setActiveFilter(key)
    setPage(1)
    fetchPosts(key, search, 1, false)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setActiveFilter('all')
    setPage(1)
    fetchPosts('all', search, 1, false)
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    shouldScrollRef.current = true
    fetchPosts(activeFilter, search, next, true)
  }

  const showing = posts.length

  return (
    <>
      <header className="section-head" style={{ position: 'relative', zIndex: 1 }}>
        <div className="titles">
          <span className="eyebrow">The archive</span>
          <h2>Recent writing.</h2>
          <p>
            Essays, half-formed ideas, and field notes. New entries arrive most Sundays &mdash;
            quiet weeks are part of the practice.
          </p>
        </div>
        <div className="filters glass" id="filters" style={{ '--glass-bg': 'var(--glass-bg-strong)' } as React.CSSProperties}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              data-filter={f.key}
              className={activeFilter === f.key ? 'active' : ''}
              onClick={() => handleFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <form onSubmit={handleSearch} style={{ position: 'relative', zIndex: 1, marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="search-input"
            style={{
              flex: 1,
              padding: '8px 14px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--ink-1)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
          />
          <button
            type="submit"
            className="btn btn-ghost-bordered"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-ghost-bordered"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              onClick={() => { setSearch(''); fetchPosts(activeFilter, '', 1, false); setPage(1) }}
            >
              ✕
            </button>
          )}
        </div>
      </form>

      <div className="posts" id="postsGrid" ref={postsGridRef} style={{ position: 'relative', zIndex: 1 }}>
        {posts.map(post => (
          <PostCard
            key={post.slug}
            post={post}
            className={newPostSlugs.has(post.slug) ? 'post-anim-new' : undefined}
          />
        ))}
        {posts.length === 0 && !loading && (
          <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-serif)', padding: '40px 0' }}>
            No posts found.
          </p>
        )}
      </div>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .post-anim-new {
          animation: fadeInUp 0.45s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="load-more-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="count" id="postCount">
          {loading ? 'Loading…' : `Showing ${showing} of ${total}`}
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

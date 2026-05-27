import Link from 'next/link'
import type { Post } from '@/lib/types'
import { CATEGORIES, formatDate } from '@/lib/categories'
import CoverThumb from './CoverThumb'

// Decode HTML entities like &nbsp; &amp; etc.
function decodeHtmlEntities(text: string | null): string {
  if (!text) return ''
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

export default function PostCard({ post, className }: { post: Post; className?: string }) {
  const cat = CATEGORIES[post.category]
  const href = `/posts/${post.slug}`
  const date = formatDate(post.published_at)

  if (post.text_only) {
    return (
      <Link href={href} className={`post-card text-only glass${className ? ` ${className}` : ''}`} data-cat={post.category}>
        <div className="meta-row">
          <span className="tag">
            <span className="tag-dot" style={{ background: cat.color }}></span>
            {cat.label}
          </span>
        </div>
        <h3>{post.title}</h3>
        <div className="pull" dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(post.pull_quote) }} />
        <div className="footline">
          <span>{date} · {post.read_time} min read</span>
          <span className="arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={`post-card glass${post.featured ? ' featured' : ''}${className ? ` ${className}` : ''}`}
      data-cat={post.category}
    >
      <CoverThumb
        thumbnail={post.post_thumbnail ?? null}
        coverArt={post.cover_art}
        slug={post.slug}
        category={post.category}
      />
      <div className="meta-row">
        <span className="tag">
          <span className="tag-dot" style={{ background: cat.color }}></span>
          {cat.label}
        </span>
        <span className="meta-stat" style={{ fontSize: '11.5px' }}>{post.read_time} min read</span>
      </div>
      <h3>{post.title}</h3>
      <div className="preview">{post.excerpt}</div>
      <div className="footline">
        <span>{date}</span>
        <span className="arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

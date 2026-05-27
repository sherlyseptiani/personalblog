import Link from 'next/link'
import type { Post } from '@/lib/types'
import { CATEGORIES, formatDate, artSvg } from '@/lib/categories'

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
        <div className="pull">{post.pull_quote}</div>
        <div className="footline">
          <span>{date} · {post.read_time}</span>
          <span className="arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </div>
      </Link>
    )
  }

  const art = post.cover_art ?? {}
  const thumb = art.thumb ?? 'square'
  const kind = art.kind ?? 'orb'

  return (
    <Link
      href={href}
      className={`post-card glass${post.featured ? ' featured' : ''}${className ? ` ${className}` : ''}`}
      data-cat={post.category}
    >
      <div className={`thumb ${thumb}`}>
        <div
          className="ph"
          style={
            {
              '--p1': art.p1 ?? '#1f2a3a',
              '--p2': art.p2 ?? '#4f6b85',
            } as React.CSSProperties
          }
        >
          <div dangerouslySetInnerHTML={{ __html: artSvg(kind) }} />
          <div className="ph-overlay"></div>
          <div className="ph-label">{cat.label}</div>
        </div>
      </div>
      <div className="meta-row">
        <span className="tag">
          <span className="tag-dot" style={{ background: cat.color }}></span>
          {cat.label}
        </span>
        <span className="meta-stat" style={{ fontSize: '11.5px' }}>{post.read_time}</span>
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

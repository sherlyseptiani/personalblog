'use client'

import Link from 'next/link'

type ActivePage = 'writing' | 'about' | undefined

export default function Nav({ activePage }: { activePage?: ActivePage }) {
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
        <button className="icon-btn" aria-label="Search">
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

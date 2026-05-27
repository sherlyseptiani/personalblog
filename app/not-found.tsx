import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found · A Curious Note',
}

export default function NotFound() {
  return (
    <main className="nf-root">
      <div className="dotgrid nf-dotgrid" aria-hidden="true" />

      {/* Big ghost 404 */}
      <div className="nf-ghost" aria-hidden="true">
        <span>4</span>
        <span className="nf-zero">0</span>
        <span>4</span>
      </div>

      {/* Floating orbs */}
      <div className="nf-orb nf-orb-a" aria-hidden="true" />
      <div className="nf-orb nf-orb-b" aria-hidden="true" />
      <div className="nf-orb nf-orb-c" aria-hidden="true" />

      {/* Glass card */}
      <div className="glass nf-card">
        <div className="nf-mark-row">
          <span className="mark nf-mark" />
          <span className="eyebrow">Issue not found</span>
        </div>

        <h1 className="nf-heading">
          This page went exploring.
        </h1>

        <p className="nf-body">
          You followed a link to somewhere I haven&apos;t written yet —
          or a page that quietly moved when I wasn&apos;t looking.
          Either way, you&apos;ve found the one blank corner of this blog.
        </p>

        <div className="nf-dots" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="nf-actions">
          <Link href="/" className="nf-btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M6 1L1 7l5 6M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to the blog
          </Link>
          <Link href="/about" className="nf-btn-ghost">
            Who writes this?
          </Link>
        </div>
      </div>
    </main>
  )
}

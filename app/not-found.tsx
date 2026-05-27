import Link from 'next/link'
import NotFoundGame from '@/components/NotFoundGame'

export const metadata = {
  title: '404 — Page Not Found · A Curious Note',
}

export default function NotFound() {
  return (
    <main className="nf-root">
      <div className="nf-orb nf-orb-a" aria-hidden="true" />
      <div className="nf-orb nf-orb-b" aria-hidden="true" />
      <div className="nf-orb nf-orb-c" aria-hidden="true" />
      <div className="nf-orb nf-orb-d" aria-hidden="true" />

      <div className="nf-wrap">
        <div className="nf-digits" aria-label="404">
          <span className="nf-d nf-d1">4</span>
          <span className="nf-d nf-d0">0</span>
          <span className="nf-d nf-d2">4</span>
        </div>

        <div className="glass nf-card">
          <div className="nf-mark-row">
            <span className="mark nf-mark" />
            <span className="eyebrow">page not found</span>
          </div>

          <h1 className="nf-heading">Lost? So is this page.</h1>
          <p className="nf-body">
            While you&apos;re here — try not to hit the question marks.
          </p>

          <NotFoundGame />

          <div className="nf-actions">
            <Link href="/" className="nf-btn-primary">← Back to the blog</Link>
            <Link href="/about" className="nf-btn-ghost">Who writes this?</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'

type Props = {
  sourcePage: string
  postSlug?: string
  title?: string
  titleSuffix?: React.ReactNode
  placeholder?: string
  description?: string
  sendLabel?: string
  showCount?: boolean
  showRecent?: boolean
  initialIdeas?: { content: string }[]
}

export default function IdeaWidget({
  sourcePage,
  postSlug,
  title = 'Submit an idea',
  titleSuffix,
  placeholder = 'e.g. why software UI is getting quieter, or the strange comfort of bookmark managers...',
  description,
  sendLabel = 'Send it',
  showCount = false,
  showRecent = false,
  initialIdeas = [],
}: Props) {
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recentIdeas, setRecentIdeas] = useState<{ content: string }[]>(initialIdeas)

  useEffect(() => {
    if (showRecent && initialIdeas.length === 0) {
      fetch('/api/ideas/recent')
        .then(r => r.json())
        .then(d => { if (d.ideas) setRecentIdeas(d.ideas) })
        .catch(() => {})
    }
  }, [showRecent, initialIdeas.length])

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, source_page: sourcePage, post_slug: postSlug }),
      })
      if (res.ok) {
        setValue('')
        ;(window as any).showToast?.('Idea sent — thanks!')
        // Refresh recent ideas optimistically
        if (showRecent) {
          setRecentIdeas(prev => [{ content: trimmed }, ...prev].slice(0, 3))
        }
      } else {
        const err = await res.json()
        ;(window as any).showToast?.(err.error || 'Something went wrong.')
      }
    } catch {
      ;(window as any).showToast?.('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="idea-widget" id="ideaWidget">
      <div className="col-title">
        {title}
        {titleSuffix ?? <span className="badge">NEW</span>}
      </div>
      {description && (
        <p style={{ margin: '0 0 10px', color: 'var(--ink-2)', fontSize: '14px', fontFamily: 'var(--font-serif)' }}>
          {description}
        </p>
      )}
      <div className="field">
        <textarea
          id="ideaInput"
          placeholder={placeholder}
          maxLength={280}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div className="field-foot">
          <span className="helper">
            {showCount ? (
              <><span id="ideaCount">{value.length}</span>/280 · anonymous ok</>
            ) : (
              '280 chars · anonymous ok'
            )}
          </span>
          <button
            className="send-btn"
            id="ideaSend"
            onClick={handleSend}
            disabled={submitting}
          >
            {sendLabel}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </div>
      {showRecent && recentIdeas.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div className="col-title" style={{ marginBottom: '8px', fontSize: '10px' }}>Recent prompts</div>
          <div className="recent">
            {recentIdeas.map((idea, i) => (
              <span key={i} className="chip">&ldquo;{idea.content}&rdquo;</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

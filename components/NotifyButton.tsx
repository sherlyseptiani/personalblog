'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { spawnGlitter } from '@/lib/glitter'

const NOTIFY_KEY = 'acn-notify'
type Step = 'form' | 'loading' | 'success'

export default function NotifyButton() {
  const [subscribed, setSubscribed] = useState(false)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'email' | 'phone'>('email')
  const [value, setValue] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSubscribed(!!localStorage.getItem(NOTIFY_KEY))
  }, [])

  useEffect(() => {
    if (open && step === 'form') {
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open, step])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  const handleOpen = (e: React.MouseEvent) => {
    spawnGlitter(e.clientX, e.clientY)
    if (subscribed) {
      ;(window as any).showToast?.("Already subscribed")
      return
    }
    setStep('form')
    setValue('')
    setError('')
    setOpen(true)
  }

  const handleTypeSwitch = (t: 'email' | 'phone') => {
    setType(t)
    setValue('')
    setError('')
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) { setError('Please enter a value.'); return }

    setStep('loading')
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: trimmed, type }),
      })
      const json = await res.json()

      if (!res.ok) {
        setStep('form')
        setError(json.error || 'Something went wrong. Try again.')
        return
      }

      setStep('success')
      setSubscribed(true)
      try { localStorage.setItem(NOTIFY_KEY, '1') } catch {}
    } catch {
      setStep('form')
      setError('Network error. Please try again.')
    }
  }

  const handleDone = () => {
    setOpen(false)
    ;(window as any).showToast?.("Subscribed successfully")
  }

  return (
    <>
      <button
        type="button"
        className={`btn btn-ghost-bordered notify-btn${subscribed ? ' on' : ''}`}
        id="notifyBtn"
        aria-pressed={subscribed}
        onClick={handleOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {subscribed ? (
            <path d="M20 6 9 17l-5-5"/>
          ) : (
            <>
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </>
          )}
        </svg>
        <span className="notify-label">
          {subscribed ? "You'll be notified" : 'Notify me on new posts'}
        </span>
      </button>

      {open && (
        <>
          <div className="np-backdrop" onClick={handleClose} aria-hidden="true" />

          <div className="np-popup glass" role="dialog" aria-modal="true" aria-label="Subscribe for notifications">
            <button className="np-close" onClick={handleClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>

            {step === 'success' ? (
              <div className="np-success">
                <div className="np-success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <h3>You&apos;re in the loop.</h3>
                <p>I&apos;ll send a quiet ping when a new note goes up. No noise, just notes.</p>
                <button
                  className="btn btn-primary np-done-btn"
                  onClick={handleDone}
                >
                  Got it
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="np-head">
                  <div className="np-head-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Stay in the loop.</h3>
                    <p>A quiet ping when a new note arrives. That&apos;s it.</p>
                  </div>
                </div>

                <div className="np-tabs">
                  <button type="button" className={type === 'email' ? 'active' : ''} onClick={() => handleTypeSwitch('email')}>Email</button>
                  <button type="button" className={type === 'phone' ? 'active' : ''} onClick={() => handleTypeSwitch('phone')}>Phone</button>
                </div>

                <div className="np-input-wrap">
                  <input
                    ref={inputRef}
                    type={type === 'email' ? 'email' : 'tel'}
                    value={value}
                    onChange={e => { setValue(e.target.value); setError('') }}
                    placeholder={type === 'email' ? 'you@example.com' : '+1 234 567 8900'}
                    autoComplete={type === 'email' ? 'email' : 'tel'}
                  />
                </div>

                {error && <p className="np-error">{error}</p>}

                <button type="submit" className="btn btn-primary np-submit" disabled={step === 'loading'}>
                  {step === 'loading' ? 'Saving…' : 'Notify me'}
                  {step === 'form' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  )}
                </button>

                <p className="np-disclaimer">No spam. No sharing. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </>
      )}
    </>
  )
}

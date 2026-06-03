'use client'

import { useState, useEffect, useCallback } from 'react'
import './decision-coin.css'
import Footer from '@/components/Footer'
import PaletteSwitcher from '../tools/shared/PaletteSwitcher'

type Step = 'input' | 'flipping' | 'result' | 'reflection' | 'response'

interface ReflectionResponse {
  text: string
  subtext: string
}

const REFLECTIONS: Record<string, ReflectionResponse> = {
  yes: {
    text: 'You may already know what you want.',
    subtext: 'The coin just helped you see it.',
  },
  no: {
    text: 'Interesting.',
    subtext: 'Sometimes disappointment is more informative than the coin.',
  },
  unsure: {
    text: "That's okay.",
    subtext: 'Some decisions need a little more time.',
  },
}

export default function DecisionCoinContent() {
  const [step, setStep] = useState<Step>('input')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [reflection, setReflection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const a = params.get('optionA')
    const b = params.get('optionB')
    if (a) setOptionA(a)
    if (b) setOptionB(b)
  }, [])

  const validate = useCallback(() => {
    const a = optionA.trim()
    const b = optionB.trim()

    if (!a || !b) {
      setError('Please enter both options')
      return false
    }

    if (a.length > 60 || b.length > 60) {
      setError('Each option must be 60 characters or less')
      return false
    }

    setError(null)
    return true
  }, [optionA, optionB])

  const handleFlip = useCallback(() => {
    if (!validate()) return

    setStep('flipping')

    // Wait for animation to complete (1.8s)
    setTimeout(() => {
      const winner = Math.random() < 0.5 ? optionA.trim() : optionB.trim()
      setResult(winner)
      setStep('result')

      // Wait before showing reflection
      setTimeout(() => {
        setStep('reflection')
      }, 1800)
    }, 1800)
  }, [optionA, optionB, validate])

  const handleReflection = useCallback((answer: string) => {
    setReflection(answer)
    setStep('response')
  }, [])

  const handleReset = useCallback(() => {
    setStep('input')
    setResult(null)
    setReflection(null)
    setError(null)
    // Don't clear inputs - user might want to adjust slightly
  }, [])

  const handleCopyLink = useCallback(async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('optionA', optionA.trim())
    url.searchParams.set('optionB', optionB.trim())
    await navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [optionA, optionB])

  const getInitial = (text: string) => {
    return text.trim().charAt(0).toUpperCase() || '?'
  }

  return (
    <>
      <div className="dc-container">
        {/* Header */}
        <header className="dc-header">
          <div className="dc-eyebrow">
            <span className="dot"></span>
            <span>A small tool</span>
          </div>
          <h1>
            Decision <em>Coin</em>.
          </h1>
          <p className="dc-lede">Flip a coin for difficult choices, then notice how you feel about the result.</p>
        </header>

        {/* Card */}
        <div className="dc-card">
          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="dc-step-input">
              <h2 className="dc-question">What are you deciding between?</h2>

              <div className="dc-inputs">
                <div className="dc-field">
                  <label htmlFor="optionA">Option A</label>
                  <input
                    id="optionA"
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value.slice(0, 60))}
                    placeholder="Stay home"
                    maxLength={60}
                    aria-label="First option"
                  />
                </div>

                <div className="dc-or">or</div>

                <div className="dc-field">
                  <label htmlFor="optionB">Option B</label>
                  <input
                    id="optionB"
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value.slice(0, 60))}
                    placeholder="Go out"
                    maxLength={60}
                    aria-label="Second option"
                  />
                </div>
              </div>

              {error && <p className="dc-error">{error}</p>}

              <button className="dc-btn dc-btn-primary" onClick={handleFlip}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Flip the Coin
              </button>
            </div>
          )}

          {/* Step 2: Flipping */}
          {step === 'flipping' && (
            <div className="dc-coin-container">
              <div className="dc-coin dc-coin-flipping">
                <div className="dc-coin-face">
                  <div className="dc-coin-inner">
                    <span className="dc-coin-initial">{getInitial(optionA)}</span>
                  </div>
                </div>
                <div className="dc-coin-back">
                  <div className="dc-coin-inner">
                    <span className="dc-coin-initial">{getInitial(optionB)}</span>
                  </div>
                </div>
              </div>
              <p className="dc-flipping-text">The coin is in the air...</p>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && result && (
            <div className="dc-result">
              <p className="dc-result-label">The coin landed on</p>
              <p className="dc-result-value">{result}</p>
              <p className="dc-result-hint">Take a moment to notice your reaction...</p>
            </div>
          )}

          {/* Step 4: Reflection */}
          {step === 'reflection' && (
            <div className="dc-reflection">
              <h2 className="dc-reflection-question">
                When you saw the result,
                <br />
                were you secretly hoping for it?
              </h2>

              <div className="dc-reflection-options">
                <button className="dc-reflection-btn" onClick={() => handleReflection('yes')}>
                  Yes
                </button>
                <button className="dc-reflection-btn" onClick={() => handleReflection('no')}>
                  No
                </button>
                <button className="dc-reflection-btn" onClick={() => handleReflection('unsure')}>
                  Not sure
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Response */}
          {step === 'response' && reflection && (
            <div className="dc-response">
              <p className="dc-response-text">{REFLECTIONS[reflection].text}</p>
              <p className="dc-response-subtext">{REFLECTIONS[reflection].subtext}</p>

              <div className="dc-actions">
                <button className="dc-btn dc-btn-primary" onClick={handleReset}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Flip Again
                </button>
                <button className="dc-btn dc-btn-secondary" onClick={handleCopyLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State - Only show on initial input step */}
        {step === 'input' && !optionA && !optionB && (
          <div className="dc-empty-state">
            <p>Some choices don't need advice. They just need a coin and a moment of honesty.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="dc-footer">
          <p>A surprisingly useful trick for a piece of metal.</p>
          <p className="dc-quote">"Sometimes the answer appears before the coin lands."</p>
        </footer>
      </div>

      <Footer sourcePage="decision-coin" />
      <PaletteSwitcher />
    </>
  )
}

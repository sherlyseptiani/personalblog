'use client'

import { useState, useEffect, useCallback } from 'react'
import './decision-coin.css'
import PaletteSwitcher from '../tools/shared/PaletteSwitcher'
import { usePalette } from '../tools/shared/PaletteContext'

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

const MAX_OPTIONS = 5

export default function DecisionCoinContent() {
  const [step, setStep] = useState<Step>('input')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [result, setResult] = useState<string | null>(null)
  const [reflection, setReflection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { mounted } = usePalette()

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const a = params.get('optionA')
    const b = params.get('optionB')

    // Try new format first
    const optionsParam = params.get('options')
    if (optionsParam) {
      try {
        const parsedOptions = JSON.parse(decodeURIComponent(optionsParam))
        if (Array.isArray(parsedOptions) && parsedOptions.length >= 2) {
          setOptions(parsedOptions.slice(0, MAX_OPTIONS))
          return
        }
      } catch {
        // Fall through to old format
      }
    }

    // Legacy format support
    if (a || b) {
      const newOptions = ['', '']
      if (a) newOptions[0] = a
      if (b) newOptions[1] = b
      setOptions(newOptions)
    }
  }, [])

  const validate = useCallback(() => {
    const filledOptions = options.filter(o => o.trim())

    if (filledOptions.length < 2) {
      setError('Please enter at least 2 options')
      return false
    }

    if (options.some(o => o.length > 60)) {
      setError('Each option must be 60 characters or less')
      return false
    }

    setError(null)
    return true
  }, [options])

  const handleFlip = useCallback(() => {
    if (!validate()) return

    setStep('flipping')

    // Wait for animation to complete (1.8s)
    setTimeout(() => {
      const filledOptions = options.filter(o => o.trim())
      const winner = filledOptions[Math.floor(Math.random() * filledOptions.length)]
      setResult(winner)
      setStep('result')

      // Wait before showing reflection
      setTimeout(() => {
        setStep('reflection')
      }, 1800)
    }, 1800)
  }, [options, validate])

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
    // Clear old params
    url.searchParams.delete('optionA')
    url.searchParams.delete('optionB')
    // Set new format
    const filledOptions = options.filter(o => o.trim())
    url.searchParams.set('options', encodeURIComponent(JSON.stringify(filledOptions)))
    await navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [options])

  const addOption = useCallback(() => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, ''])
    }
  }, [options])

  const removeOption = useCallback((index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }, [options])

  const updateOption = useCallback((index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value.slice(0, 60)
    setOptions(newOptions)
  }, [options])

  const getInitial = (text: string) => {
    return text.trim().charAt(0).toUpperCase() || '?'
  }

  const filledOptions = options.filter(o => o.trim())
  const resultIndex = result ? filledOptions.indexOf(result) : -1

  return (
    <>
      <div className="dc-container" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease' }}>
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
              <h2 className="dc-question">
                {options.length === 2 ? 'What are you deciding between?' : 'What are your options?'}
              </h2>

              <div className="dc-options-list">
                {options.map((option, index) => (
                  <div key={index} className="dc-field-row">
                    <div className="dc-field dc-field-flex">
                      <label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</label>
                      <input
                        id={`option-${index}`}
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={index === 0 ? 'Stay home' : index === 1 ? 'Go out' : `Option ${String.fromCharCode(65 + index)}`}
                        maxLength={60}
                        aria-label={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="dc-remove-btn"
                        onClick={() => removeOption(index)}
                        aria-label={`Remove option ${String.fromCharCode(65 + index)}`}
                        title="Remove option"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < MAX_OPTIONS && (
                <button type="button" className="dc-add-option-btn" onClick={addOption}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add another option
                </button>
              )}

              {error && <p className="dc-error">{error}</p>}

              <button className="dc-btn dc-btn-primary" onClick={handleFlip}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                {options.length === 2 ? 'Flip the Coin' : `Choose from ${filledOptions.length} options`}
              </button>
            </div>
          )}

          {/* Step 2: Flipping */}
          {step === 'flipping' && (
            <div className="dc-coin-container">
              <div className="dc-coin dc-coin-flipping">
                <div className="dc-coin-face dc-coin-multi">
                  <div className="dc-coin-inner">
                    <span className="dc-coin-question">?</span>
                  </div>
                </div>
              </div>
              <p className="dc-flipping-text">The coin is deciding...</p>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && result && (
            <div className="dc-result">
              <p className="dc-result-label">The coin chose</p>
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
        {step === 'input' && !options.some(o => o.trim()) && (
          <div className="dc-empty-state">
            <p>Some choices don't need advice. They just need a coin and a moment of honesty.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="dc-footer" style={{ textAlign: 'center', padding: '40px 20px', fontSize: '13px', color: 'var(--ink-3)' }}>
          <p>
            A tool by <a href="https://acuriousnote.com" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>acuriousnote.com</a>
          </p>
        </footer>
      </div>

      <PaletteSwitcher />
    </>
  )
}

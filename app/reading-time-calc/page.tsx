'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import './reading-time-calc.css'
import Footer from '@/components/Footer'

// Reading speeds (words per minute)
const READING_SPEEDS = {
  casual: 250,
  average: 200,
  careful: 150,
  aloud: 140,
}

// Reading levels based on complexity
function calculateReadingLevel(avgSentenceLength: number, longWordPercentage: number): {
  level: string
  description: string
} {
  let score = 0

  // Sentence length factor
  if (avgSentenceLength <= 12) score += 1
  else if (avgSentenceLength <= 17) score += 2
  else if (avgSentenceLength <= 23) score += 3
  else if (avgSentenceLength <= 30) score += 4
  else score += 5

  // Long word factor
  if (longWordPercentage > 20) score += 1
  if (longWordPercentage > 30) score += 1

  const levels = [
    { level: 'Very easy', description: 'Simple, clear sentences that flow quickly.' },
    { level: 'Easy', description: 'Comfortable reading for most audiences.' },
    { level: 'Moderate', description: 'The sentences are fairly readable, with a few longer words.' },
    { level: 'Dense', description: 'This may ask readers to slow down a little.' },
    { level: 'Very dense', description: 'Complex writing that rewards careful attention.' },
  ]

  const index = Math.min(Math.max(score - 1, 0), 4)
  return levels[index]
}

// Format time nicely
function formatTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than 1 min'
  }
  if (minutes < 1.5) {
    return 'About 1 min'
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`
}

// Calculate reading stats
function calculateStats(text: string) {
  // Clean text
  const cleanedText = text.trim()
  if (!cleanedText) return null

  // Word count
  const words = cleanedText.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length

  // Character counts
  const charCount = cleanedText.length
  const charCountNoSpaces = cleanedText.replace(/\s/g, '').length

  // Sentence count (estimate from punctuation)
  const sentences = cleanedText.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentenceCount = Math.max(sentences.length, 1)

  // Paragraph count
  const paragraphs = cleanedText.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const paragraphCount = Math.max(paragraphs.length, 1)

  // Average sentence length
  const avgSentenceLength = wordCount / sentenceCount

  // Long words (7+ characters)
  const longWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 7)
  const longWordPercentage = (longWords.length / wordCount) * 100

  // Reading times
  const times = {
    casual: wordCount / READING_SPEEDS.casual,
    average: wordCount / READING_SPEEDS.average,
    careful: wordCount / READING_SPEEDS.careful,
    aloud: wordCount / READING_SPEEDS.aloud,
  }

  // Reading level
  const readingLevel = calculateReadingLevel(avgSentenceLength, longWordPercentage)

  // Context note based on length
  let contextNote = ''
  if (wordCount < 100) {
    contextNote = 'A quick read. Probably shorter than deciding whether to read it.'
  } else if (wordCount < 500) {
    contextNote = 'A comfortable article-length read.'
  } else if (wordCount < 1500) {
    contextNote = 'A proper sit-down read. Tea may be appropriate.'
  } else {
    contextNote = 'The word count is not terrifying, but this will take some time.'
  }

  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    avgSentenceLength,
    longWordPercentage,
    times,
    readingLevel,
    contextNote,
  }
}

export default function ReadingTimeCalcPage() {
  const [text, setText] = useState('')
  const [stats, setStats] = useState<ReturnType<typeof calculateStats>>(null)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-calculate on text change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim()) {
        setStats(calculateStats(text))
      } else {
        setStats(null)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [text])

  const handleCalculate = useCallback(() => {
    if (text.trim()) {
      setStats(calculateStats(text))
    }
  }, [text])

  const handleClear = useCallback(() => {
    setText('')
    setStats(null)
    textareaRef.current?.focus()
  }, [])

  const handleCopy = useCallback(async () => {
    if (!stats) return

    const summary = `Reading time estimate:
Words: ${stats.wordCount.toLocaleString()}
Casual: ${formatTime(stats.times.casual)}
Average: ${formatTime(stats.times.average)}
Careful: ${formatTime(stats.times.careful)}
Aloud: ${formatTime(stats.times.aloud)}
Reading level: ${stats.readingLevel.level}`

    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [stats])

  return (
    <main className="wrap rtc-page">
      <div className="rtc-container">
        {/* Header */}
        <header className="rtc-header">
          <div className="rtc-eyebrow">
            <span className="dot"></span>
            <span>A small tool</span>
          </div>
          <h1>
            Reading Time <em>Calculator</em>.
          </h1>
          <p className="rtc-lede">
            Paste any text and get a calmer estimate of how long it takes to read — for casual, average, and careful readers.
          </p>
        </header>

        {/* Input Card */}
        <div className="rtc-input-card">
          <div className="rtc-field">
            <label htmlFor="text-input">Paste your text</label>
            <div className="rtc-textarea-wrap">
              <textarea
                ref={textareaRef}
                id="text-input"
                className="rtc-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste an article, essay, newsletter, script, or anything else you want to measure."
                aria-label="Paste text to calculate reading time"
              />
            </div>
            <div className="rtc-privacy-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Your text stays in your browser. Nothing is uploaded.
            </div>
          </div>

          <div className="rtc-actions">
            <button
              className="rtc-btn rtc-btn-primary"
              onClick={handleCalculate}
              disabled={!text.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Calculate Reading Time
            </button>
            <button
              className="rtc-btn rtc-btn-secondary"
              onClick={handleClear}
              disabled={!text}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {stats && (
          <div className="rtc-results">
            {/* Main Result */}
            <div className="rtc-main-result">
              <div className="rtc-label">Average reading time</div>
              <div className="rtc-time">{formatTime(stats.times.average)}</div>
              <div className="rtc-note">{stats.contextNote}</div>
            </div>

            {/* Speed Cards */}
            <div className="rtc-speed-grid">
              <div className="rtc-speed-card">
                <div className="rtc-speed-label">Casual Reader</div>
                <div className="rtc-speed-time">{formatTime(stats.times.casual)}</div>
                <div className="rtc-speed-wpm">~{READING_SPEEDS.casual} wpm</div>
              </div>
              <div className="rtc-speed-card highlight">
                <div className="rtc-speed-label">Average Reader</div>
                <div className="rtc-speed-time">{formatTime(stats.times.average)}</div>
                <div className="rtc-speed-wpm">~{READING_SPEEDS.average} wpm</div>
              </div>
              <div className="rtc-speed-card">
                <div className="rtc-speed-label">Careful Reader</div>
                <div className="rtc-speed-time">{formatTime(stats.times.careful)}</div>
                <div className="rtc-speed-wpm">~{READING_SPEEDS.careful} wpm</div>
              </div>
            </div>

            {/* Aloud Reading */}
            <div className="rtc-aloud-card">
              <div className="rtc-aloud-left">
                <div className="rtc-aloud-label">Reading Aloud</div>
                <div className="rtc-aloud-time">{formatTime(stats.times.aloud)}</div>
              </div>
              <div className="rtc-aloud-note">
                Reading aloud usually takes longer because speech has pauses, emphasis, and breathing.
              </div>
            </div>

            {/* Stats Table */}
            <div className="rtc-stats-card">
              <h4>Text Details</h4>
              <table className="rtc-stats-table">
                <tbody>
                  <tr>
                    <td>Words</td>
                    <td>{stats.wordCount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Characters</td>
                    <td>{stats.charCount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Sentences</td>
                    <td>{stats.sentenceCount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Paragraphs</td>
                    <td>{stats.paragraphCount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Avg. sentence length</td>
                    <td>{stats.avgSentenceLength.toFixed(1)} words</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Reading Level */}
            <div className="rtc-level-card">
              <h4>Reading Level</h4>
              <div className="rtc-level-value">{stats.readingLevel.level}</div>
              <div className="rtc-level-desc">{stats.readingLevel.description}</div>
            </div>

            {/* Context Note */}
            <div className="rtc-context-note">
              <p>
                These are estimates, not a stopwatch. Dense writing, unfamiliar topics, and footnotes will slow people down. As they should.
              </p>
            </div>

            {/* Copy Button */}
            <div className="rtc-copy-wrap">
              <button
                className={`rtc-btn-copy ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Summary
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!stats && !text && (
          <div className="rtc-empty-state">
            <p>
              Paste something above. A blog post, a speech, a long email, a chapter draft, a wall of text from someone who really discovered paragraphs late in life.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="rtc-footer">
          <p>
            Reading time depends on attention, topic, and whether your phone is nearby, unfortunately.
          </p>
        </footer>
      </div>

      <Footer sourcePage="reading-time-calc" />
    </main>
  )
}

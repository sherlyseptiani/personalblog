'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import './reading-time-calc.css'
import PaletteSwitcher from '../tools/shared/PaletteSwitcher'
import { usePalette } from '../tools/shared/PaletteContext'

// Reading speeds (words per minute)
const READING_SPEEDS = {
  casual: 250,
  average: 200,
  careful: 150,
  aloud: 140,
}

type InputMode = 'text' | 'url' | 'book'

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
  const { mounted } = usePalette()
  const [inputMode, setInputMode] = useState<InputMode>('book')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [urlTitle, setUrlTitle] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [stats, setStats] = useState<ReturnType<typeof calculateStats>>(null)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  // Book lookup state
  const [bookQuery, setBookQuery] = useState('')
  const [bookQueryType, setBookQueryType] = useState<'title' | 'author' | 'isbn'>('title')
  const [isLoadingBook, setIsLoadingBook] = useState(false)
  const [bookError, setBookError] = useState<string | null>(null)
  const [bookInfo, setBookInfo] = useState<{
    title: string
    author: string
    publishedYear: number | null
    pageCount: number
    genre: string
    description: string
    confidence: string
  } | null>(null)
  const [multipleBooks, setMultipleBooks] = useState<typeof bookInfo[] | null>(null)
  const bookInputRef = useRef<HTMLInputElement>(null)

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
    setUrl('')
    setUrlTitle(null)
    setUrlError(null)
    setBookQuery('')
    setBookError(null)
    setBookInfo(null)
    setMultipleBooks(null)
    setStats(null)
    if (inputMode === 'text') {
      textareaRef.current?.focus()
    } else if (inputMode === 'url') {
      urlInputRef.current?.focus()
    } else {
      bookInputRef.current?.focus()
    }
  }, [inputMode])

  const handleFetchUrl = useCallback(async () => {
    if (!url.trim()) return

    setIsLoadingUrl(true)
    setUrlError(null)
    setUrlTitle(null)

    try {
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch URL')
      }

      setText(data.text)
      setUrlTitle(data.title)
      setStats(calculateStats(data.text))
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Failed to fetch URL')
    } finally {
      setIsLoadingUrl(false)
    }
  }, [url])

  const handleFetchBook = useCallback(async () => {
    if (!bookQuery.trim()) return

    setIsLoadingBook(true)
    setBookError(null)
    setBookInfo(null)
    setMultipleBooks(null)

    try {
      const response = await fetch('/api/estimate-book-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: bookQuery.trim(), type: bookQueryType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to look up book')
      }

      if (data.multipleResults && data.books.length > 1) {
        // Show multiple results for selection
        setMultipleBooks(data.books)
      } else if (data.book) {
        // Single result
        setBookInfo(data.book)
        setStats(data.stats)
      }
    } catch (err) {
      setBookError(err instanceof Error ? err.message : 'Failed to look up book')
    } finally {
      setIsLoadingBook(false)
    }
  }, [bookQuery, bookQueryType])

  const handleSelectBook = useCallback((book: typeof bookInfo) => {
    if (!book) return

    setBookInfo(book)
    setMultipleBooks(null)

    // Calculate stats for selected book
    const wordCount = book.wordCount
    const pageCount = book.pageCount
    const readingLevel = book.readingLevel

    setStats({
      wordCount,
      charCount: wordCount * 5,
      charCountNoSpaces: wordCount * 4,
      sentenceCount: Math.round(wordCount / 15),
      paragraphCount: Math.round(pageCount * 2.5),
      avgSentenceLength: 15,
      longWordPercentage: readingLevel === 'Dense' ? 25 : readingLevel === 'Easy' ? 12 : 18,
      times: {
        casual: wordCount / 250,
        average: wordCount / 200,
        careful: wordCount / 150,
        aloud: wordCount / 140,
      },
      readingLevel: {
        level: readingLevel,
        description: readingLevel === 'Easy'
          ? 'Simple, clear writing that flows quickly.'
          : readingLevel === 'Dense'
          ? 'Complex writing that rewards careful attention.'
          : 'Comfortable reading for most audiences.',
      },
      contextNote: `${pageCount} pages · ${book.genre || 'General'}`,
    })
  }, [])

  const handleCopy = useCallback(async () => {
    if (!stats) return

    let summary = `Reading time estimate:
Words: ${stats.wordCount.toLocaleString()}
Casual: ${formatTime(stats.times.casual)}
Average: ${formatTime(stats.times.average)}
Careful: ${formatTime(stats.times.careful)}
Aloud: ${formatTime(stats.times.aloud)}
Reading level: ${stats.readingLevel.level}`

    if (bookInfo) {
      summary = `"${bookInfo.title}" by ${bookInfo.author}
${bookInfo.pageCount} pages · ${bookInfo.genre}

${summary}`
    }

    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [stats, bookInfo])

  const handleModeChange = useCallback((mode: InputMode) => {
    setInputMode(mode)
    setUrlError(null)
    setBookError(null)
    // Clear results when switching modes
    setStats(null)
    setText('')
    setUrl('')
    setUrlTitle(null)
    setBookQuery('')
    setBookInfo(null)
  }, [])

  return (
    <main className="wrap rtc-page" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease' }}>
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
            Search any book,enter a URL, or copy paste any text to get an estimate of how long it takes to read — for casual, average, and careful readers.
          </p>
        </header>

        {/* Input Card */}
        <div className="rtc-input-card">
          {/* Mode Tabs */}
          <div className="rtc-mode-tabs">
            <button
              type="button"
              className={`rtc-mode-tab ${inputMode === 'book' ? 'active' : ''}`}
              onClick={() => handleModeChange('book')}
              aria-pressed={inputMode === 'book'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="rtc-tab-text">Book</span>
            </button>
            <button
              type="button"
              className={`rtc-mode-tab ${inputMode === 'url' ? 'active' : ''}`}
              onClick={() => handleModeChange('url')}
              aria-pressed={inputMode === 'url'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="rtc-tab-text">URL</span>
            </button>
            <button
              type="button"
              className={`rtc-mode-tab ${inputMode === 'text' ? 'active' : ''}`}
              onClick={() => handleModeChange('text')}
              aria-pressed={inputMode === 'text'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="rtc-tab-text">Text</span>
            </button>
          </div>

          {inputMode === 'book' ? (
            <div className="rtc-field">
              <label htmlFor="book-input">Search by book</label>
              <div className="rtc-book-query-type">
                <button
                  type="button"
                  className={bookQueryType === 'title' ? 'active' : ''}
                  onClick={() => setBookQueryType('title')}
                >
                  Title
                </button>
                <button
                  type="button"
                  className={bookQueryType === 'author' ? 'active' : ''}
                  onClick={() => setBookQueryType('author')}
                >
                  Author
                </button>
                <button
                  type="button"
                  className={bookQueryType === 'isbn' ? 'active' : ''}
                  onClick={() => setBookQueryType('isbn')}
                >
                  ISBN
                </button>
              </div>
              <div className="rtc-url-wrap">
                <input
                  ref={bookInputRef}
                  id="book-input"
                  type="text"
                  className="rtc-url-input"
                  value={bookQuery}
                  onChange={(e) => setBookQuery(e.target.value)}
                  placeholder={bookQueryType === 'isbn' ? '978-0-123456-78-9' : bookQueryType === 'author' ? 'J.K. Rowling' : 'The Great Gatsby'}
                  aria-label={`Enter ${bookQueryType} to search for book`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && bookQuery.trim() && !isLoadingBook) {
                      handleFetchBook()
                    }
                  }}
                />
                <button
                  type="button"
                  className="rtc-btn rtc-btn-primary rtc-fetch-btn"
                  onClick={handleFetchBook}
                  disabled={!bookQuery.trim() || isLoadingBook}
                >
                  {isLoadingBook ? (
                    <>
                      <span className="rtc-spinner" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      Search
                    </>
                  )}
                </button>
              </div>
              {bookError && (
                <div className="rtc-url-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {bookError}
                </div>
              )}
              <div className="rtc-privacy-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Book data is fetched using AI. Results are estimates.
              </div>
            </div>
          ) : inputMode === 'url' ? (
            <div className="rtc-field">
              <label htmlFor="url-input">Enter a URL</label>
              <div className="rtc-url-wrap">
                <input
                  ref={urlInputRef}
                  id="url-input"
                  type="url"
                  className="rtc-url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  aria-label="Enter URL to fetch and calculate reading time"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && url.trim() && !isLoadingUrl) {
                      handleFetchUrl()
                    }
                  }}
                />
                <button
                  type="button"
                  className="rtc-btn rtc-btn-primary rtc-fetch-btn"
                  onClick={handleFetchUrl}
                  disabled={!url.trim() || isLoadingUrl}
                >
                  {isLoadingUrl ? (
                    <>
                      <span className="rtc-spinner" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Fetch
                    </>
                  )}
                </button>
              </div>
              {urlError && (
                <div className="rtc-url-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {urlError}
                </div>
              )}
              <div className="rtc-privacy-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Fetched content is processed on our server. URLs are not stored.
              </div>
            </div>
          ) : (
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
          )}

          {inputMode !== 'book' && (
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
                disabled={!text && !url}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* URL Title Display */}
        {urlTitle && (
          <div className="rtc-url-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Fetched: <strong>{urlTitle}</strong></span>
          </div>
        )}

        {/* Multiple Books Selection */}
        {multipleBooks && multipleBooks.length > 0 && (
          <div className="rtc-book-selection">
            <h3 className="rtc-book-selection-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Multiple books found
            </h3>
            <p className="rtc-book-selection-subtitle">Select the book you&apos;re looking for:</p>
            <div className="rtc-book-list">
              {multipleBooks.map((book, index) => (
                <button
                  key={index}
                  className="rtc-book-option"
                  onClick={() => handleSelectBook(book)}
                  type="button"
                >
                  <div className="rtc-book-option-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div className="rtc-book-option-details">
                    <span className="rtc-book-option-title">{book?.title}</span>
                    <span className="rtc-book-option-meta">
                      by {book?.author}
                      {book?.publishedYear && ` · ${book.publishedYear}`}
                      {book?.pageCount && book.pageCount > 0 && ` · ${book.pageCount} pages`}
                      {book?.genre && ` · ${book.genre}`}
                    </span>
                  </div>
                  <svg className="rtc-book-option-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Info Display */}
        {bookInfo && (
          <div className="rtc-book-info">
            <div className="rtc-book-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="rtc-book-details">
              <h3 className="rtc-book-title">{bookInfo.title}</h3>
              <p className="rtc-book-meta">
                by {bookInfo.author}
                {bookInfo.publishedYear && ` · ${bookInfo.publishedYear}`}
                {bookInfo.pageCount > 0 && ` · ${bookInfo.pageCount} pages`}
              </p>
              {bookInfo.description && (
                <p className="rtc-book-desc">{bookInfo.description}</p>
              )}
              {bookInfo.confidence === 'low' && (
                <p className="rtc-book-confidence">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Low confidence match — results may be estimates
                </p>
              )}
            </div>
          </div>
        )}

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
        {!stats && !text && !url && !bookQuery && (
          <div className="rtc-empty-state">
            <p>
              {inputMode === 'text'
                ? "Paste something above. A blog post, a speech, a long email, a chapter draft, a wall of text from someone who really discovered paragraphs late in life."
                : inputMode === 'url'
                ? "Enter a URL above to fetch the article content and calculate reading time. Works with most blogs and news sites."
                : "Search for a book by title, author, or ISBN. We'll estimate reading time based on typical word counts for that book."}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="rtc-footer" style={{ textAlign: 'center', padding: '40px 20px', fontSize: '13px', color: 'var(--ink-3)' }}>
          <p>
            A tool by <a href="https://acuriousnote.com" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>acuriousnote.com</a>
          </p>
        </footer>
      </div>

      <PaletteSwitcher />
    </main>
  )
}

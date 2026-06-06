import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { query, type } = await request.json()

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Please provide a book title, author, or ISBN' },
        { status: 400 }
      )
    }

    // Check if Gemini is configured
    if (!genAI) {
      return NextResponse.json(
        { error: 'Book lookup is temporarily unavailable. Please try text or URL mode.' },
        { status: 503 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `Find books matching "${query.trim()}" (${type}). Return JSON array of up to 3 books:
[{"title":"...","author":"...","publishedYear":1999,"pageCount":300,"wordCount":80000,"genre":"...","description":"Short 1-sentence summary","readingTimes":{"casual":320,"average":400,"careful":533,"aloud":571},"readingLevel":"Easy|Moderate|Dense","confidence":"high|medium|low"}]

Calculate: wordCount = pageCount * 275 (novels) or 350 (non-fiction). readingTimes in minutes using speeds: casual=250wpm, average=200wpm, careful=150wpm, aloud=140wpm. Keep descriptions under 100 chars. Return ONLY JSON array.`

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      }
    })

    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let books: any[] = []
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        books = JSON.parse(jsonMatch[0])
      } else {
        books = JSON.parse(text)
      }

      // If single object returned, wrap in array
      if (!Array.isArray(books)) {
        books = [books]
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text)
      return NextResponse.json(
        { error: 'Could not parse book information. Please try again or use a different query.' },
        { status: 500 }
      )
    }

    // Validate results
    if (!books.length || !books[0]?.title) {
      return NextResponse.json(
        { error: 'Could not find any books matching your query. Please try a different search.' },
        { status: 404 }
      )
    }

    // Format time helper
    const formatTime = (minutes: number): string => {
      if (minutes < 60) {
        return `${Math.round(minutes)} min`
      }
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`
    }

    // Transform books to expected format
    const transformedBooks = books.map((book: any) => ({
      title: book.title,
      author: book.author || 'Unknown Author',
      publishedYear: book.publishedYear || null,
      pageCount: book.pageCount || 0,
      wordCount: book.wordCount,
      genre: book.genre || 'Unknown',
      description: book.description || '',
      readingLevel: book.readingLevel || 'Moderate',
      confidence: book.confidence || 'medium',
    }))

    // If only one book, return it with stats (backward compatibility)
    if (transformedBooks.length === 1) {
      const book = books[0]
      return NextResponse.json({
        books: transformedBooks,
        book: transformedBooks[0],
        stats: {
          wordCount: book.wordCount,
          charCount: book.wordCount * 5,
          charCountNoSpaces: book.wordCount * 4,
          sentenceCount: Math.round(book.wordCount / 15),
          paragraphCount: Math.round(book.pageCount * 2.5),
          avgSentenceLength: 15,
          longWordPercentage: book.readingLevel === 'Dense' ? 25 : book.readingLevel === 'Easy' ? 12 : 18,
          times: book.readingTimes || {
            casual: book.wordCount / 250,
            average: book.wordCount / 200,
            careful: book.wordCount / 150,
            aloud: book.wordCount / 140,
          },
          readingLevel: {
            level: book.readingLevel || 'Moderate',
            description: book.readingLevel === 'Easy'
              ? 'Simple, clear writing that flows quickly.'
              : book.readingLevel === 'Dense'
              ? 'Complex writing that rewards careful attention.'
              : 'Comfortable reading for most audiences.',
          },
          contextNote: `${book.pageCount} pages · ${book.genre || 'General'}`,
        },
        source: 'gemini',
      })
    }

    // Multiple books - return list for user selection
    return NextResponse.json({
      books: transformedBooks,
      multipleResults: true,
      source: 'gemini',
    })

  } catch (error: any) {
    console.error('Book lookup error:', error)

    // Check for rate limit errors
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Book lookup service is temporarily busy. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to look up book. Please try again.' },
      { status: 500 }
    )
  }
}

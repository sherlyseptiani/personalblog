import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReadingTimeBot/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 502 }
      )
    }

    const contentType = response.headers.get('content-type') || ''
    const html = await response.text()

    // Extract text from HTML
    const text = extractTextFromHTML(html, url)

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract readable content from this URL' },
        { status: 422 }
      )
    }

    return NextResponse.json({
      text,
      title: extractTitle(html),
      url: url,
    })
  } catch (error) {
    console.error('Error extracting text:', error)

    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timed out. The site may be slow or unreachable.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to extract text from URL' },
      { status: 500 }
    )
  }
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  if (titleMatch) {
    return decodeHTMLEntities(titleMatch[1].trim())
  }

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
  if (ogTitleMatch) {
    return decodeHTMLEntities(ogTitleMatch[1].trim())
  }

  return null
}

function extractTextFromHTML(html: string, baseUrl: string): string {
  // Remove script and style tags with their content
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, ' ')

  // Try to find main content areas
  const contentSelectors = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class=["'][^"']*(?:content|article|post|entry|body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id=["'][^"']*(?:content|article|post|entry|main)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ]

  let content: string | null = null
  for (const selector of contentSelectors) {
    const match = text.match(selector)
    if (match && match[1] && match[1].length > 500) {
      content = match[1]
      break
    }
  }

  // If no content area found, use the body
  if (!content) {
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    content = bodyMatch ? bodyMatch[1] : text
  }

  // Remove remaining HTML tags
  content = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/\s+/g, ' ')

  // Decode HTML entities
  content = decodeHTMLEntities(content)

  // Clean up whitespace
  content = content
    .trim()
    .replace(/\s{2,}/g, ' ')

  return content
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': '‘',
    '&rsquo;': '’',
  }

  let decoded = text
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }

  // Handle numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))

  return decoded
}

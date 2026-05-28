const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;':   ' ',
  '&amp;':    '&',
  '&lt;':     '<',
  '&gt;':     '>',
  '&quot;':   '"',
  '&apos;':   "'",
  '&lsquo;':  '‘',
  '&rsquo;':  '’',
  '&ldquo;':  '“',
  '&rdquo;':  '”',
  '&mdash;':  '—',
  '&ndash;':  '–',
  '&hellip;': '…',
  '&copy;':   '©',
  '&reg;':    '®',
}

export function decodeEntities(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&[a-z]+;/gi, m => HTML_ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

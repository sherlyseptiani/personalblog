import type { Metadata } from 'next'
import { PaletteProvider } from '../tools/shared/PaletteContext'
import ReadingTimeContent from './ReadingTimeContent'

export const metadata: Metadata = {
  title: 'Reading Time Calculator — A Curious Note',
  description: 'Paste any text or enter a URL to get a calmer estimate of how long it takes to read — for casual, average, and careful readers.',
  keywords: ['reading time', 'read time calculator', 'reading speed', 'words per minute'],
  authors: [{ name: 'Sherly Septiani' }],
  creator: 'Sherly Septiani',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acuriousnote.com/reading-time-calc',
    siteName: 'A Curious Note',
    title: 'Reading Time Calculator — A Curious Note',
    description: 'Get a calmer estimate of how long it takes to read.',
    images: [
      {
        url: 'https://acuriousnote.com/og-image.png',
        alt: 'Reading Time Calculator - A Curious Note',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reading Time Calculator — A Curious Note',
    description: 'Get a calmer estimate of how long it takes to read.',
    images: ['https://acuriousnote.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://acuriousnote.com/reading-time-calc',
  },
}

export default function ReadingTimeCalcPage() {
  return (
    <PaletteProvider>
      <ReadingTimeContent />
    </PaletteProvider>
  )
}

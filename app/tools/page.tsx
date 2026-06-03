import type { Metadata } from 'next'
import ToolsClient from './ToolsClient'
import { PaletteProvider } from './shared/PaletteContext'

export const metadata: Metadata = {
  title: 'Tools — A Curious Note',
  description: 'A small, growing workshop of quietly useful tools. Built by hand, free to use, working entirely on your device.',
  keywords: ['tools', 'split bill', 'bill splitter', 'calculator', 'utilities', 'personal tools'],
  authors: [{ name: 'Sherly Septiani' }],
  creator: 'Sherly Septiani',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acuriousnote.com/tools',
    siteName: 'A Curious Note',
    title: 'Tools — A Curious Note',
    description: 'A small, growing workshop of quietly useful tools. Built by hand, free to use, working entirely on your device.',
    images: [
      {
        url: 'https://acuriousnote.com/og-image.png',
        alt: 'Tools - A Curious Note',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tools — A Curious Note',
    description: 'A small, growing workshop of quietly useful tools. Built by hand, free to use, working entirely on your device.',
    images: ['https://acuriousnote.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://acuriousnote.com/tools',
  },
}

export default function ToolsPage() {
  return (
    <PaletteProvider>
      <ToolsClient />
    </PaletteProvider>
  )
}

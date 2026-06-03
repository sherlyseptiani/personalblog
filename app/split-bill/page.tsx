import type { Metadata } from 'next'
import { PaletteProvider } from '../tools/shared/PaletteContext'
import SplitBillContent from './SplitBillContent'

export const metadata: Metadata = {
  title: 'Split Bill — A Curious Note',
  description: 'Divide shared expenses fairly, quickly, and clearly. A small tool that works entirely in your browser.',
  keywords: ['split bill', 'bill splitter', 'expense sharing', 'bill calculator'],
  authors: [{ name: 'Sherly Septiani' }],
  creator: 'Sherly Septiani',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acuriousnote.com/split-bill',
    siteName: 'A Curious Note',
    title: 'Split Bill — A Curious Note',
    description: 'Divide shared expenses fairly, quickly, and clearly.',
    images: [
      {
        url: 'https://acuriousnote.com/og-image.png',
        alt: 'Split Bill - A Curious Note',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Split Bill — A Curious Note',
    description: 'Divide shared expenses fairly, quickly, and clearly.',
    images: ['https://acuriousnote.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://acuriousnote.com/split-bill',
  },
}

export default function SplitBillPage() {
  return (
    <PaletteProvider>
      <SplitBillContent />
    </PaletteProvider>
  )
}

import type { Metadata } from 'next'
import { PaletteProvider } from '../tools/shared/PaletteContext'
import DecisionCoinContent from './DecisionCoinContent'

export const metadata: Metadata = {
  title: 'Decision Coin — A Curious Note',
  description: 'Flip a coin for difficult choices, then notice how you feel about the result.',
  keywords: ['decision coin', 'coin flip', 'decision maker', 'random choice'],
  authors: [{ name: 'Sherly Septiani' }],
  creator: 'Sherly Septiani',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acuriousnote.com/decision-coin',
    siteName: 'A Curious Note',
    title: 'Decision Coin — A Curious Note',
    description: 'Flip a coin for difficult choices, then notice how you feel about the result.',
    images: [
      {
        url: 'https://acuriousnote.com/og-image.png',
        alt: 'Decision Coin - A Curious Note',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decision Coin — A Curious Note',
    description: 'Flip a coin for difficult choices, then notice how you feel about the result.',
    images: ['https://acuriousnote.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://acuriousnote.com/decision-coin',
  },
}

export default function DecisionCoinPage() {
  return (
    <main className="wrap dc-page">
      <PaletteProvider>
        <DecisionCoinContent />
      </PaletteProvider>
    </main>
  )
}

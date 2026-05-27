import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Nav from '@/components/Nav'
import '../design/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'A Curious Note — Notes from a curious mind',
  description: 'A slow blog about the things I find fascinating — animals, history, astrophysics, science, technology, and languages. Occasionally, I leave pieces of my own experiences and perspectives here too.',
  keywords: ['blog', 'science', 'history', 'animals', 'astrophysics', 'technology', 'languages', 'personal essays'],
  authors: [{ name: 'Sherly' }],
  creator: 'Sherly',
  publisher: 'A Curious Note',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acuriousnote.com',
    siteName: 'A Curious Note',
    title: 'A Curious Note — Notes from a curious mind',
    description: 'A slow blog about the things I find fascinating — animals, history, astrophysics, science, technology, and languages.',
    images: [
      {
        url: 'https://acuriousnote.com/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'A Curious Note',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Curious Note — Notes from a curious mind',
    description: 'A slow blog about the things I find fascinating — animals, history, astrophysics, science, technology, and languages.',
    images: ['https://acuriousnote.com/opengraph-image'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://acuriousnote.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Nunito:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="ambient" aria-hidden="true"></div>
        <div className="grain" aria-hidden="true"></div>
        <Nav />
        {children}
        <Script src="/shared.js" strategy="afterInteractive" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

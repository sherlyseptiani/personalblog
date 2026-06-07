import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Nav from '@/components/Nav'
import ScrollToTop from '@/components/ScrollToTop'
import CorgiEasterEgg from '@/components/CorgiEasterEgg'
import '../design/styles.css'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://acuriousnote.com'),
  title: 'A Curious Note — Notes by Sherly Septiani',
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
    title: 'A Curious Note — Notes by Sherly Septiani',
    description: 'A slow blog about the things I find fascinating — animals, history, astrophysics, science, technology, and languages.',
    images: [{
      url: 'https://acuriousnote.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'A Curious Note — A slow blog by Sherly',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Curious Note — Notes by Sherly Septiani',
    description: 'A slow blog about the things I find fascinating — animals, history, astrophysics, science, technology, and languages.',
    images: ['https://acuriousnote.com/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        <meta name="google-adsense-account" content="ca-pub-6248246317044144" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6248246317044144" crossOrigin="anonymous"></script>
      </head>
      <body>
        <div className="ambient" aria-hidden="true"></div>
        <div className="grain" aria-hidden="true"></div>
        <Suspense fallback={<nav className="nav glass" style={{ height: '64px' }} />}>
          <Nav />
        </Suspense>
        <ScrollToTop />
        {children}
        <CorgiEasterEgg />
        <Script src="/shared.js" strategy="afterInteractive" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

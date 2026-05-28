import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Recommendations — A Curious Note',
  description: 'Things I quietly love and actually use — skincare, snacks, bags, and more.',
  keywords: ['recommendations', 'affiliate', 'products', 'skincare', 'favorites', 'shopee'],
  authors: [{ name: 'Sherly Septiani' }],
  creator: 'Sherly Septiani',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acuriousnote.com/recommendations',
    siteName: 'A Curious Note',
    title: 'Recommendations — A Curious Note',
    description: 'Things I quietly love and actually use — skincare, snacks, bags, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recommendations — A Curious Note',
    description: 'Things I quietly love and actually use — skincare, snacks, bags, and more.',
  },
  alternates: {
    canonical: 'https://acuriousnote.com/recommendations',
  },
}

const products = [
  {
    color1: '#f5b8c7',
    color2: '#d96b8a',
    name: 'La Roche Posay Cicaplast',
    desc: 'Best moisturiser, bangun pagi kulit sehat banget + plump. UDah repurchase kesekian kalinya.',
    url: 'https://s.shopee.co.id/8pixjeQ6o2',
    category: 'Skincare',
  },
  {
    color1: '#c6b5e0',
    color2: '#a07ab5',
    name: 'Celimax Retinal Shot',
    desc: 'Texture dan kulit kusam improve banget kalau pake ini. Langsung glowing',
    url: 'https://s.shopee.co.id/1gFnCZkV2J',
    category: 'Skincare',
  },
  {
    color1: '#f6c7a3',
    color2: '#c08a64',
    name: '3CE Lip Tint',
    desc: 'Lip tint yang ga bikin bibir kering, warnanya bagus + texturenya velvety.',
    url: 'https://s.shopee.co.id/BQzRr5Vxv',
    category: 'Makeup',
  },
  {
    color1: '#a7d8c5',
    color2: '#6ba39a',
    name: 'Monorow Blanc',
    desc: 'Tas kantor muat laptop, bisa buat cemplang cemplung juga bagus!',
    url: 'https://s.shopee.co.id/7VDaAnzWL5',
    category: 'Bag',
  },
  {
    color1: '#b3d0e8',
    color2: '#6f9bd1',
    name: 'Popcorn Caramel',
    desc: 'Murah + rasanya sama persis kayak popcorn XXI. Orang kantor pada doyan',
    url: 'https://s.shopee.co.id/qggEPOH15',
    category: 'Snacks',
  },
]

const categories = Array.from(new Set(products.map(p => p.category)))

export default function RecommendationsPage() {
  return (
    <main className="wrap">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="rec-hero">
        <div className="rec-hero-inner">
          <div className="rec-hero-text">
            <div className="eyebrow" style={{ marginBottom: '24px' }}>
              <span className="rec-eyebrow-dot"></span>
              <span> My honest picks</span>
            </div>
            <h1 className="rec-hero-h1">
              Things I actually <em>use.</em>
            </h1>
            <p className="rec-hero-sub">
              A small collection of products I love enough to share.
              Each one has earned its place in my routine — no fluff, just favorites.
            </p>
            <div className="rec-cats">
              {categories.map(cat => (
                <span key={cat} className="rec-cat-chip">{cat}</span>
              ))}
            </div>
          </div>

          <div className="rec-hero-swatches" aria-hidden="true">
            {products.map((p, i) => (
              <div
                key={i}
                className="rec-swatch-dot"
                style={{ background: p.color1, '--i': i } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        <div className="rec-hero-rule" aria-hidden="true" />
      </section>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <section className="rec-section">
        <div className="rec-grid">
          {products.map((item, idx) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rec-card glass"
              style={{
                '--ra': item.color1,
                '--rb': item.color2,
                '--delay': `${idx * 60}ms`,
              } as React.CSSProperties}
            >
              <div className="rec-card-accent" aria-hidden="true" />
              <div className="rec-card-body">
                <div className="rec-card-meta">
                  <span className="rec-card-category">{item.category}</span>
                  <svg className="rec-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </div>
                <h3 className="rec-card-title">{item.name}</h3>
                <p className="rec-card-desc">{item.desc}</p>
                <span className="rec-card-cta">
                  View on Shopee
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="rec-disclosure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
          </svg>
          Affiliate links — I may earn a small commission if you purchase. I only recommend things I genuinely use and love.
        </p>
      </section>

      <Footer sourcePage="recommendations" />
    </main>
  )
}

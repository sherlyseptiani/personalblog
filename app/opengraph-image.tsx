import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'A Curious Note — Notes from a curious mind'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BLOBS = [
  { top: -130, left: -130, w: 580, h: 520, color: '#f5b8c7', opacity: 0.82 },
  { top: -110, right: -130, w: 540, h: 480, color: '#c6b5e0', opacity: 0.78 },
  { bottom: -130, left: -90, w: 520, h: 470, color: '#f6c7a3', opacity: 0.72 },
  { bottom: -110, right: -90, w: 520, h: 460, color: '#a7d8c5', opacity: 0.72 },
  { top: 105, left: 360, w: 480, h: 420, color: '#b3d0e8', opacity: 0.58 },
]

const DOTS = ['#f5b8c7','#d96b8a','#c6b5e0','#a07ab5','#b3d0e8','#6f9bd1','#a7d8c5','#6ba39a','#f6c7a3']

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: '#f9f8f6',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Coloured blobs */}
        {BLOBS.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top:    b.top    ?? undefined,
              left:   b.left   ?? undefined,
              right:  b.right  ?? undefined,
              bottom: b.bottom ?? undefined,
              width:  b.w,
              height: b.h,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${b.color} 0%, ${b.color}00 68%)`,
              opacity: b.opacity,
            }}
          />
        ))}

        {/* Frosted overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(249,248,246,0.40)', display: 'flex' }} />

        {/* Dot grid — top-left */}
        <div style={{ position: 'absolute', top: 56, left: 56, display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.22 }}>
          {[0,1,2].map(r => (
            <div key={r} style={{ display: 'flex', gap: 10 }}>
              {[0,1,2].map(c => <div key={c} style={{ width: 4, height: 4, borderRadius: '50%', background: '#6b8fa8' }} />)}
            </div>
          ))}
        </div>

        {/* Dot grid — bottom-right */}
        <div style={{ position: 'absolute', bottom: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.22 }}>
          {[0,1,2].map(r => (
            <div key={r} style={{ display: 'flex', gap: 10 }}>
              {[0,1,2].map(c => <div key={c} style={{ width: 4, height: 4, borderRadius: '50%', background: '#6b8fa8' }} />)}
            </div>
          ))}
        </div>

        {/* Main content — centered column */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Brand mark */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #f5b8c7 0%, #c6b5e0 50%, #b3d0e8 100%)',
              marginBottom: 22,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              padding: 10,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.32)', display: 'flex' }} />
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 400,
              color: '#1c1410',
              letterSpacing: '-2px',
              marginBottom: 10,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            }}
          >
            A Curious Note
          </div>

          {/* Mono eyebrow */}
          <div
            style={{
              fontSize: 13,
              color: '#567C94',
              letterSpacing: '4px',
              fontFamily: 'monospace',
              marginBottom: 22,
            }}
          >
            A SLOW BLOG BY SHERLY
          </div>

          {/* Rainbow dot row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            {DOTS.map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            ))}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 21,
              color: '#4e3d30',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            Animals · History · Astrophysics · Science · Languages
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            fontSize: 13,
            color: '#9a8878',
            letterSpacing: '1.5px',
            fontFamily: 'monospace',
          }}
        >
          acuriousnote.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

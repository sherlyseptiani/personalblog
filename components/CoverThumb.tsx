'use client'
import { useState, useRef, useEffect } from 'react'
import { artSvg, deriveArt } from '@/lib/categories'
import type { CoverArt, Category } from '@/lib/types'

function ThumbSkeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      className="thumb-skeleton"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        background: 'linear-gradient(90deg, rgba(var(--video-r), var(--video-g), var(--video-b), 0.15) 25%, rgba(var(--video-r), var(--video-g), var(--video-b), 0.35) 50%, rgba(var(--video-r), var(--video-g), var(--video-b), 0.15) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.2s infinite',
        ...style,
      }}
    />
  )
}

type Props = {
  thumbnail: string | null
  coverArt: CoverArt | null
  slug: string
  category: Category
  priority?: boolean
}

export default function CoverThumb({ thumbnail, coverArt, slug, category, priority = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current?.complete) {
      setImgLoaded(true)
    }
  }, [])

  const derived = deriveArt(slug, category)
  const art = {
    kind:  coverArt?.kind  ?? derived.kind,
    p1:    coverArt?.p1    ?? derived.p1,
    p2:    coverArt?.p2    ?? derived.p2,
    thumb: coverArt?.thumb ?? derived.thumb,
  }

  const imageUrl = coverArt?.svg_url ?? coverArt?.image_url ?? thumbnail
  const hasThumbnail = imageUrl && !imgFailed

  return (
    <div className={`thumb ${art.thumb}`}>
      {hasThumbnail ? (
        <>
          {!priority && !imgLoaded && <ThumbSkeleton />}
          <img
            ref={imgRef}
            src={imageUrl}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            style={{
              opacity: priority || imgLoaded ? 1 : 0,
              transition: priority ? 'none' : 'opacity 0.3s ease',
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
          />
        </>
      ) : (
        <div
          className="ph"
          style={{ '--p1': art.p1, '--p2': art.p2 } as React.CSSProperties}
        >
          <div dangerouslySetInnerHTML={{ __html: artSvg(art.kind ?? 'orb') }} />
          <div className="ph-overlay" />
        </div>
      )}
    </div>
  )
}

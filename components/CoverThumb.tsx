'use client'
import { useState } from 'react'
import { artSvg, deriveArt } from '@/lib/categories'
import type { CoverArt, Category } from '@/lib/types'

type Props = {
  thumbnail: string | null
  coverArt: CoverArt | null
  slug: string
  category: Category
}

export default function CoverThumb({ thumbnail, coverArt, slug, category }: Props) {
  const [imgFailed, setImgFailed] = useState(false)

  // Merge field-by-field: explicit cover_art values win, derived fills any gaps.
  // This handles null, {} and partially-filled cover_art objects uniformly.
  const derived = deriveArt(slug, category)
  const art = {
    kind:  coverArt?.kind  ?? derived.kind,
    p1:    coverArt?.p1    ?? derived.p1,
    p2:    coverArt?.p2    ?? derived.p2,
    thumb: coverArt?.thumb ?? derived.thumb,
  }

  return (
    <div className={`thumb ${art.thumb}`}>
      {thumbnail && !imgFailed ? (
        <img
          src={thumbnail}
          alt=""
          style={{ filter: 'saturate(60%) brightness(85%) contrast(105%)' }}
          onError={() => setImgFailed(true)}
        />
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

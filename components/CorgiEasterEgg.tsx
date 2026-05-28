'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import corgiData from '../public/corgi.json'

export default function CorgiEasterEgg() {
  const [visible, setVisible] = useState(false)

  const toggle = () => {
    setVisible(v => {
      const next = !v
      if ((window as any).showToast) {
        (window as any).showToast(next ? '🐕 Corgi mode! Tap to dismiss.' : 'Bye bye corgi!')
      }
      return next
    })
  }

  useEffect(() => {
    // Keyboard trigger: type "corgi"
    let buf = ''
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase()
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      buf = (buf + e.key).toLowerCase().slice(-5)
      if (buf.endsWith('corgi')) { toggle(); buf = '' }
    }
    window.addEventListener('keydown', onKey)

    // Mobile trigger: custom event dispatched by the nav brand tap sequence
    const onTrigger = () => toggle()
    window.addEventListener('corgi-trigger', onTrigger)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('corgi-trigger', onTrigger)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="cg-stage" onClick={() => setVisible(false)} title="Click to dismiss">
      <div className="cg-travel">
        <div className="cg-flip">
          <div className="cg-bob">
            <Lottie
              animationData={corgiData}
              loop
              autoplay
              style={{ width: 120, height: 120 }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  )
}

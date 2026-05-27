'use client'

import { useEffect, useState } from 'react'

export default function VideoColorSync() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isInitialized) return

    function rgbToHex(r: number, g: number, b: number) {
      return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
    }

    function initVideoColorSync() {
      const video = document.getElementById('heroVideo') as HTMLVideoElement | null
      const swatch = document.getElementById('videoSwatch') as HTMLSpanElement | null
      const hexEl = document.getElementById('videoHex') as HTMLSpanElement | null

      if (!video || !(window as any).bindVideoColorSync) return false

      ;(window as any).bindVideoColorSync(video, {
        onColor: (r: number, g: number, b: number) => {
          if (swatch) swatch.style.background = `rgb(${r},${g},${b})`
          if (hexEl) hexEl.textContent = rgbToHex(r, g, b)
        },
      })

      video.play().catch(() => {})
      return true
    }

    // Try immediately
    if (initVideoColorSync()) {
      setIsInitialized(true)
      return
    }

    // Retry until both video and bindVideoColorSync are ready
    const checkInterval = setInterval(() => {
      if (initVideoColorSync()) {
        setIsInitialized(true)
        clearInterval(checkInterval)
      }
    }, 100)

    // Give up after 5 seconds
    setTimeout(() => clearInterval(checkInterval), 5000)

    return () => clearInterval(checkInterval)
  }, [isInitialized])

  return null
}

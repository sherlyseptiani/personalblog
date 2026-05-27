export function spawnGlitter(x: number, y: number) {
  const style = getComputedStyle(document.documentElement)
  const r = style.getPropertyValue('--video-r').trim() || '86'
  const g = style.getPropertyValue('--video-g').trim() || '124'
  const b = style.getPropertyValue('--video-b').trim() || '148'

  const palette = [
    `rgba(${r},${g},${b},1)`,
    `rgba(${r},${g},${b},0.7)`,
    'rgba(255,255,255,0.9)',
    'rgba(245,184,199,0.9)',
    'rgba(167,216,197,0.9)',
    'rgba(246,199,163,0.9)',
  ]

  const count = 14
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.2
    const dist = 36 + Math.random() * 52
    const size = 2.5 + Math.random() * 5
    const dur = 480 + Math.random() * 360
    const isSquare = Math.random() > 0.55

    el.style.cssText = `
      position:fixed;left:${x}px;top:${y}px;
      width:${size}px;height:${size}px;
      background:${palette[Math.floor(Math.random() * palette.length)]};
      border-radius:${isSquare ? '2px' : '50%'};
      pointer-events:none;z-index:9999;
      transform:translate(-50%,-50%) rotate(${Math.random() * 45}deg);
      animation:glitter-fly ${dur}ms ease-out forwards;
      --dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), dur + 50)
  }
}

'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

const W = 640
const H = 160
const GROUND = H - 20
const CW = 24
const CH = 24
const CX = 80
const GRAVITY = 0.55
const JUMP_V = -12.5
const SPEED_BASE = 5.2
const SPEED_ACC = 0.0009

const COLORS = ['#7c8db5','#c08a64','#6ba39a','#a07ab5','#6f9bd1','#f5b8c7','#a7d8c5','#f6c7a3']

interface Obs { x: number; h: number; color: string }
interface Particle { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }
type GS = 'idle' | 'running' | 'dead'

export default function NotFoundGame() {
  const cvs = useRef<HTMLCanvasElement>(null)
  const gsRef = useRef<GS>('idle')
  const cyRef = useRef(GROUND - CH)
  const cvyRef = useRef(0)
  const groundedRef = useRef(true)
  const obsRef = useRef<Obs[]>([])
  const partsRef = useRef<Particle[]>([])
  const speedRef = useRef(SPEED_BASE)
  const frameRef = useRef(0)
  const rafRef = useRef<number>()
  const rawScoreRef = useRef(0)

  const [uiGS, setUiGS] = useState<GS>('idle')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)

  const spawnParticles = (x: number, y: number) => {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14
      const s = 2 + Math.random() * 4
      partsRef.current.push({
        x, y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s - 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
        maxLife: 25 + Math.random() * 20,
      })
    }
  }

  const reset = useCallback((start: boolean) => {
    cyRef.current = GROUND - CH
    cvyRef.current = 0
    groundedRef.current = true
    obsRef.current = []
    partsRef.current = []
    speedRef.current = SPEED_BASE
    frameRef.current = 0
    rawScoreRef.current = 0
    gsRef.current = start ? 'running' : 'idle'
    setScore(0)
    setUiGS(start ? 'running' : 'idle')
  }, [])

  const act = useCallback(() => {
    const s = gsRef.current
    if (s === 'idle') { gsRef.current = 'running'; setUiGS('running') }
    else if (s === 'running' && groundedRef.current) { cvyRef.current = JUMP_V; groundedRef.current = false }
    else if (s === 'dead') reset(true)
  }, [reset])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); act() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [act])

  useEffect(() => {
    const canvas = cvs.current!
    const ctx = canvas.getContext('2d')!

    const makeGrad = (x: number, y: number) => {
      const g = ctx.createLinearGradient(x, y, x + CW, y + CH)
      g.addColorStop(0,    'rgba(245,184,199,0.95)')
      g.addColorStop(0.25, 'rgba(198,181,224,0.95)')
      g.addColorStop(0.5,  'rgba(179,208,232,0.95)')
      g.addColorStop(0.75, 'rgba(167,216,197,0.95)')
      g.addColorStop(1,    'rgba(246,199,163,0.95)')
      return g
    }

    const drawChar = (dead: boolean) => {
      const x = CX
      const y = cyRef.current
      const squish = !groundedRef.current && cvyRef.current < 0 ? 1.18 : 1
      const drawH = CH * squish
      const drawW = CW / squish
      const drawX = x + (CW - drawW) / 2
      const drawY = y - (squish - 1) * CH * 0.5

      ctx.save()
      ctx.beginPath()
      ctx.roundRect(drawX, drawY, drawW, drawH, 6)
      ctx.fillStyle = makeGrad(x, y)
      if (!dead) { ctx.shadowColor = 'rgba(179,208,232,0.7)'; ctx.shadowBlur = 12 }
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      ctx.save()
      if (dead) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'
        ctx.lineWidth = 1.8; ctx.lineCap = 'round'
        ;([[x+6,drawY+8,x+10,drawY+12],[x+14,drawY+8,x+18,drawY+12]] as [number,number,number,number][]).forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
          ctx.moveTo(x2,y1); ctx.lineTo(x1,y2); ctx.stroke()
        })
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.beginPath()
        ctx.ellipse(x+8, drawY+9, 3, 3.5, 0, 0, Math.PI*2)
        ctx.ellipse(x+16, drawY+9, 3, 3.5, 0, 0, Math.PI*2)
        ctx.fill()
        ctx.fillStyle = '#0a0f1a'
        ctx.beginPath()
        ctx.arc(x+8.5, drawY+9.5, 1.5, 0, Math.PI*2)
        ctx.arc(x+16.5, drawY+9.5, 1.5, 0, Math.PI*2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.beginPath()
        ctx.arc(x+9.5, drawY+8, 0.8, 0, Math.PI*2)
        ctx.arc(x+17.5, drawY+8, 0.8, 0, Math.PI*2)
        ctx.fill()
      }
      ctx.restore()

      if (groundedRef.current && !dead) {
        const t = frameRef.current * 0.28
        ctx.save()
        ctx.strokeStyle = makeGrad(x, y)
        ctx.lineWidth = 3; ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x+7, y+CH); ctx.lineTo(x+7, y+CH+4+Math.sin(t)*3)
        ctx.moveTo(x+17, y+CH); ctx.lineTo(x+17, y+CH+4+Math.sin(t+Math.PI)*3)
        ctx.stroke()
        ctx.restore()
      }
    }

    const drawObs = (o: Obs) => {
      const oy = GROUND - o.h
      const g = ctx.createLinearGradient(o.x, oy, o.x, GROUND)
      g.addColorStop(0, o.color + 'ff')
      g.addColorStop(1, o.color + '55')
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(o.x, oy, 20, o.h, [5,5,0,0])
      ctx.fillStyle = g
      ctx.shadowColor = o.color
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = o.color + '99'
      ctx.lineWidth = 1; ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = `bold ${o.h > 30 ? 13 : 9}px "Geist Mono",monospace`
      ctx.textAlign = 'center'
      ctx.fillText('?', o.x + 10, oy + o.h * 0.65)
      ctx.restore()
    }

    const drawGround = () => {
      const g = ctx.createLinearGradient(0, 0, W, 0)
      g.addColorStop(0,    'rgba(167,216,197,0)')
      g.addColorStop(0.15, 'rgba(167,216,197,0.45)')
      g.addColorStop(0.85, 'rgba(179,208,232,0.45)')
      g.addColorStop(1,    'rgba(179,208,232,0)')
      ctx.save()
      ctx.strokeStyle = g
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke()
      ctx.restore()
    }

    const drawParticles = () => {
      partsRef.current = partsRef.current.filter(p => p.life > 0)
      for (const p of partsRef.current) {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.life--
        const a = p.life / p.maxLife
        ctx.save()
        ctx.globalAlpha = a
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color; ctx.shadowBlur = 4
        ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI*2); ctx.fill()
        ctx.restore()
      }
    }

    const drawHint = (text: string) => {
      ctx.save()
      ctx.fillStyle = 'rgba(179,208,232,0.45)'
      ctx.font = '11px "Geist Mono",monospace'
      ctx.textAlign = 'center'
      ctx.fillText(text, W / 2, GROUND - 6)
      ctx.restore()
    }

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      const state = gsRef.current

      if (state === 'running') {
        frameRef.current++
        speedRef.current += SPEED_ACC

        cvyRef.current += GRAVITY
        cyRef.current += cvyRef.current
        if (cyRef.current >= GROUND - CH) {
          cyRef.current = GROUND - CH; cvyRef.current = 0; groundedRef.current = true
        }

        const last = obsRef.current.at(-1)
        const minGap = Math.max(140, 260 - frameRef.current * 0.04)
        if (!last || last.x < W - minGap) {
          if (Math.random() < 0.02) {
            obsRef.current.push({
              x: W + 10,
              h: 20 + Math.random() * 44,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
            })
          }
        }

        obsRef.current = obsRef.current.map(o => ({ ...o, x: o.x - speedRef.current })).filter(o => o.x > -30)

        rawScoreRef.current++
        if (frameRef.current % 6 === 0) setScore(Math.floor(rawScoreRef.current / 6))

        for (const o of obsRef.current) {
          if (CX+5 < o.x+18 && CX+CW-5 > o.x+2 && cyRef.current+5 < GROUND && cyRef.current+CH > GROUND - o.h) {
            gsRef.current = 'dead'
            setUiGS('dead')
            setBest(b => Math.max(b, Math.floor(rawScoreRef.current / 6)))
            spawnParticles(CX + CW/2, cyRef.current + CH/2)
            break
          }
        }
      }

      drawGround()
      obsRef.current.forEach(drawObs)
      drawChar(state === 'dead')
      drawParticles()

      if (state === 'idle') drawHint('SPACE  ·  ↑  ·  tap  to  start')
      if (state === 'dead') drawHint('SPACE  ·  ↑  ·  tap  to  try again')

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="nf-game">
      <div className="nf-game-bar">
        <span className="nf-game-score">{score.toString().padStart(5, '0')}</span>
        {best > 0 && <span className="nf-game-best">best&nbsp;{best.toString().padStart(5, '0')}</span>}
      </div>
      <canvas
        ref={cvs}
        width={W}
        height={H}
        className="nf-canvas"
        onClick={act}
        onTouchStart={e => { e.preventDefault(); act() }}
      />
    </div>
  )
}

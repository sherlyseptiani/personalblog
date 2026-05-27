import type { Category, CoverArt } from './types'

const ART_KINDS = ['orb','pages','lines','wave','glass','spines','grid','topo','tools','room','leaves','mesh','objects'] as const

// Lighter accent paired with each category's base color
const CAT_P2: Record<Category, string> = {
  essay:         '#a8b8d0',
  craft:         '#d4a574',
  field:         '#4a9990',
  reading:       '#b89ac8',
  systems:       '#2d8fa6',
  science:       '#2d8fa6',
  language:      '#d4a574',
  perspective:   '#a8b8d0',
  book:          '#b89ac8',
  personal:      '#4a9990',
  environment:   '#5aab9a',
  animal:        '#4a8fc4',
  others:        '#8a9db5',
  uncategorized: '#8a9db5',
}

// Polynomial hash — safe within JS integer range (h stays < 100003 * 31 + 126 at all times)
function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 100003
  return h
}

export function deriveArt(slug: string, category: Category): CoverArt {
  const hash = hashSlug(slug)
  return {
    kind:  ART_KINDS[hash % ART_KINDS.length],
    p1:    CATEGORIES[category]?.color ?? '#1f2a3a',
    p2:    CAT_P2[category]            ?? '#4f6b85',
    thumb: 'square',
  }
}

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  // Original categories
  essay:        { label: 'Essay',        color: '#7c8db5' },
  craft:        { label: 'Craft',        color: '#c08a64' },
  field:        { label: 'Field note',   color: '#6ba39a' },
  reading:      { label: 'Reading',      color: '#a07ab5' },
  systems:      { label: 'Systems',      color: '#3f7a8c' },
  // Blogger categories
  science:      { label: 'Science',      color: '#3f7a8c' },
  language:     { label: 'Language',     color: '#c08a64' },
  perspective:  { label: 'Perspective',  color: '#7c8db5' },
  book:         { label: 'Book',         color: '#a07ab5' },
  personal:     { label: 'Personal',     color: '#6ba39a' },
  environment:  { label: 'Environment',  color: '#6ba39a' },
  animal:       { label: 'Animal',       color: '#6f9bd1' },
  others:       { label: 'Others',       color: '#7c8db5' },
  uncategorized:{ label: 'Uncategorized',color: '#7c8db5' },
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function artSvg(kind: string): string {
  switch (kind) {
    case 'orb':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        <defs><radialGradient id="g1" cx="35%" cy="30%"><stop offset="0%" stop-color="#fff" stop-opacity="0.8"/><stop offset="60%" stop-color="#fff" stop-opacity="0.05"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
        <circle cx="100" cy="140" r="78" fill="url(#g1)"/>
        <circle cx="100" cy="140" r="78" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>
        <circle cx="100" cy="140" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>
        <circle cx="100" cy="140" r="20" fill="rgba(255,255,255,0.15)"/>
      </svg>`
    case 'pages':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <g transform="translate(40,30) rotate(-6)"><rect width="80" height="100" fill="rgba(255,255,255,0.12)" rx="2"/><line x1="10" y1="20" x2="70" y2="20" stroke="rgba(255,255,255,0.3)" stroke-width="1"/><line x1="10" y1="30" x2="62" y2="30" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/><line x1="10" y1="40" x2="68" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/><line x1="10" y1="50" x2="54" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/></g>
        <g transform="translate(80,40) rotate(4)"><rect width="80" height="100" fill="rgba(255,255,255,0.2)" rx="2"/><line x1="10" y1="20" x2="70" y2="20" stroke="rgba(255,255,255,0.4)" stroke-width="1"/><line x1="10" y1="30" x2="58" y2="30" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/><line x1="10" y1="40" x2="66" y2="40" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/><line x1="10" y1="50" x2="60" y2="50" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/><line x1="10" y1="60" x2="50" y2="60" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/></g>
      </svg>`
    case 'lines':
      return `<svg class="ph-art" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:18}).map((_,i)=>`<line x1="${10+i*10}" y1="20" x2="${10+i*10}" y2="180" stroke="rgba(255,255,255,${0.1+(i%3)*0.08})" stroke-width="1"/>`).join('')}
        <circle cx="100" cy="100" r="46" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      </svg>`
    case 'wave':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:14}).map((_,i)=>`<path d="M -10 ${60+i*16} Q 50 ${40+i*16}, 100 ${60+i*16} T 210 ${60+i*16}" fill="none" stroke="rgba(255,255,255,${0.08+i*0.015})" stroke-width="0.8"/>`).join('')}
      </svg>`
    case 'glass':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <rect x="40" y="30" width="120" height="90" rx="14" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
        <rect x="40" y="30" width="120" height="38" rx="14" fill="rgba(255,255,255,0.3)"/>
        <circle cx="60" cy="50" r="3" fill="rgba(255,255,255,0.6)"/>
        <circle cx="72" cy="50" r="3" fill="rgba(255,255,255,0.4)"/>
        <circle cx="84" cy="50" r="3" fill="rgba(255,255,255,0.3)"/>
        <line x1="55" y1="86" x2="145" y2="86" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
        <line x1="55" y1="98" x2="125" y2="98" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
      </svg>`
    case 'spines':
      return `<svg class="ph-art" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        ${[15,40,68,90,114,140,168].map((x,i)=>`<rect x="${x}" y="${30+(i%2)*8}" width="${18+(i%3)*4}" height="${140-(i%2)*10}" fill="rgba(255,255,255,${0.15+(i%4)*0.07})" rx="1"/>`).join('')}
        <line x1="10" y1="172" x2="190" y2="172" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      </svg>`
    case 'grid':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="p1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/></pattern></defs>
        <rect width="200" height="250" fill="url(#p1)"/>
        <rect x="40" y="60" width="120" height="60" fill="rgba(255,255,255,0.18)" rx="6"/>
        <rect x="40" y="130" width="80" height="60" fill="rgba(255,255,255,0.28)" rx="6"/>
        <rect x="130" y="130" width="30" height="60" fill="rgba(255,255,255,0.12)" rx="6"/>
      </svg>`
    case 'topo':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:9}).map((_,i)=>`<ellipse cx="${110-i*5}" cy="${80+i*2}" rx="${50+i*10}" ry="${24+i*5}" fill="none" stroke="rgba(255,255,255,${0.25-i*0.02})" stroke-width="0.8"/>`).join('')}
      </svg>`
    case 'tools':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <rect x="30" y="60" width="60" height="8" rx="4" fill="rgba(255,255,255,0.35)"/>
        <rect x="40" y="40" width="40" height="8" rx="4" fill="rgba(255,255,255,0.25)"/>
        <circle cx="140" cy="60" r="22" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <line x1="155" y1="75" x2="180" y2="100" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
        <rect x="30" y="90" width="80" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
        <rect x="30" y="105" width="60" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
      </svg>`
    case 'room':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        <rect x="20" y="40" width="160" height="120" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <rect x="50" y="80" width="40" height="60" fill="rgba(255,255,255,0.18)"/>
        <rect x="110" y="100" width="50" height="40" fill="rgba(255,255,255,0.25)"/>
        <line x1="20" y1="160" x2="180" y2="160" stroke="rgba(255,255,255,0.3)"/>
        <circle cx="160" cy="60" r="14" fill="rgba(255,255,255,0.4)"/>
      </svg>`
    case 'leaves':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:8}).map((_,i)=>{
          const x=30+i*22, y=60+(i%3)*20
          return `<ellipse cx="${x}" cy="${y}" rx="14" ry="22" fill="rgba(255,255,255,${0.15+(i%3)*0.08})" transform="rotate(${i*23} ${x} ${y})"/>`
        }).join('')}
      </svg>`
    case 'mesh':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:6}).map((_,r)=>Array.from({length:8}).map((_,c)=>`<circle cx="${20+c*22}" cy="${20+r*22}" r="2" fill="rgba(255,255,255,${0.4-Math.abs(r-2.5)*0.06})"/>`).join('')).join('')}
        ${Array.from({length:6}).map((_,r)=>Array.from({length:7}).map((_,c)=>`<line x1="${20+c*22}" y1="${20+r*22}" x2="${42+c*22}" y2="${20+r*22}" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>`).join('')).join('')}
      </svg>`
    case 'objects':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <rect x="20" y="80" width="60" height="40" fill="rgba(255,255,255,0.22)" rx="3"/>
        <circle cx="120" cy="100" r="22" fill="rgba(255,255,255,0.28)"/>
        <rect x="150" y="70" width="36" height="50" fill="rgba(255,255,255,0.18)" rx="4"/>
        <line x1="10" y1="125" x2="190" y2="125" stroke="rgba(255,255,255,0.4)"/>
      </svg>`
    default:
      return `<svg class="ph-art" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"><circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.2)"/></svg>`
  }
}

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { extras } from '../data'
import { createDraggable, animate, stagger } from 'animejs'

/* Scrapbook layer: handwritten notes, star stickers and a wall of draggable polaroids. */

export function Note({ children, arrow = 'down-left', className = '', style }) {
  const paths = {
    'down-left': 'M70 6 C 60 30, 40 44, 10 48 M10 48 l10 -10 M10 48 l13 4',
    'down-right': 'M6 6 C 16 30, 36 44, 66 48 M66 48 l-10 -10 M66 48 l-13 4',
    left: 'M74 26 C 54 14, 30 14, 6 26 M6 26 l12 -8 M6 26 l12 6',
    right: 'M4 26 C 24 14, 48 14, 72 26 M72 26 l-12 -8 M72 26 l-12 6',
    up: 'M30 54 C 18 40, 22 20, 38 6 M38 6 l-12 2 M38 6 l0 12',
  }
  return (
    <span className={`note ${className}`} style={style} aria-hidden="true">
      <span className="note-txt">{children}</span>
      <svg className={`note-arrow a-${arrow}`} viewBox="0 0 80 58"><path d={paths[arrow]} /></svg>
    </span>
  )
}

export function Star({ className = '', color = '#e4fb7a', style }) {
  return (
    <svg className={`star ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 4 C 54 34, 66 46, 96 50 C 66 54, 54 66, 50 96 C 46 66, 34 54, 4 50 C 34 46, 46 34, 50 4 Z" fill={color} stroke="#0f4539" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------- snapshot illustrations (drawn, not photos) ---------- */
const MONO = 'JetBrains Mono, monospace'
const DISP = 'Bricolage Grotesque, sans-serif'
const Art = {
  hackathon: (
    <svg viewBox="0 0 240 200">
      <defs>
        <linearGradient id="qa-h-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1940" /><stop offset="1" stopColor="#2f2a62" /></linearGradient>
        <linearGradient id="qa-h-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4b4185" /><stop offset="1" stopColor="#2a2452" /></linearGradient>
        <radialGradient id="qa-h-glow" cx="0.5" cy="0.62" r="0.55"><stop offset="0" stopColor="#8fd3ff" stopOpacity="0.38" /><stop offset="1" stopColor="#8fd3ff" stopOpacity="0" /></radialGradient>
        <linearGradient id="qa-h-scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#13211d" /><stop offset="1" stopColor="#0b1411" /></linearGradient>
      </defs>
      <rect width="240" height="200" fill="url(#qa-h-bg)" />
      {/* window with moon */}
      <g transform="translate(156 16)">
        <rect width="68" height="60" rx="4" fill="#211e4c" stroke="#45407f" strokeWidth="3" />
        <circle cx="44" cy="22" r="11" fill="#fff3d6" /><circle cx="50" cy="18" r="10" fill="#211e4c" />
        {[[12, 14], [24, 34], [16, 48], [56, 46], [34, 10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 1 : 1.5} fill="#fff" opacity="0.85" />)}
        <path d="M34 0 V60 M0 30 H68" stroke="#45407f" strokeWidth="2" />
      </g>
      {/* sticky notes */}
      <g fontFamily={MONO} fontSize="5.5" fill="#23292c">
        <g transform="translate(18 22) rotate(-6)"><rect width="30" height="26" rx="1.5" fill="#e4fb7a" /><text x="4" y="11">MVP</text><text x="4" y="19">by 9am</text></g>
        <g transform="translate(54 18) rotate(4)"><rect width="30" height="26" rx="1.5" fill="#f3b48b" /><text x="4" y="11">fix</text><text x="4" y="19">auth</text></g>
        <g transform="translate(92 26) rotate(-3)"><rect width="30" height="26" rx="1.5" fill="#bcd6ec" /><text x="4" y="11">demo</text><text x="4" y="19">flow ✓</text></g>
      </g>
      <rect width="240" height="200" fill="url(#qa-h-glow)" />
      {/* desk */}
      <rect y="146" width="240" height="54" fill="url(#qa-h-desk)" />
      <rect y="146" width="240" height="2" fill="#6a5fb0" opacity="0.7" />
      {/* laptop: code */}
      <g transform="translate(24 92)">
        <rect width="86" height="54" rx="4" fill="#c9ccd3" />
        <rect x="4" y="4" width="78" height="44" rx="1.5" fill="url(#qa-h-scr)" />
        <text x="9" y="16" fill="#e4fb7a" fontFamily={MONO} fontSize="6.5">$ npm run dev</text>
        <text x="9" y="27" fill="#8fd3ff" fontFamily={MONO} fontSize="6.5">✓ ready in 312ms</text>
        {[0, 1, 2].map((k) => <rect key={k} x={9 + (k % 2) * 6} y={33 + k * 4.5} width={[44, 30, 52][k]} height="2.4" rx="1.2" fill={['#f3b48b', '#9aa4a8', '#bcd6ec'][k]} opacity="0.7" />)}
        <path d="M-6 54 H92 L86 60 H0 Z" fill="#aeb1b8" />
      </g>
      {/* laptop: UI */}
      <g transform="translate(130 92)">
        <rect width="86" height="54" rx="4" fill="#c9ccd3" />
        <rect x="4" y="4" width="78" height="44" rx="1.5" fill="#fbf7f0" />
        <rect x="9" y="9" width="26" height="5" rx="2.5" fill="#0f4539" />
        <rect x="9" y="19" width="42" height="17" rx="3" fill="#f3b48b" />
        <rect x="55" y="19" width="22" height="17" rx="3" fill="#e4fb7a" />
        <rect x="9" y="40" width="68" height="3" rx="1.5" fill="#e6e0d6" />
        <path d="M-6 54 H92 L86 60 H0 Z" fill="#aeb1b8" />
      </g>
      {/* can + clock chip */}
      <g transform="translate(116 124)"><rect width="11" height="22" rx="2.5" fill="#e4fb7a" /><rect y="5" width="11" height="4" fill="#0f4539" /></g>
      <g transform="translate(16 172)">
        <rect width="62" height="18" rx="9" fill="#0f0d26" opacity="0.65" />
        <circle cx="10" cy="9" r="3" fill="#ff7b72" />
        <text x="17" y="12.5" fill="#e4fb7a" fontFamily={MONO} fontSize="8">03:12 AM</text>
      </g>
    </svg>
  ),
  talk: (
    <svg viewBox="0 0 240 200">
      <defs>
        <linearGradient id="qa-t-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7e3d1" /><stop offset="1" stopColor="#efcfb4" /></linearGradient>
        <linearGradient id="qa-t-spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff8e8" stopOpacity="0.85" /><stop offset="1" stopColor="#fff8e8" stopOpacity="0" /></linearGradient>
        <linearGradient id="qa-t-stage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c98f62" /><stop offset="1" stopColor="#a8714a" /></linearGradient>
      </defs>
      <rect width="240" height="200" fill="url(#qa-t-bg)" />
      {/* slide */}
      <g transform="translate(34 16)">
        <rect x="2" y="4" width="172" height="96" rx="6" fill="#d9b08c" opacity="0.5" />
        <rect width="172" height="96" rx="6" fill="#fff" />
        <rect width="172" height="16" rx="6" fill="#0f4539" /><rect y="10" width="172" height="6" fill="#0f4539" />
        <circle cx="10" cy="8" r="2.2" fill="#e4fb7a" />
        <text x="14" y="40" fill="#23292c" fontFamily={DISP} fontWeight="700" fontSize="15" letterSpacing="-0.4">Career + Tech</text>
        <rect x="14" y="48" width="74" height="4" rx="2" fill="#e6e0d6" /><rect x="14" y="57" width="54" height="4" rx="2" fill="#e6e0d6" />
        {[22, 34, 46, 62].map((h, k) => <rect key={k} x={110 + k * 13} y={84 - h} width="9" height={h} rx="2" fill={k === 3 ? '#0f4539' : '#cfe0d6'} />)}
        <path d="M108 84 H164" stroke="#e6e0d6" />
        <text x="14" y="84" fill="#7b867e" fontFamily={MONO} fontSize="6">ALUMNI TALK</text>
      </g>
      {/* spotlight */}
      <path d="M118 0 L84 172 H152 Z" fill="url(#qa-t-spot)" />
      {/* stage + speaker */}
      <rect y="150" width="240" height="50" fill="url(#qa-t-stage)" />
      <g transform="translate(118 112)">
        <circle cx="0" cy="0" r="8" fill="#23292c" />
        <path d="M-12 30 C -12 14, -8 10, 0 10 C 8 10, 12 14, 12 30 Z" fill="#0f4539" />
        <path d="M8 16 L18 6" stroke="#23292c" strokeWidth="3" strokeLinecap="round" />
        <rect x="-16" y="26" width="32" height="26" rx="3" fill="#5a3b26" />
        <rect x="-16" y="26" width="32" height="5" rx="2" fill="#7a5235" />
      </g>
      {/* audience */}
      {[[18, '#0f4539'], [52, '#d9734a'], [86, '#3b5a8a'], [154, '#e4fb7a'], [188, '#0f4539'], [222, '#f3b48b']].map(([x, c], i) => (
        <g key={i} transform={`translate(${x} 182)`}><circle cy="-6" r="9" fill="#2b1d14" opacity="0.9" /><path d="M-15 18 C -15 6, -9 2, 0 2 C 9 2, 15 6, 15 18 Z" fill={c} /></g>
      ))}
    </svg>
  ),
  gym: (
    <svg viewBox="0 0 240 200">
      <defs>
        <linearGradient id="qa-g-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24302c" /><stop offset="1" stopColor="#1a2320" /></linearGradient>
        <linearGradient id="qa-g-ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff3d6" stopOpacity="0.32" /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" /></linearGradient>
        <linearGradient id="qa-g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f3a36" /><stop offset="1" stopColor="#141a18" /></linearGradient>
        <linearGradient id="qa-g-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef0f2" /><stop offset="1" stopColor="#9aa0a6" /></linearGradient>
      </defs>
      <rect width="240" height="200" fill="url(#qa-g-bg)" />
      {/* window + light rays */}
      <g transform="translate(150 14)"><rect width="74" height="46" rx="3" fill="#ffe6b8" /><path d="M37 0 V46 M0 23 H74" stroke="#24302c" strokeWidth="3" /></g>
      <path d="M150 60 L224 60 L150 200 L40 200 Z" fill="url(#qa-g-ray)" />
      {/* wall sign */}
      <g transform="translate(16 18)">
        <rect width="108" height="40" rx="5" fill="#e4fb7a" />
        <text x="10" y="18" fill="#0f4539" fontFamily={MONO} fontSize="7" letterSpacing="1">TODAY</text>
        <text x="10" y="33" fill="#0f4539" fontFamily={DISP} fontWeight="800" fontSize="15" letterSpacing="-0.4">LEG DAY</text>
        <path d="M84 12 l6 8 l-6 8 M92 12 l6 8 l-6 8" stroke="#0f4539" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* floor */}
      <rect y="150" width="240" height="50" fill="url(#qa-g-floor)" />
      <path d="M0 150 H240" stroke="#3f4c47" strokeWidth="1.5" />
      {/* squat rack */}
      <g fill="#3c4844">
        <rect x="40" y="70" width="7" height="82" rx="1.5" /><rect x="192" y="70" width="7" height="82" rx="1.5" />
        <rect x="36" y="146" width="15" height="6" rx="1.5" /><rect x="188" y="146" width="15" height="6" rx="1.5" />
      </g>
      <g fill="#566560"><rect x="47" y="94" width="8" height="4" /><rect x="184" y="94" width="8" height="4" /></g>
      {/* barbell with bumper plates */}
      <rect x="14" y="91" width="212" height="5" rx="2.5" fill="url(#qa-g-bar)" />
      {[[22, '#d9734a', 24], [32, '#0f4539', 30], [200, '#0f4539', 30], [212, '#d9734a', 24]].map(([x, c, h], i) => (
        <g key={i}><rect x={x - 4} y={93.5 - h} width="9" height={h * 2} rx="2" fill={c} /><rect x={x - 4} y={93.5 - h} width="2.2" height={h * 2} rx="1" fill="#fff" opacity="0.16" /></g>
      ))}
      <rect x="10" y="90" width="6" height="7" rx="1.5" fill="#c9ccd3" /><rect x="224" y="90" width="6" height="7" rx="1.5" fill="#c9ccd3" />
      {/* dumbbells + shaker */}
      {[44, 96].map((x) => <g key={x} transform={`translate(${x} 172)`}><rect x="-2" y="-2" width="24" height="4" rx="2" fill="#9aa0a6" /><rect x="-6" y="-8" width="7" height="16" rx="2" fill="#0f4539" /><rect x="19" y="-8" width="7" height="16" rx="2" fill="#0f4539" /></g>)}
      <g transform="translate(150 152)"><path d="M0 4 H18 L16 30 H2 Z" fill="#e4fb7a" opacity="0.9" /><rect x="-1" y="0" width="20" height="6" rx="2" fill="#23292c" /></g>
      {/* PR chip */}
      <g transform="translate(176 166)">
        <rect width="52" height="20" rx="10" fill="#e4fb7a" />
        <text x="26" y="13.5" textAnchor="middle" fill="#0f4539" fontFamily={MONO} fontWeight="700" fontSize="8">NEW PR</text>
      </g>
    </svg>
  ),
  debug: (
    <svg viewBox="0 0 240 200">
      <defs>
        <linearGradient id="qa-d-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1a2522" /><stop offset="1" stopColor="#0f1715" /></linearGradient>
      </defs>
      <rect width="240" height="200" fill="url(#qa-d-bg)" />
      <rect width="240" height="18" fill="#0b1110" />
      {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => <circle key={c} cx={12 + i * 11} cy="9" r="3.2" fill={c} />)}
      <rect x="54" y="4" width="70" height="14" rx="3" fill="#1a2522" />
      <text x="62" y="13.5" fill="#9aa4a8" fontFamily={MONO} fontSize="6.5">Checkout.jsx</text>
      {/* error line highlight */}
      <rect y="30" width="240" height="13" fill="#ff7b72" opacity="0.12" />
      <rect y="30" width="2.5" height="13" fill="#ff7b72" />
      {[['41', '✗ TypeError: total undefined', '#ff7b72'], ['42', 'const sum = order.total', '#f4e3c4'], ['43', '', ''], ['44', 'console.log(order)', '#8fd3ff'], ['45', '{ total: undefined }', '#9aa4a8'], ['46', 'order.total ?? calc(order)', '#e4fb7a']].map(([n, t, c], i) => (
        <g key={n} fontFamily={MONO} fontSize="8">
          <text x="10" y={40 + i * 17} fill="#4b5753">{n}</text>
          <text x="30" y={40 + i * 17} fill={c}>{t}</text>
        </g>
      ))}
      {/* terminal */}
      <g transform="translate(10 140)">
        <rect width="220" height="48" rx="6" fill="#0b1110" stroke="#24302c" />
        <text x="10" y="17" fill="#9aa4a8" fontFamily={MONO} fontSize="7.5">$ npm test</text>
        <text x="10" y="33" fill="#3fcf6e" fontFamily={MONO} fontSize="8.5" fontWeight="700">✓ 24 passed</text>
        <text x="74" y="33" fill="#4b5753" fontFamily={MONO} fontSize="7.5">0 failed · 1.8s</text>
        <circle cx="198" cy="24" r="14" fill="#e4fb7a" />
        <path d="M191 24 l5 5 l9 -10" stroke="#0f4539" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="230" y="13" textAnchor="end" fill="#e4fb7a" fontFamily={MONO} fontSize="7">02:15</text>
    </svg>
  ),
  evenings: (
    <svg viewBox="0 0 240 200">
      <defs>
        <linearGradient id="qa-e-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b4d86" /><stop offset="0.45" stopColor="#f19a8e" /><stop offset="0.72" stopColor="#ffd59c" /></linearGradient>
        <linearGradient id="qa-e-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d6aa8" /><stop offset="1" stopColor="#3b3570" /></linearGradient>
        <radialGradient id="qa-e-sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.55" stopColor="#ffe2a8" /><stop offset="1" stopColor="#ffe2a8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="240" height="200" fill="url(#qa-e-sky)" />
      <circle cx="150" cy="112" r="40" fill="url(#qa-e-sun)" />
      <circle cx="150" cy="112" r="20" fill="#fff3d6" />
      {/* birds */}
      <g stroke="#3b3570" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M58 46 q5 -5 10 0 q5 -5 10 0" /><path d="M84 34 q4 -4 8 0 q4 -4 8 0" /><path d="M70 60 q3 -3 6 0 q3 -3 6 0" />
      </g>
      {/* skyline */}
      <g fill="#3b3570">
        {[[0, 54, 18], [16, 74, 14], [32, 46, 20], [54, 86, 12], [68, 60, 18], [190, 66, 16], [204, 92, 12], [218, 58, 22]].map(([x, h, w], i) => <rect key={i} x={x} y={128 - h} width={w} height={h} />)}
      </g>
      <g fill="#ffd59c" opacity="0.8">
        {[[20, 70], [24, 82], [36, 96], [58, 60], [58, 76], [72, 84], [194, 80], [208, 52], [208, 66], [222, 88]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="3" />)}
      </g>
      {/* sea + reflection */}
      <rect y="128" width="240" height="72" fill="url(#qa-e-sea)" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={136 - i * 5} y={134 + i * 9} width={28 + i * 10} height="2.5" rx="1.25" fill="#ffd59c" opacity={0.75 - i * 0.12} />)}
      {/* promenade with street lights */}
      <path d="M0 182 Q 120 156 240 170 L240 200 L0 200 Z" fill="#2a2452" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 8 + i * 23, y = 180 - Math.sin((i / 10) * Math.PI) * 14 - i * 0.6
        return <circle key={i} cx={x} cy={y} r="2.2" fill="#ffe2a8" />
      })}
    </svg>
  ),
  ship: (
    <svg viewBox="0 0 240 200">
      <defs>
        <linearGradient id="qa-s-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef6d8" /><stop offset="1" stopColor="#d6e8b4" /></linearGradient>
        <linearGradient id="qa-s-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b0" /><stop offset="0.5" stopColor="#ffb84b" /><stop offset="1" stopColor="#d9734a" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="240" height="200" fill="url(#qa-s-bg)" />
      {/* confetti */}
      {[[30, 34, '#d9734a', 20], [204, 30, '#0f4539', -30], [196, 96, '#3b82f6', 40], [36, 104, '#0f4539', -10], [70, 20, '#3b82f6', 60], [170, 54, '#d9734a', -50]].map(([x, y, c, r], i) => (
        <rect key={i} x={x} y={y} width="8" height="3.5" rx="1" fill={c} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {/* smoke */}
      <g fill="#fff">{[[96, 134, 14], [116, 140, 18], [140, 134, 14], [84, 144, 10], [154, 144, 10]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
      {/* laptop */}
      <rect x="56" y="140" width="128" height="40" rx="5" fill="#c9ccd3" />
      <rect x="62" y="145" width="116" height="30" rx="1.5" fill="#0f4539" />
      <text x="70" y="157" fill="#e4fb7a" fontFamily={MONO} fontSize="7">$ git push origin main</text>
      <text x="70" y="168" fill="#bcd6ec" fontFamily={MONO} fontSize="7">✓ deployed · v2.4.0</text>
      <path d="M40 180 H200 L192 188 H48 Z" fill="#aeb1b8" />
      {/* rocket */}
      <g transform="translate(120 70) rotate(14)">
        <path d="M-8 30 Q 0 66 8 30 Z" fill="url(#qa-s-flame)" />
        <path d="M0 -46 C 18 -30, 18 12, 11 26 L -11 26 C -18 12, -18 -30, 0 -46 Z" fill="#fff" stroke="#0f4539" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -46 C 8 -39, 12 -32, 14 -24 H -14 C -12 -32, -8 -39, 0 -46 Z" fill="#d9734a" />
        <circle cy="-6" r="7.5" fill="#bcd6ec" stroke="#0f4539" strokeWidth="3" />
        <circle cx="-2.5" cy="-8.5" r="2" fill="#fff" />
        <path d="M-11 10 L-24 30 L-11 26 Z M11 10 L24 30 L11 26 Z" fill="#0f4539" />
      </g>
      <g transform="translate(18 18)"><rect width="56" height="18" rx="9" fill="#0f4539" /><text x="28" y="12.5" textAnchor="middle" fill="#e4fb7a" fontFamily={MONO} fontSize="7.5" fontWeight="700">LIVE ✓</text></g>
    </svg>
  ),
}

// The back of each print: a quest-log entry. Facts come from data.js (extras) and the photos
// themselves; the lighter lines are personality, easy to edit.
const QUESTS = [
  // two staggered rows across the whole board; no card hides another's caption
  { art: 'hackathon', cap: 'hackathon nights', tag: 'led 2 teams', x: 4, y: 7, r: -5,
    title: 'Hackathon team lead ×2', story: 'Led cross-functional teams through two hackathons. We shipped 3 product features and lifted engagement by about 20%.',
    xp: ['Leadership', 'Shipping under pressure'], proof: extras[1]?.url },
  { art: 'talk', cap: 'back at my college', tag: 'alumni talk', x: 37, y: 4, r: 3,
    title: 'Alumni speaker', story: 'Went back to Pravin Patil College to share career and technical insights. Student project success went up 20%.',
    xp: ['Mentoring', 'Public speaking'], proof: extras[0]?.url },
  { art: 'gym', cap: 'leg day.jpg', tag: 'never skipped', x: 70, y: 9, r: -2.5,
    title: 'Gym before git', story: 'Lifting is my reset button. Same rule as code: show up, add a little weight, track the progress.',
    xp: ['+10 discipline', 'Consistency'] },
  { art: 'evenings', cap: 'mumbai evenings', tag: 'commute view', x: 15, y: 53, r: 2.5,
    title: 'Reset the brain', story: 'The commute view that clears my head between problems. Half my best fixes show up on the way home.',
    xp: ['Perspective', 'Patience'] },
  { art: 'ship', cap: 'ship it!', tag: 'every sprint', x: 47, y: 56, r: -4,
    title: 'Ship it', story: 'Small, frequent releases over big-bang launches. Every sprint ends with something real in front of users.',
    xp: ['Delivery', 'Iteration'] },
  { art: 'debug', cap: 'bug found at 2am', tag: 'fixed by 2:15', x: 77, y: 51, r: 5,
    title: 'The 2am TypeError', story: 'An undefined total in checkout. Traced it, fixed it, 24 tests green, and still in bed by 2:30.',
    xp: ['Debugging', 'Calm under fire'] },
]

function QuestBack({ q, i }) {
  return (
    <div className="pol-face pol-back">
      <div className="qb-top"><span className="mono">Quest {String(i + 1).padStart(2, '0')}</span><span className="qb-stamp">Quest<br />complete</span></div>
      <h4 className="qb-title">{q.title}</h4>
      <p className="qb-story">{q.story}</p>
      <div className="qb-xp">{q.xp.map((x) => <span key={x}>+ {x}</span>)}</div>
      {q.proof && <a className="qb-proof" href={q.proof} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} data-cursor="Open certificate">View certificate <FiArrowUpRight /></a>}
    </div>
  )
}

export function SideQuests() {
  const wall = useRef(null)
  const [flipped, setFlipped] = useState(() => new Set())
  const [seen, setSeen] = useState(() => new Set())
  const [toast, setToast] = useState(false)
  const toastShown = useRef(false)

  const flip = useCallback((i) => {
    setFlipped((f) => { const n = new Set(f); n.has(i) ? n.delete(i) : n.add(i); return n })
    setSeen((sn) => {
      if (sn.has(i)) return sn
      const n = new Set(sn); n.add(i)
      if (n.size === QUESTS.length && !toastShown.current) { toastShown.current = true; setTimeout(() => setToast(true), 650) }
      return n
    })
  }, [])

  useEffect(() => {
    const el = wall.current
    const fine = matchMedia('(pointer: fine)').matches && innerWidth > 860
    const cards = [...el.querySelectorAll('.polaroid')]
    // tumble in like photos dropped on a table, then the film develops
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('developed'); return }
      animate(cards, { opacity: [0, 1], translateY: [-120, 0], scale: [1.15, 1], duration: 900, delay: stagger(110), ease: 'outBack(1.4)' })
      setTimeout(() => el.classList.add('developed'), 500)
    }, { rootMargin: '-20% 0px' })
    io.observe(el)

    // a press that barely moves is a click (flip); anything more is a drag
    const down = new Map()
    const onDown = (ev) => { const c = ev.target.closest('.polaroid'); if (c) down.set(c, [ev.clientX, ev.clientY, performance.now()]) }
    const onUp = (ev) => {
      const c = ev.target.closest('.polaroid'); const d = c && down.get(c)
      if (!d || ev.target.closest('a')) return
      down.delete(c)
      if (Math.hypot(ev.clientX - d[0], ev.clientY - d[1]) < 6 && performance.now() - d[2] < 450) flip(Number(c.dataset.i))
    }
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointerup', onUp)

    let drags = []
    if (fine) {
      let z = 10
      drags = cards.map((c) => createDraggable(c, {
        container: el,
        releaseStiffness: 90,
        releaseDamping: 12,
        onGrab: () => { c.style.zIndex = ++z; c.classList.add('lifted') },
        onRelease: () => c.classList.remove('lifted'),
      }))
    }
    return () => { io.disconnect(); drags.forEach((d) => d.revert()); el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointerup', onUp) }
  }, [flip])

  const onKey = (e, i) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(i) } }

  return (
    <section className="sec quests" id="quests">
      <div className="quests-head">
        <div className="shead">
          <div className="shead-rule" data-aos="fade"><span className="mono">05</span><i /><span className="mono">Side quests · off the clock</span></div>
          <h2 data-aos="blur-up" data-aos-delay="60">Late nights, <em>leg days</em><br />& side quests.</h2>
        </div>
        <Star className="spin q-star" />
        <Note arrow="down-right" className="q-note">flip them! every photo has a story</Note>
      </div>
      <div className="wall" ref={wall}>
        <div className="quest-log" aria-live="polite">
          <span className="mono">Quest log</span>
          <b>{seen.size}<small>/{QUESTS.length}</small></b>
          <span className="ql-pips">{QUESTS.map((_, i) => <i key={i} className={seen.has(i) ? 'on' : ''} />)}</span>
        </div>
        {QUESTS.map((q, i) => (
          <figure key={q.cap} data-i={i} className={`polaroid ${flipped.has(i) ? 'flipped' : ''}`} style={{ left: `${q.x}%`, top: `${q.y}%`, '--r': `${q.r}deg` }}
            role="button" tabIndex={0} aria-pressed={flipped.has(i)} aria-label={`${q.cap}: ${flipped.has(i) ? 'showing story' : 'flip to read the story'}`}
            onKeyDown={(e) => onKey(e, i)} data-cursor={flipped.has(i) ? 'Flip back' : 'Flip · or drag'}>
            <span className="tape" />
            <div className="pol-inner">
              <div className="pol-face pol-front">
                <div className="pol-art" style={{ '--dev-delay': `${i * 0.35}s` }}>{Art[q.art]}<i className="pol-sheen" /><i className="pol-film" /></div>
                <figcaption><span className="hand">{q.cap}</span><span className="mono">{q.tag}</span></figcaption>
              </div>
              <QuestBack q={q} i={i} />
            </div>
          </figure>
        ))}
        <AnimatePresence>
          {toast && (
            <motion.div className="quest-toast" role="status" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
              <span className="qt-badge" aria-hidden="true">🏆</span>
              <span className="qt-txt"><b>Achievement unlocked: Explorer</b><small>You read every side quest. Ready for a real one?</small></span>
              <a href="#contact" data-go="#contact" className="btn btn-lime qt-cta" onClick={() => setToast(false)}>Start a quest <FiArrowUpRight /></a>
              <button type="button" className="qt-x" aria-label="Dismiss" onClick={() => setToast(false)}>×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

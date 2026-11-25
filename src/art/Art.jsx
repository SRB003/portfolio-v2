import { useEffect, useRef } from 'react'
import skylineImg from '../assets/skyline.webp'
import WINDOWS from '../assets/skyline-windows.json'
// Hand-built SVG illustrations. No external images, scale to any size.

// Laptop screen position inside the 1200x700 desk viewBox; the work panel grows out of it.
export const SCREEN = { x: 430, y: 236, w: 340, h: 212.5 }
export const DESK_W = 1200
export const DESK_H = 700

export function Desk() {
  return (
    <svg viewBox={`0 0 ${DESK_W} ${DESK_H}`} className="desk" aria-hidden="true">
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a77c" />
          <stop offset="1" stopColor="#c48a5f" />
        </linearGradient>
        <linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#353b3f" />
          <stop offset="1" stopColor="#24292c" />
        </linearGradient>
        <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7e2da" />
          <stop offset="1" stopColor="#c9c3b9" />
        </linearGradient>
        <radialGradient id="lampGlow" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* desk */}
      <ellipse cx="600" cy="690" rx="560" ry="22" fill="#8a5a3b" opacity="0.18" />
      <rect x="40" y="520" width="1120" height="34" rx="10" fill="url(#wood)" />
      <rect x="40" y="546" width="1120" height="16" rx="6" fill="#a8714b" />
      <rect x="110" y="560" width="26" height="140" fill="#a8714b" />
      <rect x="1064" y="560" width="26" height="140" fill="#a8714b" />

      {/* lamp */}
      <path d="M1040 520 L1060 520 L1056 510 L1044 510 Z" fill="#0f4539" />
      <path d="M1050 512 L1000 380 L900 330" stroke="#0f4539" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="1000" cy="380" r="9" fill="#0f4539" />
      <path d="M870 300 q40 -24 70 18 l-24 22 q-30 -30 -46 -40z" fill="#0f4539" />
      <path d="M880 338 L760 520 L1010 520 Z" fill="url(#lampGlow)" className="lamp-light" />

      {/* plant */}
      <g className="sway">
        <path d="M950 440 C 930 380, 890 370, 870 350 C 910 352, 945 380, 955 430" fill="#3f8f5f" />
        <path d="M960 440 C 965 370, 1000 340, 1030 320 C 1015 360, 990 400, 968 440" fill="#2f7a4f" />
        <path d="M955 440 C 945 360, 960 320, 955 280 C 980 320, 975 380, 962 440" fill="#4ea36d" />
        <path d="M948 444 C 905 420, 880 430, 860 420 C 890 400, 930 410, 952 436" fill="#2f7a4f" />
      </g>
      <path d="M915 440 L1000 440 L990 520 L925 520 Z" fill="#d9734a" />
      <rect x="908" y="432" width="99" height="16" rx="5" fill="#e88a62" />

      {/* mug with steam */}
      <g className="steam" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M245 400 q -12 -20 0 -40 q 12 -20 0 -40" />
        <path d="M270 405 q -12 -20 0 -40 q 12 -20 0 -40" />
      </g>
      <rect x="225" y="420" width="70" height="100" rx="12" fill="#0f4539" />
      <path d="M295 445 q 34 0 34 26 q 0 26 -34 26" stroke="#0f4539" strokeWidth="12" fill="none" />
      <text x="260" y="482" fill="#e8ff8a" fontFamily="JetBrains Mono, monospace" fontSize="22" textAnchor="middle">{'{}'}</text>

      {/* notebook + pencil */}
      <g transform="translate(120 498) skewX(-20)">
        <rect width="120" height="22" rx="4" fill="#e8ff8a" />
        <rect y="6" width="120" height="4" fill="#0f4539" opacity="0.2" />
      </g>
      <rect x="108" y="486" width="110" height="8" rx="4" fill="#f2b84b" transform="rotate(-6 160 490)" />

      {/* laptop */}
      <rect x="410" y="218" width="380" height="250" rx="16" fill="url(#bezel)" />
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="4" fill="#fbf7f0" />
      <circle cx="600" cy="227" r="3" fill="#555" />
      <path d="M360 470 L840 470 L872 508 Q 874 520 860 520 L340 520 Q 326 520 328 508 Z" fill="url(#base)" />
      <rect x="560" y="470" width="80" height="8" rx="4" fill="#b8b1a6" />
      {/* sticky note */}
      <g transform="rotate(6 770 250)">
        <rect x="740" y="224" width="74" height="64" rx="4" fill="#e8ff8a" />
        <text x="777" y="252" fontFamily="Caveat, Instrument Serif, serif" fontStyle="italic" fontSize="17" textAnchor="middle" fill="#0f4539">ship it</text>
        <path d="M762 266 l8 8 l16 -16" stroke="#0f4539" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* phone */}
      <rect x="720" y="508" width="92" height="12" rx="5" fill="#2b3236" transform="skewX(-30) translate(300 0)" />
    </svg>
  )
}

export function SkyArt() {
  return (
    <svg className="sky-art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.35" stopColor="#ffe3a3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <circle cx="1220" cy="250" r="260" fill="url(#sun)" />
      <circle cx="1220" cy="250" r="62" fill="#fff8e6" />
      {[
        [180, 220, 1], [620, 140, 0.8], [1000, 380, 1.15], [1400, 520, 0.9], [300, 560, 1.3],
      ].map(([x, y, s], i) => (
        <g key={i} className={`cloud c${i}`} transform={`translate(${x} ${y}) scale(${s})`} filter="url(#soft)">
          <ellipse cx="0" cy="0" rx="120" ry="38" fill="#fff" opacity="0.85" />
          <ellipse cx="-50" cy="-22" rx="60" ry="40" fill="#fff" opacity="0.85" />
          <ellipse cx="40" cy="-30" rx="70" ry="48" fill="#fff" opacity="0.85" />
        </g>
      ))}
      {/* distant birds */}
      <g stroke="#2b3236" strokeWidth="2.4" fill="none" opacity="0.35" strokeLinecap="round">
        <path d="M820 300 q 10 -10 20 0 q 10 -10 20 0" />
        <path d="M870 270 q 7 -7 14 0 q 7 -7 14 0" />
      </g>
    </svg>
  )
}

/* ---------- project banners ---------- */
// Each banner is a small product scene, drawn on an 800×360 canvas and cropped to fit the card
// (slice). Keep key content inside x 120–680 so it survives the narrowest crop.
const F = { d: 'Bricolage Grotesque, sans-serif', s: 'Inter Tight, sans-serif', m: 'JetBrains Mono, monospace', h: 'Homemade Apple, cursive' }
const Shadow = ({ id, o = 0.18 }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="160%">
    <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#3c2814" floodOpacity={o} />
  </filter>
)

function Aertrip() {
  return (
    <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="at-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a9dbe8" /><stop offset="1" stopColor="#e6f5f2" /></linearGradient>
        <linearGradient id="at-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1fa6a8" /><stop offset="1" stopColor="#5fd0c0" /></linearGradient>
        <linearGradient id="at-btn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#14a39a" /><stop offset="1" stopColor="#1fc29a" /></linearGradient>
        <radialGradient id="at-sun"><stop offset="0" stopColor="#fff6d6" /><stop offset="1" stopColor="#fff6d6" stopOpacity="0" /></radialGradient>
        <Shadow id="at-sh" />
      </defs>
      <rect width="800" height="360" fill="url(#at-sky)" />
      <circle cx="610" cy="66" r="90" fill="url(#at-sun)" />
      <circle cx="610" cy="66" r="26" fill="#fffaf0" />
      <g fill="#fff" opacity="0.8">
        <ellipse cx="170" cy="58" rx="54" ry="14" /><ellipse cx="196" cy="48" rx="30" ry="16" />
        <ellipse cx="470" cy="40" rx="40" ry="10" /><ellipse cx="488" cy="33" rx="22" ry="11" />
      </g>
      {/* sea + beach */}
      <path d="M0 214 H800 V290 H0 Z" fill="url(#at-sea)" />
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.45">
        <path d="M60 232 h40 M300 246 h60 M520 230 h44 M660 252 h50 M180 262 h36" />
      </g>
      <path d="M0 282 Q 400 250 800 276 V360 H0 Z" fill="#f2e2c2" />
      <path d="M0 296 Q 400 266 800 292" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" fill="none" />
      {/* palms at both edges */}
      <g fill="#1d6b52">
        <path d="M748 300 C 742 240, 736 200, 716 160" stroke="#7b5a3a" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M716 160 C 680 140, 650 150, 630 176 C 664 160, 690 160, 716 166 Z" />
        <path d="M716 160 C 712 126, 690 108, 662 104 C 686 124, 700 142, 712 164 Z" />
        <path d="M716 160 C 744 132, 774 128, 800 140 C 770 146, 746 154, 720 168 Z" />
        <path d="M716 160 C 740 170, 760 190, 768 220 C 750 200, 732 186, 714 170 Z" />
        <path d="M52 306 C 58 260, 66 230, 84 200" stroke="#7b5a3a" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M84 200 C 110 186, 134 190, 150 208 C 124 198, 104 200, 86 206 Z" />
        <path d="M84 200 C 70 176, 46 170, 22 178 C 46 184, 64 192, 82 206 Z" />
        <path d="M84 200 C 92 178, 110 166, 132 166 C 114 176, 100 188, 88 204 Z" />
      </g>
      {/* flight path */}
      <path d="M150 120 Q 260 40 380 70" stroke="#0f4539" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="1 8" strokeLinecap="round" fill="none" />
      <g transform="translate(386 68) rotate(12) scale(0.7)" fill="#fff">
        <path d="M-46 0 L40 -6 Q 58 0 40 6 Z" /><path d="M-4 -4 L-26 -40 L-14 -40 L14 -4 Z M-4 4 L-26 40 L-14 40 L14 4 Z" /><path d="M-44 -2 L-56 -20 L-48 -20 L-34 -2 Z" />
      </g>
      {/* headline */}
      <text x="400" y="112" textAnchor="middle" fontFamily={F.d} fontWeight="700" fontSize="27" fill="#14353a" letterSpacing="-0.8">
        Your <tspan fontFamily={F.h} fontWeight="400" fontSize="22" fill="#5aa832">beach</tspan> escape awaits.
      </text>
      {/* search widget: the booking flow */}
      <g filter="url(#at-sh)">
        <rect x="150" y="130" width="500" height="72" rx="14" fill="#fff" />
      </g>
      {[['From', 'Mumbai', 'BOM'], ['To', 'Maldives', 'Malé'], ['Depart', '12 Dec', 'Fri'], ['Guests', '2 Adults', '1 Room']].map(([k, v, s], i) => (
        <g key={k} transform={`translate(${170 + i * 122} 150)`}>
          {i > 0 && <path d="M-14 -6 V44" stroke="#e7ece9" />}
          <text fontFamily={F.m} fontSize="8.5" fill="#8a9a98" letterSpacing="0.8">{k.toUpperCase()}</text>
          <text y="20" fontFamily={F.s} fontWeight="600" fontSize="15" fill="#1d2a2c">{v}</text>
          <text y="34" fontFamily={F.s} fontSize="9.5" fill="#94a3a1">{s}</text>
        </g>
      ))}
      <g filter="url(#at-sh)">
        <rect x="336" y="188" width="128" height="32" rx="16" fill="url(#at-btn)" />
      </g>
      <circle cx="362" cy="203" r="5" stroke="#fff" strokeWidth="2" fill="none" /><path d="M366 207 l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <text x="410" y="208" textAnchor="middle" fontFamily={F.s} fontWeight="700" fontSize="12" fill="#fff" letterSpacing="1">SEARCH</text>
      {/* payment confirmed toast */}
      <g transform="translate(128 248) rotate(-3)" className="bn-float">
        <g filter="url(#at-sh)"><rect width="196" height="54" rx="12" fill="#fff" /></g>
        <circle cx="27" cy="27" r="14" fill="#e3f6ee" /><path d="M20 27 l5 5 l9 -10" stroke="#1a9c6b" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="24" fontFamily={F.s} fontWeight="600" fontSize="12.5" fill="#1d2a2c">Payment confirmed</text>
        <text x="50" y="39" fontFamily={F.m} fontSize="8.5" fill="#8a9a98">UPI · ₹48,250 · just now</text>
      </g>
      {/* package card */}
      <g transform="translate(486 234) rotate(3)" className="bn-float d2">
        <g filter="url(#at-sh)"><rect width="196" height="84" rx="12" fill="#fff" /></g>
        <clipPath id="at-th"><rect x="8" y="8" width="62" height="68" rx="8" /></clipPath>
        <g clipPath="url(#at-th)">
          <rect x="8" y="8" width="62" height="68" fill="#a9dbe8" /><rect x="8" y="44" width="62" height="20" fill="#2bb4ad" /><rect x="8" y="62" width="62" height="14" fill="#f2e2c2" />
          <circle cx="52" cy="26" r="7" fill="#fff6d6" />
        </g>
        <text x="80" y="24" fontFamily={F.s} fontWeight="600" fontSize="12.5" fill="#1d2a2c">Maldives escape</text>
        <text x="80" y="38" fontFamily={F.s} fontSize="9.5" fill="#8a9a98">5N / 6D · Beach resort</text>
        <text x="80" y="64" fontFamily={F.d} fontWeight="700" fontSize="15" fill="#13968e">₹48,250</text>
        <rect x="146" y="52" width="40" height="18" rx="9" fill="#0f4539" />
        <text x="166" y="64.5" textAnchor="middle" fontFamily={F.s} fontWeight="600" fontSize="9" fill="#e8ff8a">Book</text>
      </g>
    </svg>
  )
}

function MadeAgain() {
  const G = '#17602c'
  return (
    <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ma-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7f8f4" /><stop offset="1" stopColor="#e9eee3" /></linearGradient>
        <linearGradient id="ma-kraft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d3a46c" /><stop offset="1" stopColor="#b98a55" /></linearGradient>
        <Shadow id="ma-sh" o={0.16} />
      </defs>
      <rect width="800" height="360" fill="url(#ma-bg)" />
      {/* crumpled-paper creases */}
      <g stroke="#fff" strokeWidth="2" fill="none" opacity="0.9">
        <path d="M0 80 L120 120 L210 60 L330 140 L460 90 L560 160 L700 100 L800 150" />
        <path d="M0 260 L140 220 L260 300 L400 240 L520 310 L660 250 L800 300" />
        <path d="M240 0 L280 120 L250 230 L300 360" />
        <path d="M600 0 L560 110 L620 220 L590 360" />
      </g>
      <g stroke="#d9e0d2" strokeWidth="1" fill="none" opacity="0.6">
        <path d="M0 84 L120 124 L210 64 L330 144 L460 94 L560 164 L700 104 L800 154" />
        <path d="M0 264 L140 224 L260 304 L400 244 L520 314 L660 254 L800 304" />
      </g>
      {/* kicker + headline: CMS-driven hero */}
      <g transform="translate(128 52)">
        <rect width="186" height="22" rx="11" fill="#fff" stroke="#dfe6d8" />
        <circle cx="14" cy="11" r="3.5" fill="#2e9a49" />
        <text x="24" y="14.5" fontFamily={F.s} fontWeight="600" fontSize="8" fill={G} letterSpacing="1">STUDENT-LED CIRCULAR ECONOMY</text>
      </g>
      <g fontFamily={F.d} fontWeight="700" fontSize="30" fill={G} letterSpacing="-1.2">
        <text x="126" y="116">Nothing wasted.</text>
        <text x="126" y="150">Everything <tspan fill="#2e9a49">valued.</tspan></text>
        <text x="126" y="184">The loop closed.</text>
      </g>
      <path d="M262 157 C 290 162, 330 160, 360 154" stroke="#2e9a49" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g transform="translate(128 204)">
        <rect width="168" height="34" rx="17" fill={G} />
        <circle cx="17" cy="17" r="12" fill="#2e9a49" />
        <path d="M12 17 h9 m-4 -4 l4 4 l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="38" y="21" fontFamily={F.s} fontWeight="600" fontSize="11" fill="#fff">Close the loop with us</text>
      </g>
      {/* live pledge feed */}
      <g transform="translate(128 258)" className="bn-float">
        <g filter="url(#ma-sh)"><rect width="200" height="58" rx="12" fill="#fff" /></g>
        <rect width="200" height="3" rx="1.5" fill="#2e9a49" />
        <circle cx="14" cy="16" r="3" fill="#2e9a49" />
        <text x="22" y="19" fontFamily={F.s} fontWeight="600" fontSize="7.5" fill={G} letterSpacing="1">LIVE</text>
        <text x="186" y="19" textAnchor="end" fontFamily={F.s} fontSize="7.5" fill="#6b7a6e" letterSpacing="0.8">12 PLEDGES</text>
        <circle cx="24" cy="38" r="12" fill={G} />
        <text x="24" y="41.5" textAnchor="middle" fontFamily={F.s} fontWeight="600" fontSize="9" fill="#fff">SR</text>
        <text x="44" y="36" fontFamily={F.s} fontWeight="600" fontSize="11" fill="#1e2a22">Shivam <tspan fontWeight="400" fontSize="9" fill="#7b867e">Katihar, India</tspan></text>
        <text x="44" y="49" fontFamily={F.s} fontSize="9" fill="#2e9a49">Just pledged</text>
      </g>
      {/* kraft notebook */}
      <g transform="translate(410 74) rotate(-9)">
        <g filter="url(#ma-sh)"><rect width="150" height="206" rx="6" fill="url(#ma-kraft)" /></g>
        <rect width="12" height="206" rx="3" fill="#a77847" opacity="0.6" />
        <text transform="translate(128 26) rotate(90)" fontFamily={F.d} fontWeight="800" fontSize="34" fill="#14502a" letterSpacing="-1">made<tspan fontWeight="500" fill="#1f7a3a">@</tspan>gain</text>
        <g stroke="#8a643b" strokeWidth="1" opacity="0.7"><path d="M26 168 h70 M26 184 h70" /></g>
        <text x="26" y="165" fontFamily={F.s} fontSize="6.5" fill="#6a4a2a">Name :</text>
        <text x="26" y="181" fontFamily={F.s} fontSize="6.5" fill="#6a4a2a">Grade :</text>
      </g>
      {/* stats card */}
      <g transform="translate(590 46)" className="bn-float d2">
        <g filter="url(#ma-sh)"><rect width="140" height="74" rx="12" fill="#fff" /></g>
        <text x="14" y="22" fontFamily={F.s} fontWeight="600" fontSize="7.5" fill="#6b7a6e" letterSpacing="1">BOOKS RECYCLED</text>
        <text x="14" y="48" fontFamily={F.d} fontWeight="600" fontSize="23" fill="#1e2a22" letterSpacing="-0.8">20,000</text>
        <text x="14" y="62" fontFamily={F.s} fontWeight="600" fontSize="8" fill="#2e9a49">↑ +312% YoY</text>
        <g fill="#2e9a49">{[8, 12, 10, 16, 20].map((h, i) => <rect key={i} x={104 + i * 6} y={60 - h} width="3.5" height={h} rx="1" />)}</g>
        <circle cx="130" cy="14" r="3.5" fill="#2e9a49" />
      </g>
      {/* recycled badge */}
      <g transform="translate(436 278)">
        <circle r="34" fill="#fff" stroke="#2e9a49" strokeWidth="2" />
        <g transform="translate(0 -5)">
          {[0, 120, 240].map((r) => (
            <g key={r} transform={`rotate(${r})`}>
              <path d="M-9.5 -9 A13 13 0 0 1 9.5 -9" stroke={G} strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M13.5 -11.5 L9 -3 L5 -12 Z" fill={G} />
            </g>
          ))}
        </g>
        <text y="27" textAnchor="middle" fontFamily={F.s} fontWeight="600" fontSize="6.5" fill={G} letterSpacing="1.4">RECYCLED</text>
      </g>
      {/* contributors chip */}
      <g transform="translate(560 262)" className="bn-float d3">
        <g filter="url(#ma-sh)"><rect width="150" height="46" rx="12" fill="#fff" /></g>
        {['#d6e8f6', '#fde7a8', '#e5ecdf', '#1e2a22'].map((c, i) => <circle key={c} cx={20 + i * 12} cy="23" r="9" fill={c} stroke="#fff" strokeWidth="2" />)}
        <text x="74" y="22" fontFamily={F.d} fontWeight="700" fontSize="13" fill="#1e2a22">10,000+</text>
        <text x="74" y="34" fontFamily={F.s} fontSize="7.5" fill="#7b867e">contributors</text>
      </g>
      {/* leaves */}
      <g fill="#7cc48b" opacity="0.8">
        <path d="M430 40 c 10 -8 20 -6 22 4 c -10 6 -18 6 -22 -4 z" />
        <path d="M720 190 c 6 -12 16 -14 22 -6 c -6 10 -14 12 -22 6 z" />
        <path d="M372 286 c 8 -10 18 -10 22 -2 c -8 8 -16 8 -22 2 z" />
      </g>
    </svg>
  )
}

function Webflow() {
  const R = '#e3141b', K = '#0d0d0f', WF = '#146ef5'
  return (
    <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wf-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef1f7" /><stop offset="1" stopColor="#dfe5f0" /></linearGradient>
        <radialGradient id="wf-glow" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor="#ff3b3b" /><stop offset="0.55" stopColor="#b10d13" /><stop offset="1" stopColor="#4a0306" /></radialGradient>
        <pattern id="wf-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#b8c2d6" opacity="0.6" /></pattern>
        <clipPath id="wf-site"><rect x="0" y="0" width="330" height="244" rx="12" /></clipPath>
        <Shadow id="wf-sh" o={0.2} />
      </defs>
      <rect width="800" height="360" fill="url(#wf-bg)" />
      <rect width="800" height="360" fill="url(#wf-dots)" />
      {/* mini Jerai Fitness site */}
      <g transform="translate(120 52)">
        <g filter="url(#wf-sh)"><rect width="330" height="244" rx="12" fill={K} /></g>
        <g clipPath="url(#wf-site)">
          <rect width="330" height="26" fill={K} />
          <text x="16" y="18" fontFamily={F.d} fontWeight="800" fontStyle="italic" fontSize="13" fill="#fff" letterSpacing="0.5">JERAI</text>
          <path d="M15 21 h40" stroke={R} strokeWidth="1.6" />
          <g fill="#c9c9cf" fontFamily={F.s} fontWeight="600" fontSize="5.5" letterSpacing="0.6">
            {['CARDIO', 'STRENGTH', 'JX-FIT', 'HOME RANGE', 'CONTACT'].map((t, i) => <text key={t} x={112 + i * 42} y="16">{t}</text>)}
          </g>
          <rect y="26" width="330" height="150" fill="url(#wf-glow)" />
          {/* stage light beams */}
          <path d="M0 26 L120 26 L70 176 L0 176 Z M330 26 L210 26 L260 176 L330 176 Z" fill="#000" opacity="0.28" />
          <path d="M95 26 h140 l-24 34 h-92 z" fill="#d9d9de" opacity="0.92" />
          <text x="165" y="43" textAnchor="middle" fontFamily={F.d} fontWeight="800" fontStyle="italic" fontSize="13" fill={K} letterSpacing="0.3">CARDIO</text>
          <text x="170" y="55" textAnchor="middle" fontFamily={F.d} fontWeight="800" fontStyle="italic" fontSize="9.5" fill={K}>SERIES</text>
          {/* treadmill */}
          <g transform="translate(118 78)" fill="#17171a" stroke="#2c2c31" strokeWidth="1">
            <path d="M14 0 h26 l4 14 h-34 z" fill="#2a2a2f" />
            <rect x="18" y="3" width="18" height="7" rx="1.5" fill="#5f6a75" stroke="none" />
            <path d="M22 14 L30 70 h6 L30 14 z" />
            <path d="M0 76 L92 64 L98 72 L4 86 z" />
            <path d="M10 80 L90 69" stroke="#444" strokeWidth="1.5" />
            <rect x="80" y="64" width="8" height="12" rx="2" fill={R} stroke="none" opacity="0.8" />
          </g>
          {/* elliptical + stepper silhouettes */}
          <g fill="#151518" opacity="0.92">
            <path d="M30 168 l18 -50 h6 l-8 30 l26 8 l-4 12 z M44 112 l10 -22 h5 l-9 22 z" />
            <path d="M262 168 h44 l-4 -46 l-20 -14 l-6 4 l14 12 l-24 2 z" />
          </g>
          <rect y="176" width="330" height="68" fill="#fff" />
          <text x="165" y="202" textAnchor="middle" fontFamily={F.d} fontWeight="800" fontStyle="italic" fontSize="15" fill={R} letterSpacing="0.4">NEW ARRIVALS</text>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${40 + i * 94} 212)`}>
              <rect width="62" height="24" rx="4" fill="#f2f2f4" />
              <rect x="6" y="18" width="34" height="3" rx="1.5" fill="#c9c9cf" />
              <rect x="22" y="4" width="18" height="10" rx="2" fill="#2a2a2f" />
            </g>
          ))}
        </g>
        {/* Webflow selection box on the hero heading */}
        <rect x="93" y="31" width="144" height="30" fill="none" stroke={WF} strokeWidth="1.5" />
        <rect x="93" y="21" width="44" height="11" rx="2" fill={WF} />
        <text x="97" y="29" fontFamily={F.s} fontWeight="600" fontSize="6.5" fill="#fff">Heading</text>
        {[[93, 31], [237, 31], [93, 61], [237, 61]].map(([x, y], i) => <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" fill="#fff" stroke={WF} strokeWidth="1.2" />)}
      </g>
      {/* breakpoints panel */}
      <g transform="translate(470 44)" className="bn-float">
        <g filter="url(#wf-sh)"><rect width="210" height="92" rx="12" fill="#fff" /></g>
        <rect x="12" y="12" width="18" height="18" rx="5" fill={WF} />
        <path d="M16.5 17.5 l2.6 7 l2.4 -5 l2.4 5 l2.6 -7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="38" y="25" fontFamily={F.s} fontWeight="600" fontSize="11" fill="#1d2433">Breakpoints</text>
        {[['Desktop', 'M0 0 h16 v11 h-16 z M5 14 h6'], ['Tablet', 'M2 -1 h11 v16 h-11 z'], ['Mobile', 'M4 0 h8 v15 h-8 z']].map(([l, d], i) => (
          <g key={l} transform={`translate(${14 + i * 64} 44)`}>
            <rect width="56" height="36" rx="8" fill={i === 2 ? '#e8f0fe' : '#f4f6fa'} stroke={i === 2 ? WF : 'none'} />
            <path transform="translate(20 6)" d={d} stroke={i === 2 ? WF : '#7a8599'} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
            <text x="28" y="31" textAnchor="middle" fontFamily={F.s} fontSize="7.5" fill={i === 2 ? WF : '#7a8599'}>{l}</text>
          </g>
        ))}
      </g>
      {/* interaction tweak */}
      <g transform="translate(470 152)" className="bn-float d2">
        <g filter="url(#wf-sh)"><rect width="210" height="58" rx="12" fill="#fff" /></g>
        <text x="14" y="22" fontFamily={F.m} fontSize="8" fill="#7a8599" letterSpacing="0.6">INTERACTION · SCROLL INTO VIEW</text>
        <rect x="14" y="32" width="182" height="6" rx="3" fill="#eef1f7" />
        <rect x="14" y="32" width="120" height="6" rx="3" fill={WF} />
        <circle cx="134" cy="35" r="6" fill="#fff" stroke={WF} strokeWidth="2" />
        <text x="196" y="52" textAnchor="end" fontFamily={F.s} fontSize="8" fill="#7a8599">ease-out · 600ms</text>
      </g>
      {/* published toast */}
      <g transform="translate(478 226) rotate(-2)" className="bn-float d3">
        <g filter="url(#wf-sh)"><rect width="200" height="50" rx="12" fill="#fff" /></g>
        <circle cx="25" cy="25" r="13" fill="#e3f6ee" />
        <path d="M19 25 l4.5 4.5 l8 -9" stroke="#1a9c6b" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="46" y="22" fontFamily={F.s} fontWeight="600" fontSize="11.5" fill="#1d2433">Published</text>
        <text x="46" y="36" fontFamily={F.m} fontSize="8.5" fill="#7a8599">jeraifitness.com · just now</text>
      </g>
      {/* more client sites */}
      <g transform="translate(560 288)">
        <rect width="120" height="26" rx="13" fill="#1d2433" />
        <text x="60" y="17" textAnchor="middle" fontFamily={F.s} fontWeight="600" fontSize="9.5" fill="#fff">+ more client sites</text>
      </g>
    </svg>
  )
}

function Seo() {
  const G = '#16a34a', Rd = '#dc4a3d', P = '#0f4539'
  const ring = (cx, cy, r, v, col, w) => {
    const c = 2 * Math.PI * r
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e7ece8" strokeWidth={w} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${(c * v) / 100} ${c}`} transform={`rotate(-90 ${cx} ${cy})`} />
      </g>
    )
  }
  // impressions curve: flat at launch, climbing through month 3
  const pts = [[0, 0], [1, 0], [2, 2], [3, 6], [4, 14], [5, 30], [6, 52], [7, 78], [8, 100]]
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(x * 23).toFixed(1)} ${(64 - y * 0.44).toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="seo-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1f6f2" /><stop offset="1" stopColor="#e2ece5" /></linearGradient>
        <linearGradient id="seo-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={G} stopOpacity="0.28" /><stop offset="1" stopColor={G} stopOpacity="0" /></linearGradient>
        <pattern id="seo-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#b9cbbf" opacity="0.6" /></pattern>
        <Shadow id="seo-sh" o={0.16} />
      </defs>
      <rect width="800" height="360" fill="url(#seo-bg)" />
      <rect width="800" height="360" fill="url(#seo-dots)" />
      {/* score card: month 1 vs month 3 */}
      <g transform="translate(120 46)">
        <g filter="url(#seo-sh)"><rect width="300" height="170" rx="14" fill="#fff" /></g>
        <text x="18" y="26" fontFamily={F.m} fontSize="8.5" fill="#7b867e" letterSpacing="0.8">SEO HEALTH · 12 WEEKS</text>
        <g>
          {ring(78, 98, 40, 46, Rd, 9)}
          <text x="78" y="104" textAnchor="middle" fontFamily={F.d} fontWeight="700" fontSize="24" fill={Rd} letterSpacing="-1">46</text>
          <text x="78" y="156" textAnchor="middle" fontFamily={F.m} fontSize="8" fill="#7b867e" letterSpacing="0.8">MONTH 1</text>
        </g>
        <path d="M134 98 h28 m-8 -6 l8 6 l-8 6" stroke={P} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <g>
          {ring(218, 98, 46, 88, G, 10)}
          <text x="218" y="106" textAnchor="middle" fontFamily={F.d} fontWeight="700" fontSize="30" fill={G} letterSpacing="-1.2">88</text>
          <text x="218" y="160" textAnchor="middle" fontFamily={F.m} fontSize="8" fill={G} letterSpacing="0.8">MONTH 3</text>
        </g>
        <rect x="236" y="14" width="50" height="18" rx="9" fill="#e8f7ee" />
        <text x="261" y="26.5" textAnchor="middle" fontFamily={F.s} fontWeight="700" fontSize="9" fill={G}>+42 pts</text>
      </g>
      {/* search impressions chart */}
      <g transform="translate(120 232)">
        <g filter="url(#seo-sh)"><rect width="300" height="86" rx="14" fill="#fff" /></g>
        <text x="18" y="22" fontFamily={F.m} fontSize="8.5" fill="#7b867e" letterSpacing="0.8">SEARCH IMPRESSIONS</text>
        <text x="282" y="24" textAnchor="end" fontFamily={F.d} fontWeight="700" fontSize="15" fill="#1e2a22">0 → 838</text>
        <g transform="translate(18 14)">
          <path d={`${line} L184 64 L0 64 Z`} fill="url(#seo-area)" />
          <path d={line} stroke={G} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="184" cy={64 - 44} r="3.5" fill="#fff" stroke={G} strokeWidth="2" />
          <path d="M0 64 h264" stroke="#e7ece8" />
        </g>
      </g>
      {/* proof chips */}
      <g transform="translate(442 46)" className="bn-float">
        <g filter="url(#seo-sh)"><rect width="238" height="58" rx="12" fill="#fff" /></g>
        {[0, 1, 2].map((k) => <g key={k} transform={`translate(${18 + k * 30} 29)`}><circle r="11" fill="#e8f7ee" /><path d="M-5 0 l3.5 3.5 l6.5 -7" stroke={G} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>)}
        <text x="110" y="25" fontFamily={F.s} fontWeight="600" fontSize="11.5" fill="#1e2a22">Core Web Vitals</text>
        <text x="110" y="40" fontFamily={F.s} fontSize="8.5" fill="#7b867e">All 3 passing · LCP 6.9s → &lt;2.5s</text>
      </g>
      <g transform="translate(442 118)" className="bn-float d2">
        <g filter="url(#seo-sh)"><rect width="238" height="58" rx="12" fill="#fff" /></g>
        <text x="18" y="27" fontFamily={F.d} fontWeight="700" fontSize="20" fill={P} letterSpacing="-0.8">6.4%</text>
        <text x="78" y="25" fontFamily={F.s} fontWeight="600" fontSize="11.5" fill="#1e2a22">Click-through rate</text>
        <text x="78" y="40" fontFamily={F.s} fontSize="9" fill="#7b867e">about 2× the industry average</text>
      </g>
      <g transform="translate(442 190)" className="bn-float d3">
        <g filter="url(#seo-sh)"><rect width="238" height="58" rx="12" fill="#fff" /></g>
        {[['4', 'pillar blogs'], ['9', 'schema types'], ['15', 'off-site links']].map(([n, l], k) => (
          <g key={l} transform={`translate(${18 + k * 76} 0)`}>
            <text y="29" fontFamily={F.d} fontWeight="700" fontSize="18" fill={P} letterSpacing="-0.6">{n}</text>
            <text y="43" fontFamily={F.s} fontSize="8.5" fill="#7b867e">{l}</text>
          </g>
        ))}
      </g>
      {/* AI-assisted chip */}
      <g transform="translate(518 264)">
        <rect width="162" height="30" rx="15" fill="#1e2a22" />
        <g transform="translate(18 15)" stroke="#e8ff8a" strokeWidth="2" strokeLinecap="round">
          {[0, 45, 90, 135].map((r) => <path key={r} d="M0 -6 V6" transform={`rotate(${r})`} />)}
        </g>
        <text x="34" y="19" fontFamily={F.s} fontWeight="600" fontSize="10" fill="#fff">AI-assisted with Claude</text>
      </g>
    </svg>
  )
}

function Frames() {
  const A = '#5b5bd6', P = '#1e2233', M = '#7c8092'
  // 3x3 frame grid, each a tiny "scene" that shifts frame to frame
  const kb = [34, 36, 31, 38, 33, 35, 37, 32, 36]
  return (
    <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fr-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3f3fb" /><stop offset="1" stopColor="#e4e5f3" /></linearGradient>
        <linearGradient id="fr-scene" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c9cbf5" /><stop offset="1" stopColor="#8e90e6" /></linearGradient>
        <pattern id="fr-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#bfc1dc" opacity="0.6" /></pattern>
        <clipPath id="fr-clip"><rect width="62" height="38" rx="5" /></clipPath>
        <Shadow id="fr-sh" o={0.16} />
      </defs>
      <rect width="800" height="360" fill="url(#fr-bg)" />
      <rect width="800" height="360" fill="url(#fr-dots)" />
      {/* source video: film strip */}
      <g transform="translate(120 70)">
        <g filter="url(#fr-sh)"><rect width="196" height="220" rx="14" fill="#fff" /></g>
        <text x="18" y="26" fontFamily={F.m} fontSize="8.5" fill={M} letterSpacing="0.8">SOURCE · MP4</text>
        <g transform="translate(18 40)">
          <rect width="160" height="120" rx="8" fill={P} />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <g key={k}><rect x={8 + k * 21.5} y="6" width="10" height="6" rx="1.5" fill="#3a3f57" /><rect x={8 + k * 21.5} y="108" width="10" height="6" rx="1.5" fill="#3a3f57" /></g>)}
          <rect x="10" y="20" width="140" height="80" rx="4" fill="url(#fr-scene)" />
          <circle cx="62" cy="60" r="16" fill="#fff" opacity="0.9" />
          <path d="M57 52 l13 8 l-13 8 Z" fill={A} />
        </g>
        {[['🖥', 'Desktop', '1920×1080'], ['📱', 'Mobile', '1080×1920']].map(([, l, s], k) => (
          <g key={l} transform={`translate(${18 + k * 84} 174)`}>
            <rect width="76" height="30" rx="8" fill={k ? '#f2ecfd' : '#eceefd'} />
            <circle cx="12" cy="15" r="3.5" fill={k ? '#a855f7' : '#3b82f6'} />
            <text x="21" y="13.5" fontFamily={F.s} fontWeight="600" fontSize="9" fill={P}>{l}</text>
            <text x="21" y="24" fontFamily={F.m} fontSize="7" fill={M}>{s}</text>
          </g>
        ))}
      </g>
      {/* arrow */}
      <g transform="translate(326 180)">
        <circle r="15" fill={A} />
        <path d="M-6 0 h11 m-5 -5 l5 5 l-5 5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* output frames */}
      <g transform="translate(352 70)">
        <g filter="url(#fr-sh)"><rect width="328" height="220" rx="14" fill="#fff" /></g>
        <text x="18" y="26" fontFamily={F.m} fontSize="8.5" fill={M} letterSpacing="0.8">FRAMES · 0000 → 0179</text>
        <rect x="246" y="13" width="66" height="18" rx="9" fill="#eceefd" />
        <text x="279" y="25.5" textAnchor="middle" fontFamily={F.s} fontWeight="700" fontSize="9" fill={A}>auto-tuned</text>
        {kb.map((v, i) => {
          const c = i % 3, r = Math.floor(i / 3)
          return (
            <g key={i} transform={`translate(${18 + c * 100} ${42 + r * 56})`}>
              <g clipPath="url(#fr-clip)">
                <rect width="62" height="38" fill="url(#fr-scene)" />
                <circle cx={8 + i * 5.5} cy="22" r="8" fill="#fff" opacity="0.85" />
              </g>
              <text x="68" y="16" fontFamily={F.m} fontSize="7.5" fill={M}>{String(i * 20).padStart(4, '0')}</text>
              <text x="68" y="30" fontFamily={F.d} fontWeight="700" fontSize="11" fill={P}>{v} KB</text>
            </g>
          )
        })}
      </g>
      {/* zip chip */}
      <g transform="translate(520 300)" className="bn-float">
        <rect width="160" height="30" rx="15" fill={P} />
        <path d="M18 9 v12 m-4 -4 l4 4 l4 -4" stroke="#e8ff8a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="32" y="19" fontFamily={F.s} fontWeight="600" fontSize="10" fill="#fff">frames.zip · CDN ready</text>
      </g>
    </svg>
  )
}

const BANNERS = { aertrip: Aertrip, madeagain: MadeAgain, webflow: Webflow, seo: Seo, frames: Frames }
export function Banner({ name }) {
  const B = BANNERS[name]
  return B ? <B /> : null
}

// ---------- night skyline ----------
// The skyline illustration is cut out of its own sky (transparent); a warm city glow sits behind it
// and the base fades into the footer. Its lit windows were detected offline (skyline-windows.json:
// box + facade colour + light colour), so a small canvas can make them live: lights switch off and
// back on, a few stutter like fluorescent tubes, some brighten for a moment.
const OFF = 1, BRIGHT = 2, STUTTER = 3

function WindowFlicker({ imgRef }) {
  const ref = useRef(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cv = ref.current, img = imgRef.current
    const ctx = cv.getContext('2d')
    const { w: IW, h: IH, win } = WINDOWS
    let map = { s: 1, ox: 0, oy: 0 }, timer = 0, visible = false
    const live = new Map() // index -> { kind, until, phase }

    const size = () => {
      const bw = img.clientWidth, bh = img.clientHeight, D = Math.min(2, devicePixelRatio || 1)
      cv.width = Math.round(bw * D); cv.height = Math.round(bh * D)
      // mirror object-fit: cover + object-position: 50% 100%
      const sc = Math.max(bw / IW, bh / IH)
      map = { s: sc * D, ox: ((bw - IW * sc) / 2) * D, oy: (bh - IH * sc) * D }
      draw()
    }
    const rect = (q, pad) => {
      const { s, ox, oy } = map
      return [ox + (q[0] - pad) * s, oy + (q[1] - pad) * s, (q[2] + pad * 2) * s, (q[3] + pad * 2) * s]
    }
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      const now = performance.now()
      for (const [i, st] of live) {
        const q = win[i]
        const dark = st.kind === OFF || (st.kind === STUTTER && Math.floor((now - st.phase) / 90) % 3 !== 0)
        if (dark) {
          ctx.globalAlpha = 1; ctx.shadowBlur = 0
          ctx.fillStyle = q[4]; ctx.fillRect(...rect(q, 0.6))
        } else if (st.kind === BRIGHT) {
          // glow up gently: lighter blend of the window's own colour
          const k = Math.sin(Math.min(1, (now - st.phase) / (st.until - st.phase)) * Math.PI)
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 * k
          ctx.shadowColor = q[5]; ctx.shadowBlur = 8 * map.s
          ctx.fillStyle = q[5]; ctx.fillRect(...rect(q, 0))
          ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0
        }
      }
      ctx.globalAlpha = 1
    }
    const tick = () => {
      const now = performance.now()
      for (const [i, st] of live) if (now > st.until) live.delete(i)
      // a couple of new events per tick, capped so the city never looks like it's glitching
      if (live.size < 14) {
        for (let n = 0; n < 2; n++) {
          if (Math.random() > 0.5) continue
          const i = Math.floor(Math.random() * win.length)
          if (live.has(i)) continue
          const r = Math.random()
          if (r < 0.5) live.set(i, { kind: OFF, phase: now, until: now + 1500 + Math.random() * 5000 })
          else if (r < 0.65) live.set(i, { kind: STUTTER, phase: now, until: now + 500 + Math.random() * 900 })
          else live.set(i, { kind: BRIGHT, phase: now, until: now + 1200 + Math.random() * 2200 })
        }
      }
      draw()
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      clearInterval(timer)
      if (visible) timer = setInterval(tick, 120)
    })
    const ro = new ResizeObserver(size)
    const start = () => { size(); ro.observe(img); io.observe(cv) }
    if (img.complete) start(); else img.addEventListener('load', start, { once: true })
    return () => { clearInterval(timer); io.disconnect(); ro.disconnect(); img.removeEventListener('load', start) }
  }, [imgRef])
  return <canvas ref={ref} className="skyline-flicker" />
}

export function Skyline() {
  const imgRef = useRef(null)
  return (
    <div className="skyline" aria-hidden="true">
      <i className="skyline-glow" />
      <img ref={imgRef} src={skylineImg} alt="" width="2132" height="465" loading="lazy" decoding="async" />
      <WindowFlicker imgRef={imgRef} />
      <i className="skyline-fade" />
    </div>
  )
}

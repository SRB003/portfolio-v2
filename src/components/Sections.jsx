import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { createPortal } from 'react-dom'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { animate, createTimeline } from 'animejs'
import { FiArrowUpRight, FiCopy, FiCheck, FiMail, FiGithub, FiLinkedin, FiPhone, FiFileText, FiPenTool, FiCode, FiShield, FiUploadCloud, FiActivity, FiRotateCw, FiBookOpen, FiAward, FiLink } from 'react-icons/fi'
import { profile, stats, path, extras, cases, publication } from '../data'

const FOOTER_SITE = [['Work', 'work'], ['All projects', '/projects/'], ['Flight log', '#path'], ['About', '#about'], ['Research', '#research'], ['Side quests', '#quests'], ['Contact', '#contact']]
import { Skyline } from '../art/Art'
import nightImg from '../assets/night-sky.webp'
import duskImg from '../assets/dusk-sky.webp'
import skylineReflect from '../assets/skyline.webp'
import Birds from '../fx/Birds'
import avatarImg from '../assets/avatar.webp'
import badgeImg from '../assets/badge-photo.webp'
import paperPdf from '../assets/paper-published.pdf'
import certPdf from '../assets/certificate-paper-publish.pdf'
import certThumb from '../assets/certificate-thumb.webp'

// moon in night-sky.webp (fractions of the image; r = disc radius as a fraction of width)
const MOON = { x: 0.8565, y: 0.531, r: 0.034 }
import { Note, Star } from './Scrap'

const YEAR = new Date().getFullYear()
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* one header system for every section */
export function SectionHead({ index, label, title, center, light }) {
  return (
    <div className={`shead ${center ? 'center' : ''} ${light ? 'light' : ''}`}>
      <div className="shead-rule" data-aos="fade">
        <span className="mono">{index}</span><i /><span className="mono">{label}</span>
      </div>
      <h2 data-aos="blur-up" data-aos-delay="60">{title}</h2>
    </div>
  )
}

/* run `fn` once when `ref` first scrolls into view */
function useOnEnter(ref, fn, margin = '-15% 0px') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { fn(el); io.disconnect() }
    }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/* ---------------- Path: a paper plane flies a dotted trail that weaves between the stops ---------------- */
// ---------- flight log helpers ----------
// Airport split-flap board: blank tiles until the paper plane reaches the stop, then every
// tile rattles through characters and clicks into place, left to right.
const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789×.'
function SplitFlap({ text }) {
  const ref = useRef(null)
  const chars = Array.from(text.toUpperCase())
  useEffect(() => {
    const el = ref.current, stop = el.closest('.stop')
    const tiles = [...el.querySelectorAll('.flap b')]
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let timers = [], done = false
    const land = () => {
      if (done) return
      done = true
      tiles.forEach((t, i) => {
        const target = chars[i]
        if (reduce || target === ' ') { t.textContent = target; t.parentElement.classList.add('set'); return }
        let n = 0
        const spins = 6 + i * 2
        const id = setInterval(() => {
          n++
          t.parentElement.classList.remove('tick'); void t.offsetWidth; t.parentElement.classList.add('tick')
          if (n >= spins) { clearInterval(id); t.textContent = target; t.parentElement.classList.add('set') }
          else t.textContent = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]
        }, 55)
        timers.push(id)
      })
    }
    stop.addEventListener('landed', land)
    if (stop.classList.contains('passed')) land()
    return () => { stop.removeEventListener('landed', land); timers.forEach(clearInterval) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span className="split-flap" ref={ref} aria-label={text}>
      {chars.map((c, i) => <span key={i} className={`flap ${c === ' ' ? 'gap' : ''}`} aria-hidden="true"><b>{c === ' ' ? ' ' : ''}</b></span>)}
    </span>
  )
}
// decorative barcode, stable per title
function Barcode({ seed }) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const bars = []
  let x = 0
  for (let i = 0; i < 26; i++) {
    h = (h * 1664525 + 1013904223) >>> 0
    const w = 1 + (h % 3), gap = 1 + ((h >> 8) % 2)
    bars.push(<rect key={i} x={x} y="0" width={w} height="34" />)
    x += w + gap
  }
  return <svg className="bp-barcode" viewBox={`0 0 ${x} 34`} preserveAspectRatio="none" aria-hidden="true">{bars}</svg>
}

export function Path() {
  const wrap = useRef(null)
  const svg = useRef(null)
  const trail = useRef(null)
  const reveal = useRef(null)
  const plane = useRef(null)
  const shadow = useRef(null)
  const tagRef = useRef(null)
  const [tail, setTail] = useState(null)
  const flight = useRef({ ang: 90, bank: 0 })
  const [d, setD] = useState('')
  const [box, setBox] = useState([0, 0])
  // lands on the final destination while it's comfortably on screen (not after it has left)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start 72%', 'end 88%'] })

  // build a smooth curve through the node of every stop (they alternate left / right)
  useLayoutEffect(() => {
    const calc = () => {
      const w = wrap.current
      if (!w) return
      const r = w.getBoundingClientRect()
      const pts = [...w.querySelectorAll('.node')].map((n) => {
        const b = n.getBoundingClientRect()
        return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top]
      })
      if (pts.length < 2) return
      let s = `M ${pts[0][0]} ${pts[0][1] - 80} L ${pts[0][0]} ${pts[0][1]}`
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2
        const sway = (i % 2 ? 1 : -1) * (r.width < 700 ? 14 : Math.min(160, r.width * 0.12))
        s += ` C ${x0 + sway} ${my}, ${x1 - sway} ${my}, ${x1} ${y1}`
      }
      // the journey continues: a short trail on past the last stop
      // levels out heading right, toward the "still flying →" note
      const [lx, ly] = pts[pts.length - 1], tw = r.width < 700 ? 30 : 90
      s += ` C ${lx} ${ly + 70}, ${lx + 6} ${ly + 128}, ${lx + tw} ${ly + 140}`
      setTail([lx + tw, ly + 140])
      setD(s); setBox([r.width, r.height])
    }
    calc()
    const ro = new ResizeObserver(calc); ro.observe(wrap.current)
    document.fonts?.ready.then(calc)
    return () => ro.disconnect()
  }, [])

  const place = (v) => {
    const p = reveal.current, pl = plane.current
    if (!p || !pl || !wrap.current || !p.getAttribute('d')) return
    const L = p.getTotalLength(), at = Math.min(1, Math.max(0, v)) * L
    p.style.strokeDasharray = `${L}`; p.style.strokeDashoffset = `${L - at}`
    const a = p.getPointAtLength(at)
    // heading from a short look-ahead; at the very end look back instead (no snap to 0°)
    const a0 = at > L - 2 ? p.getPointAtLength(L - 2) : a, b = at > L - 2 ? a : p.getPointAtLength(at + 2)
    const ang = (Math.atan2(b.y - a0.y, b.x - a0.x) * 180) / Math.PI
    // bank into the turns: the faster the heading changes, the more the wings tilt (eased)
    const f = flight.current
    let dA = ang - f.ang; if (dA > 180) dA -= 360; if (dA < -180) dA += 360
    f.bank += (Math.max(-1, Math.min(1, dA / 6)) - f.bank) * 0.35
    f.ang = ang
    const sy = (1 - Math.abs(f.bank) * 0.45).toFixed(3)
    pl.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang}) scale(1 ${sy})`)
    // shadow on the "ground" below and to the right — flying, not sliding
    shadow.current?.setAttribute('transform', `translate(${a.x + 16} ${a.y + 22}) rotate(${ang}) scale(0.9 ${(sy * 0.9).toFixed(3)})`)

    // light up the stops the plane has passed
    const r = wrap.current.getBoundingClientRect()
    wrap.current.querySelectorAll('.stop').forEach((s) => {
      const n = s.querySelector('.node').getBoundingClientRect()
      const now = n.top - r.top + 6 <= a.y
      if (now && !s.classList.contains('passed')) s.dispatchEvent(new Event('landed'))
      s.classList.toggle('passed', now)
    })
    // after the last stop the plane flies on and cruises at the end of the trail
    svg.current?.classList.toggle('cruising', v >= 0.995)
    tagRef.current?.classList.toggle('on', v >= 0.995)
  }
  useMotionValueEvent(scrollYProgress, 'change', place)
  useEffect(() => { place(scrollYProgress.get()) }, [d]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="sec path" id="path">
      <div className="rel">
        <SectionHead index="02" label="Flight log · 2019 → now" center title={<>From a diploma desk<br />to <em>production</em>.</>} />
        <Note arrow="down-right" className="path-note">follow the paper plane</Note>
        <Star className="spin path-star" color="#f3b48b" />
      </div>
      <div className="timeline" ref={wrap}>
        <svg ref={svg} className="trail" width={box[0]} height={box[1]} aria-hidden="true">
          <defs>
            <mask id="trail-mask"><path ref={reveal} d={d} fill="none" stroke="#fff" strokeWidth="26" /></mask>
            <linearGradient id="contrail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e4fb7a" /><stop offset="1" stopColor="#7fd6a0" />
            </linearGradient>
            <filter id="trail-glow" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="5" /></filter>
            <filter id="plane-shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          {/* route ahead: faint, dotted */}
          <path ref={trail} d={d} fill="none" stroke="#0f4539" strokeOpacity=".16" strokeWidth="2" strokeDasharray="1.5 9" strokeLinecap="round" />
          {/* flown: soft glowing contrail + crisp dashed flight line */}
          <g mask="url(#trail-mask)">
            <path d={d} fill="none" stroke="url(#contrail)" strokeWidth="14" strokeLinecap="round" opacity=".55" filter="url(#trail-glow)" />
            <path d={d} fill="none" stroke="url(#contrail)" strokeWidth="5" strokeLinecap="round" opacity=".5" />
            <path d={d} fill="none" stroke="#0f4539" strokeWidth="2" strokeDasharray="7 7" strokeLinecap="round" />
          </g>
          <g ref={shadow} opacity=".22" filter="url(#plane-shadow)">
            <g transform="scale(1.6)"><path d="M-12 -7 L14 0 L-12 7 L-7 0 Z" fill="#3b2a1e" /></g>
          </g>
          <g ref={plane}>
            <g className="plane-bob"><g transform="scale(1.7)">
              <path d="M-12 -7 L14 0 L-12 7 L-7 0 Z" fill="#fff" stroke="#0f4539" strokeWidth="1.1" strokeLinejoin="round" />
              <path d="M-12 -7 L-7 0 L14 0 Z" fill="#eef3ee" />
              <path d="M-7 0 L14 0" stroke="#0f4539" strokeWidth="1" />
            </g></g>
          </g>
        </svg>
        {tail && <span ref={tagRef} className="still-flying mono" style={{ left: tail[0], top: tail[1] }}>Still flying · {Number(path[path.length - 1].year) + 1} →</span>}
        {path.map((p, i) => {
          const no = String(i + 1).padStart(2, '0')
          return (
            <div key={p.title} className={`stop ${i % 2 ? 'right' : 'left'}`}>
              <span className="node" />
              <div className="big-yr dboard" aria-hidden="true">
                <div className="db-row db-top mono"><span><svg viewBox="0 0 24 24" width="11" height="11"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="currentColor" /></svg> Arrivals</span><span>Gate {no}</span></div>
                <SplitFlap text={p.tag} />
                <div className="db-row db-foot mono"><span className="db-where">{p.where}</span><span className="db-stat"><i />{p.year}</span></div>
              </div>
              <article className="stop-card bpass" data-aos={i % 2 ? 'fade-left' : 'fade-right'}>
                <div className="bp-main">
                  <div className="bp-head mono">
                    <span>Flight SB-{p.year.slice(2)}{no}</span>
                    <span className="bp-status"><i />{''}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p className="where">{p.where}</p>
                  <p className="muted">{p.note}</p>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="proof" data-cursor="View proof">
                      Boarding docs <FiArrowUpRight className="arrow" />
                    </a>
                  )}
                </div>
                <div className="bp-stub" aria-hidden="true">
                  <span className="mono">Year</span><b>{p.year}</b>
                  <span className="mono">Gate</span><b className="sm">{no}</b>
                  <Barcode seed={p.title} />
                  <span className="bp-stamp"><b>Cleared</b><small>{p.year}</small></span>
                </div>
              </article>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------- About: bento with a holographic ID badge + typing terminal ---------------- */

// ---------- scannable contact QR on the ID badge ----------
// Encodes a compact vCard (kept short on purpose: 49×49 modules, decodes reliably from ~160px).
// Scanning offers "Add contact" with name, role, phone, email and GitHub. The downloadable .vcf
// carries the fuller card (LinkedIn + location too).
const VCARD = [
  'BEGIN:VCARD', 'VERSION:3.0',
  `N:${profile.name.split(' ').slice(1).join(' ')};${profile.firstName}`,
  `FN:${profile.name}`,
  `TITLE:${profile.role}`,
  `TEL:${profile.phone.replace(/-/g, '')}`,
  `EMAIL:${profile.email}`,
  `URL:${profile.github}`,
  'END:VCARD',
].join('\n')
const VCARD_FULL = [
  'BEGIN:VCARD', 'VERSION:3.0',
  `N:${profile.name.split(' ').slice(1).join(' ')};${profile.firstName};;;`,
  `FN:${profile.name}`,
  `TITLE:${profile.role}`,
  `TEL;TYPE=CELL:${profile.phone.replace(/-/g, '')}`,
  `EMAIL;TYPE=INTERNET:${profile.email}`,
  `URL:${profile.linkedin}`,
  `URL:${profile.github}`,
  `ADR;TYPE=WORK:;;;Mumbai;Maharashtra;;India`,
  'NOTE:Open to full-stack roles · React · Node.js · REST APIs · SQL',
  'END:VCARD',
].join('\r\n')
const VCF_HREF = `data:text/vcard;charset=utf-8,${encodeURIComponent(VCARD_FULL)}`

function QrSvg({ text, className }) {
  const cells = useMemo(() => {
    const qr = qrcode(0, 'L'); qr.addData(text, 'Byte'); qr.make()
    const n = qr.getModuleCount(), rects = []
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) rects.push(`M${x} ${y}h1v1h-1z`)
    return { n, d: rects.join('') }
  }, [text])
  const q = 4 // quiet zone, required for reliable scanning
  return (
    <svg className={className} viewBox={`${-q} ${-q} ${cells.n + q * 2} ${cells.n + q * 2}`} shapeRendering="crispEdges" role="img" aria-label="QR code: contact card for Sahil Bhuvad">
      <rect x={-q} y={-q} width={cells.n + q * 2} height={cells.n + q * 2} fill="#fff" />
      <path d={cells.d} fill="#141a19" />
    </svg>
  )
}

function QrModal({ onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [onClose])
  // rendered at <body> level: the badge tile's 3D perspective would otherwise trap position: fixed
  return createPortal(
    <div className="qr-backdrop" onClick={onClose}>
      <div className="qr-sheet" role="dialog" aria-modal="true" aria-label="Scan to save contact" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="qr-x" onClick={onClose} aria-label="Close">×</button>
        <span className="mono qr-k">Dev access pass · contact</span>
        <QrSvg text={VCARD} className="qr-big" />
        <h4>Scan with your phone camera</h4>
        <p>Adds {profile.firstName} to your contacts with name, role, phone, email and GitHub.</p>
        <a className="btn btn-lime qr-dl" href={VCF_HREF} download="Sahil-Bhuvad.vcf" data-cursor="Save contact">Save contact (.vcf)</a>
      </div>
    </div>,
    document.body,
  )
}

function IdBadge() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!matchMedia('(pointer: fine)').matches) return
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`); el.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`)
      el.style.setProperty('--hx', `${((x + 0.5) * 100).toFixed(1)}%`); el.style.setProperty('--hy', `${((y + 0.5) * 100).toFixed(1)}%`)
    }
    const leave = () => {
      const o = { rx: parseFloat(el.style.getPropertyValue('--rx')) || 0, ry: parseFloat(el.style.getPropertyValue('--ry')) || 0 }
      animate(o, { rx: 0, ry: 0, duration: 1400, ease: 'outElastic(1, .35)', onUpdate: () => {
        el.style.setProperty('--rx', `${o.rx}deg`); el.style.setProperty('--ry', `${o.ry}deg`)
      } })
    }
    const zone = el.parentElement
    zone.addEventListener('pointermove', move); zone.addEventListener('pointerleave', leave)
    return () => { zone.removeEventListener('pointermove', move); zone.removeEventListener('pointerleave', leave) }
  }, [])
  const [qrOpen, setQrOpen] = useState(false)
  return (
    <div className="b-tile badge-zone" data-aos="fade-up">
      <Note arrow="down-right" className="badge-note">yep, that’s my pass</Note>
      <svg className="lanyard" viewBox="0 0 60 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M18 0 L26 170 M42 0 L34 170" stroke="#0f4539" strokeWidth="10" strokeLinecap="round" />
        <rect x="22" y="160" width="16" height="26" rx="4" fill="#c9a24a" />
      </svg>
      <div className="badge" ref={ref} data-cursor="Access granted ✓">
        <div className="badge-top">
          <span className="mono">Dev access pass</span>
          <span className="chip" aria-hidden="true" />
        </div>
        <div className="badge-photo"><img src={badgeImg} alt={`Portrait of ${profile.name}`} width="92" height="92" loading="lazy" decoding="async" /></div>
        <h3>{profile.name}</h3>
        <p className="badge-role">{profile.role}</p>
        <dl className="badge-meta">
          <div><dt>ID</dt><dd>SB-2025-MUM</dd></div>
          <div><dt>Clearance</dt><dd>Production</dd></div>
          <div><dt>Stack</dt><dd>React · Node · SQL</dd></div>
          <div><dt>Status</dt><dd className="ok">● Available</dd></div>
        </dl>
        <button type="button" className="badge-qr" onClick={() => setQrOpen(true)} data-cursor="Scan · or tap to enlarge">
          <QrSvg text={VCARD} className="qr-small" />
          <span className="bq-txt"><b>Scan to save my contact</b><small>Tap to enlarge · works offline</small></span>
        </button>
        <div className="holo" aria-hidden="true" />
      </div>
      {qrOpen && <QrModal onClose={() => setQrOpen(false)} />}
    </div>
  )
}


// ---------- about: "requirements in, reliable software out" as a real CI run ----------
// Stages + logs mirror profile.about (understand → design with the team → clean code → test &
// debug → production) and the skills list in data.js.
const PIPE = [
  { id: 'req', name: 'Requirements', Icon: FiFileText, logs: [
    ['cmd', 'read brief --feature'],
    ['ok', 'What does the user actually need? Noted.'],
    ['ok', 'Edge cases & acceptance criteria agreed with the team'],
  ] },
  { id: 'design', name: 'Design', Icon: FiPenTool, logs: [
    ['cmd', 'design --with team'],
    ['ok', 'Data model sketched · PostgreSQL / MySQL'],
    ['ok', 'REST API contract drafted'],
    ['ok', 'UI states mapped · loading · empty · error'],
  ] },
  { id: 'build', name: 'Build', Icon: FiCode, logs: [
    ['cmd', 'build --clean-code'],
    ['ok', 'React.js components · state management'],
    ['ok', 'Node.js services · REST endpoints'],
    ['ok', 'JavaScript (ES6+) · Python · Java · SQL'],
  ] },
  { id: 'test', name: 'Test', Icon: FiShield, logs: [
    ['cmd', 'test && debug'],
    ['ok', 'Tests passing · bugs reproduced, then fixed'],
    ['ok', 'Code review approved'],
  ] },
  { id: 'ship', name: 'Ship', Icon: FiUploadCloud, logs: [
    ['cmd', 'deploy --prod'],
    ['ok', 'Responsive across breakpoints'],
    ['ok', 'Live in production'],
  ] },
  { id: 'support', name: 'Support', Icon: FiActivity, logs: [
    ['cmd', 'watch --production'],
    ['ok', 'Live client sites kept fast & reliable'],
    ['ok', 'Still here after launch. SDLC end to end'],
  ] },
]

function Pipeline() {
  const ref = useRef(null)
  const [status, setStatus] = useState(() => PIPE.map(() => 'idle')) // idle | run | ok
  const [active, setActive] = useState(0)
  const [shown, setShown] = useState({ line: 0, chars: 0 }) // typing progress in the active stage
  const [run, setRun] = useState('idle') // idle | running | passed
  const [secs, setSecs] = useState(() => PIPE.map(() => null))
  const timer = useRef(0)

  const start = useCallback(() => {
    clearInterval(timer.current)
    if (reduce()) {
      setStatus(PIPE.map(() => 'ok')); setRun('passed'); setActive(0)
      setShown({ line: 99, chars: 0 }); setSecs(PIPE.map((p) => (0.4 + p.logs.length * 0.3).toFixed(1)))
      return
    }
    let st = 0, line = 0, chars = 0, t0 = performance.now()
    setRun('running'); setStatus(PIPE.map((_, i) => (i === 0 ? 'run' : 'idle'))); setActive(0); setShown({ line: 0, chars: 0 }); setSecs(PIPE.map(() => null))
    let pause = 0
    timer.current = setInterval(() => {
      if (pause > 0) { pause--; return }
      const logs = PIPE[st].logs
      chars += 5
      if (chars >= logs[line][1].length + 2) { line++; chars = 0; pause = 3 }
      if (line >= logs.length) {
        const took = ((performance.now() - t0) / 1000).toFixed(1)
        const done = st
        setSecs((a) => a.map((v, i) => (i === done ? took : v)))
        setStatus((a) => a.map((v, i) => (i === done ? 'ok' : i === done + 1 ? 'run' : v)))
        st++; line = 0; chars = 0; t0 = performance.now(); pause = 6
        if (st >= PIPE.length) {
          clearInterval(timer.current); setRun('passed'); setShown({ line: 99, chars: 0 }); setActive(PIPE.length - 1)
          return
        }
        setActive(st)
      }
      setShown({ line, chars })
    }, 22)
  }, [])

  useOnEnter(ref, () => start(), '-20% 0px')
  useEffect(() => () => clearInterval(timer.current), [])

  const pick = (i) => { if (run === 'running') return; setActive(i); setShown({ line: 99, chars: 0 }) }
  const done = status.filter((x) => x === 'ok').length
  const logs = PIPE[active].logs
  const total = secs.every(Boolean) ? secs.reduce((a, b) => a + parseFloat(b), 0).toFixed(1) : null

  return (
    <div className="b-tile pipeline" ref={ref} data-aos="fade-up" data-aos-delay="80">
      <div className="pl-bar">
        <span className="pl-dots"><i /><i /><i /></span>
        <span className="mono pl-title">sahil / build · main</span>
        <span className={`pl-run mono ${run}`}>{run === 'passed' ? <>Passed <FiCheck /> {total}s</> : run === 'running' ? 'Running…' : 'Queued'}</span>
        <button type="button" className="pl-rerun" onClick={start} disabled={run === 'running'} aria-label="Re-run pipeline" data-cursor="Re-run"><FiRotateCw /></button>
      </div>
      <ol className="pl-stages" style={{ '--done': Math.min(1, done / (PIPE.length - 1)) }}>
        <i className="pl-track" aria-hidden="true"><b /></i>
        {PIPE.map((p, i) => (
          <li key={p.id}>
            <button type="button" className={`pl-stage ${status[i]} ${active === i ? 'active' : ''}`} onClick={() => pick(i)} aria-pressed={active === i} data-cursor={run === 'running' ? 'Running…' : `Logs · ${p.name}`}>
              <span className="pl-ico"><p.Icon /></span>
              <span className="pl-name">{p.name}</span>
              <span className="pl-time mono">{status[i] === 'ok' ? `${secs[i]}s` : status[i] === 'run' ? 'running' : '--'}</span>
            </button>
          </li>
        ))}
      </ol>
      <pre className="pl-log" aria-live="polite">
        <span className="pl-step mono">› {String(active + 1).padStart(2, '0')} {PIPE[active].name.toLowerCase()}</span>
        {logs.map(([k, txt], i) => {
          if (i > shown.line) return null
          const full = i < shown.line
          const vis = full ? txt : txt.slice(0, shown.chars)
          return (
            <div key={i} className={`pl-line ${k}`}>
              <span className="pl-pfx">{k === 'cmd' ? '$' : full ? '✓' : '·'}</span>{vis}{!full && <span className="t-caret" />}
            </div>
          )
        })}
      </pre>
      <div className="pl-artifacts">
        <span className="mono pl-art-k">Artifacts</span>
        {stats.map((st) => <span key={st.label} className="pl-art"><b>{st.value}</b>{st.label}</span>)}
      </div>
    </div>
  )
}

export function About() {
  return (
    <section className="sec about" id="about">
      <SectionHead index="03" label="About · the person behind the commits" title={<>Requirements in,<br /><em>reliable software</em> out.</>} />
      <div className="bento">
        <IdBadge />
        <div className="b-tile b-intro" data-aos="fade-up" data-aos-delay="60">
          {profile.about.map((p, i) => <p key={i} className={i ? 'muted' : 'lead'}>{p}</p>)}
          <div className="b-links">
            <a href={profile.github} target="_blank" rel="noreferrer" className="pill-link">GitHub <FiArrowUpRight className="arrow" /></a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="pill-link">LinkedIn <FiArrowUpRight className="arrow" /></a>
          </div>
        </div>
        <Pipeline />
      </div>
    </section>
  )
}

/* ---------------- Research stats: four cards, each with a tiny drawn visual that plays on scroll ---------------- */
const initials = (n) => n.split(' ').map((w) => w[0]).join('')
function ResearchStats({ p }) {
  const ref = useRef(null)
  const year = Number(p.date.split(' ')[1])
  const stats = [
    { id: 'impact', to: Number(p.impact), dec: 2, from: 0, label: 'Impact factor', sub: `${p.journalShort} journal` },
    { id: 'pages', to: p.pageCount, dec: 0, from: 0, label: 'Pages', sub: `pp. ${p.pages}` },
    { id: 'authors', to: p.authors.length, dec: 0, from: 0, label: 'Authors', sub: `Lead: ${p.authors[0].split(' ')[0]}` },
    { id: 'year', to: year, dec: 0, from: year - 6, label: 'Published', sub: p.issue.replace('Volume', 'Vol') },
  ]
  useOnEnter(ref, (el) => {
    el.classList.add('in')
    if (reduce()) return
    el.querySelectorAll('.rs-num').forEach((n, i) => {
      const st = stats[i], o = { v: st.from }
      animate(o, { v: st.to, duration: 1400, delay: 150 + i * 120, ease: 'outExpo', onUpdate: () => { n.textContent = o.v.toFixed(st.dec) } })
    })
  })
  const arc = 2 * Math.PI * 30 * 0.5 // half circle length
  return (
    <ul className="rs-stats" ref={ref} aria-label="Paper at a glance">
      {stats.map((st, i) => (
        <li key={st.id} className={`rs-stat s-${st.id}`} style={{ '--i': i }} data-aos="fade-up" data-aos-delay={i * 80}>
          <div className="rs-vis" aria-hidden="true">
            {st.id === 'impact' && (
              <svg viewBox="0 0 80 46">
                <path d="M10 40 A30 30 0 0 1 70 40" className="g-track" />
                <path d="M10 40 A30 30 0 0 1 70 40" className="g-val" style={{ strokeDasharray: arc, '--off': arc * (1 - Math.min(1, st.to / 10)), '--len': arc }} />
                {[0, 1, 2, 3, 4].map((t) => { const a = Math.PI * (1 - t / 4); return <circle key={t} cx={40 + 22 * Math.cos(a)} cy={40 - 22 * Math.sin(a)} r="1.2" className="g-tick" /> })}
              </svg>
            )}
            {st.id === 'pages' && (
              <span className="pg-fan">{Array.from({ length: st.to }, (_, k) => <i key={k} style={{ '--k': k - (st.to - 1) / 2 }} />)}</span>
            )}
            {st.id === 'authors' && (
              <span className="au-row">{p.authors.map((a, k) => <b key={a} className={k === 0 ? 'me' : ''} style={{ '--k': k }} title={a}>{initials(a)}</b>)}</span>
            )}
            {st.id === 'year' && (
              <svg viewBox="0 0 64 64" className="stamp">
                <defs><path id="rs-ring" d="M32 32 m-22 0 a22 22 0 1 1 44 0 a22 22 0 1 1 -44 0" /></defs>
                <circle cx="32" cy="32" r="29" className="st-o" /><circle cx="32" cy="32" r="16" className="st-i" />
                <text className="st-t"><textPath href="#rs-ring" startOffset="0">VOL 4 · ISSUE 1 · {p.journalShort} ·</textPath></text>
                <text x="32" y="36" textAnchor="middle" className="st-c">{String(year).slice(2)}</text>
              </svg>
            )}
          </div>
          <span className="rs-num">{reduce() ? st.to.toFixed(st.dec) : st.from.toFixed(st.dec)}</span>
          <span className="rs-lab">{st.label}</span>
          <span className="rs-sub2 mono">{st.sub}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---------------- Research: the paper as a printed journal page + the certificate pinned beside it ---------------- */
export function Research() {
  const p = publication
  const proofs = [
    { href: certPdf, icon: <FiAward />, label: 'Publication certificate', sub: `PDF · No. ${p.certNo}` },
    { href: p.doiUrl, icon: <FiLink />, label: 'Crossref DOI record', sub: `doi.org/${p.doi}` },
    { href: p.journalUrl, icon: <FiFileText />, label: 'Copy on the journal site', sub: 'ijarsct.co.in' },
  ]
  return (
    <section className="sec research" id="research" aria-labelledby="research-title">
      <SectionHead index="04" label="Research · published work" title={<span id="research-title">Code that ships,<br /><em>ideas on paper</em>.</span>} />

      <div className="rs-desk">
        {/* the paper, typeset like the journal page it was printed on */}
        <div className="rs-stack" data-aos="fade-up">
        <article className="rs-page" aria-label={`Paper: ${p.title}`}>
          <header className="rs-run mono">
            <span>{p.journalShort} · ISSN {p.issn}</span>
            <span>{p.issue} · {p.date}</span>
          </header>

          <div className="rs-head">
            <span className="rs-kicker mono"><i aria-hidden="true" /> Peer-reviewed research paper</span>
            <h3 className="rs-title">{p.title}</h3>
            <p className="rs-authors">
              {p.authors.map((a, i) => <span key={a}><span className={i === 0 ? 'rs-me' : undefined}>{a}</span>{i < p.authors.length - 1 ? ',' : ''}</span>)}
            </p>
            <p className="rs-aff">{p.affiliation}</p>
          </div>

          <p className="rs-abstract"><em>Abstract:</em> {p.summary}</p>

          <div className="rs-contrib">
            <span className="rs-sub mono">What the paper covers</span>
            <ol>{p.points.map((pt, i) => <li key={pt}><span className="mono">{String(i + 1).padStart(2, '0')}</span>{pt}</li>)}</ol>
          </div>

          <p className="rs-kw"><b>Keywords:</b> {p.keywords.join(', ')}</p>

          <footer className="rs-foot mono">
            <span>DOI: {p.doi}</span>
            <span>{p.pages.split('–')[0]}</span>
          </footer>
        </article>
        <Note className="rs-note" arrow="down-left">my first paper!</Note>
        </div>

        <aside className="rs-side" aria-label="Proof of publication">
          <a className="rs-cert" href={certPdf} target="_blank" rel="noreferrer" data-cursor="Open certificate" data-aos="fade-up" data-aos-delay="80">
            <span className="tape" aria-hidden="true" />
            <img src={certThumb} alt={`IJARSCT certificate of publication for Sahil Bhuvad, No. ${p.certNo}`} width="1000" height="727" loading="lazy" decoding="async" />
            <span className="rs-stamp" aria-hidden="true"><small>★ DOI ★</small>Crossref<br />verified</span>
            <span className="sr-only"> (opens PDF in a new tab)</span>
          </a>

          <div className="rs-proof-card" data-aos="fade-up" data-aos-delay="140">
            <a className="btn rs-cta" href={paperPdf} target="_blank" rel="noreferrer" data-cursor="Read paper">
              <FiBookOpen aria-hidden="true" /> Read the full paper <small>PDF · {p.pageCount} pages</small>
              <FiArrowUpRight className="arrow" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <ul className="rs-links">
              {proofs.map((x) => (
                <li key={x.label}>
                  <a href={x.href} target="_blank" rel="noreferrer" data-cursor="Open">
                    <span className="rs-ico" aria-hidden="true">{x.icon}</span>
                    <span className="rs-txt"><b>{x.label}</b><small>{x.sub}</small></span>
                    <FiArrowUpRight className="arrow" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <ResearchStats p={p} />
    </section>
  )
}

/* ---------------- Sunset: the sun sinks and big type slides as you scroll into the night ---------------- */
// golden hour: the same painted sky graded to dusk, the sun setting on the left while the
// moon rises on the right in the next section. One statement whose words rise in with scroll.
const DUSK_LINE_1 = ['Let’s', 'build', 'something']
const DUSK_LINE_2 = ['people', 'rely', 'on.']
export function Sunset() {
  const ref = useRef(null)
  const sky = useRef(null), words = useRef([]), meta = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!sky.current) return
    // sky drifts down slower than the page → the sun sinks as you pass
    sky.current.style.transform = `translate3d(0, ${(-8 + v * 16).toFixed(2)}%, 0) scale(1.12)`
    const all = words.current
    all.forEach((el, i) => {
      if (!el) return
      // fully in place by the time the section is centred (v ≈ 0.5)
      const k = Math.min(1, Math.max(0, (v - 0.16 - i * 0.03) / 0.12))
      el.style.opacity = String(k)
      el.style.transform = `translate3d(0, ${((1 - k) * 0.55).toFixed(3)}em, 0)`
      el.style.filter = k < 1 ? `blur(${((1 - k) * 6).toFixed(1)}px)` : 'none'
    })
    if (meta.current) meta.current.style.opacity = String(Math.min(1, Math.max(0, (v - 0.12) / 0.1)))
  })
  // fixed index per word (a running counter would drift on every re-render)
  const word = (offset) => (w, i) => <span key={w} className="dw" ref={(el) => { words.current[offset + i] = el }}>{w}</span>
  return (
    <section className="sunset" ref={ref} aria-label="Golden hour, transition to contact">
      <div className="dusk-sky" ref={sky} aria-hidden="true"><img src={duskImg} alt="" width="1672" height="941" loading="lazy" decoding="async" /></div>
      <i className="dusk-veil" aria-hidden="true" />
      <Birds variant="dusk" />
      <div className="dusk-copy">
        <span className="dusk-meta mono" ref={meta}><i className="dusk-dot" /> 7:15 pm · Golden hour</span>
        <h2 className="dusk-title">
          <span className="dl">{DUSK_LINE_1.map(word(0))}</span>
          <span className="dl em">{DUSK_LINE_2.map(word(DUSK_LINE_1.length))}</span>
        </h2>
      </div>
    </section>
  )
}

/* ---------------- Contact: painted night, shooting stars, fireflies, click to throw a paper plane ---------------- */
function NightFx() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const rm = reduce()
    let W = 0, H = 0, flies = [], shoots = [], stars = [], raf, running = false
    const mouse = { x: -999, y: -999 }
    const size = () => {
      const r = cv.getBoundingClientRect(), D = Math.min(2, devicePixelRatio || 1)
      W = r.width; H = r.height; cv.width = W * D; cv.height = H * D; ctx.setTransform(D, 0, 0, D, 0, 0)
      flies = Array.from({ length: 18 }, () => ({ x: Math.random() * W, y: H * (0.45 + Math.random() * 0.45), vx: 0, vy: 0, p: Math.random() * 7 }))
      // stars in the open sky above the painted clouds; denser and brighter toward the top
      stars = Array.from({ length: Math.round((W * H) / 9000) }, () => {
        const y = Math.pow(Math.random(), 1.6) * H * 0.55
        return { x: Math.random() * W, y, r: Math.random() < 0.08 ? 1.5 : 0.5 + Math.random() * 0.7, a: 0.9 - (y / (H * 0.55)) * 0.6, p: Math.random() * 7, sp: 0.6 + Math.random() * 1.8 }
      })
    }
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H)
      const s = t / 1000
      for (const st of stars) {
        ctx.globalAlpha = st.a * (rm ? 0.8 : 0.55 + 0.45 * Math.sin(s * st.sp + st.p))
        ctx.fillStyle = '#f4efff'; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7); ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!rm && Math.random() < 0.01) shoots.push({ x: Math.random() * W * 0.8, y: Math.random() * H * 0.3, l: 0 })
      shoots = shoots.filter((m) => m.l < 1)
      for (const m of shoots) {
        m.l += 0.02
        const x = m.x + m.l * 280, y = m.y + m.l * 130
        const g = ctx.createLinearGradient(x - 100, y - 46, x, y)
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${1 - m.l})`)
        ctx.strokeStyle = g; ctx.lineWidth = 1.6
        ctx.beginPath(); ctx.moveTo(x - 100, y - 46); ctx.lineTo(x, y); ctx.stroke()
      }
      for (const f of flies) {
        const dx = mouse.x - f.x, dy = mouse.y - f.y, d = Math.hypot(dx, dy)
        if (d < 260 && d > 1) { f.vx += (dx / d) * 0.05; f.vy += (dy / d) * 0.05 }
        f.vx += Math.sin(s + f.p) * 0.02; f.vy += Math.cos(s * 0.8 + f.p) * 0.02
        f.vx *= 0.96; f.vy *= 0.96; f.x += f.vx; f.y += f.vy
        if (f.x < 0) f.x = W; if (f.x > W) f.x = 0; f.y = Math.min(H, Math.max(H * 0.3, f.y))
        const a = 0.4 + 0.6 * Math.abs(Math.sin(s * 2 + f.p))
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 11)
        g.addColorStop(0, `rgba(232,255,138,${a})`); g.addColorStop(1, 'rgba(232,255,138,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 11, 0, 7); ctx.fill()
      }
      if (running) raf = requestAnimationFrame(draw)
    }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(draw) }
      else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf) }
    })
    const sec = cv.parentElement
    const move = (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const leave = () => { mouse.x = mouse.y = -999 }
    size(); io.observe(cv)
    addEventListener('resize', size); sec.addEventListener('pointermove', move); sec.addEventListener('pointerleave', leave)
    return () => {
      running = false; cancelAnimationFrame(raf); io.disconnect()
      removeEventListener('resize', size); sec.removeEventListener('pointermove', move); sec.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <canvas className="stars" ref={ref} aria-hidden="true" />
}

// ---------- footer pieces ----------
// live Mumbai time (IST) — continues the page's time-of-day story and helps other time zones
function MumbaiClock() {
  const fmt = () => {
    const d = new Date()
    const time = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
    const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(d))
    const night = h >= 23 || h < 7
    return { time: time.replace(/\s?(am|pm)/i, (m) => ` ${m.trim().toLowerCase()}`), night,
      note: night ? 'Probably asleep. I’ll reply in the morning' : h < 10 ? 'Gym first, then code' : 'Probably coding right now' }
  }
  const [t, setT] = useState(fmt)
  useEffect(() => { const id = setInterval(() => setT(fmt()), 20000); return () => clearInterval(id) }, [])
  return (
    <div className="sf-clock">
      <span className={`sfc-ico ${t.night ? 'night' : ''}`} aria-hidden="true" />
      <span className="sfc-txt"><b>{t.time} <small>IST · Mumbai</small></b><span>{t.note}</span></span>
    </div>
  )
}

// back to top: a launch pad. The ring fills with scroll progress, and on click the paper plane takes off before the page flies up.
const RING = 2 * Math.PI * 21
function PlaneTop() {
  const [flying, setFlying] = useState(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll()
  useMotionValueEvent(scrollYProgress, 'change', (v) => { ref.current?.style.setProperty('--p', v.toFixed(3)) })
  const go = (e) => {
    e.preventDefault()
    if (flying) return
    setFlying(true)
    setTimeout(() => {
      const a = document.createElement('a'); a.dataset.go = 'top'; a.href = '#top'; document.body.appendChild(a); a.click(); a.remove()
    }, reduce() ? 0 : 560)
    setTimeout(() => setFlying(false), 1700)
  }
  return (
    <a href="#top" ref={ref} className={`sf-top ${flying ? 'flying' : ''}`} onClick={go} data-cursor="Fly back up" aria-label="Back to top">
      <span className="st-txt" aria-hidden="true">Back to top</span>
      <span className="st-pad" aria-hidden="true">
        <svg className="st-ring" viewBox="0 0 50 50"><circle cx="25" cy="25" r="21" className="st-track" /><circle cx="25" cy="25" r="21" className="st-prog" style={{ strokeDasharray: RING, '--ring': RING }} /></svg>
        <i className="st-trail" />
        <svg className="st-plane" viewBox="-16 -10 34 20"><g transform="rotate(-90)"><path d="M-12 -7 L14 0 L-12 7 L-7 0 Z" fill="currentColor" /><path d="M-7 0 L14 0" stroke="#12142a" strokeWidth="1.2" /></g></svg>
      </span>
    </a>
  )
}

export function Contact() {
  const [copied, setCopied] = useState(false)
  const secRef = useRef(null)
  const skyRef = useRef(null)
  // the painted sky spans only the area above the footer, so its cloud bank lands behind the skyline
  useEffect(() => {
    const sec = secRef.current, foot = sec.querySelector('.sf-water'), sky = skyRef.current
    const fit = () => {
      sky.style.height = `${foot.offsetTop}px`
      // where the painted moon lands under object-fit: cover / object-position: 62% 100%,
      // so the glow can sit exactly on it
      const bw = sky.clientWidth, bh = foot.offsetTop, sc = Math.max(bw / 1672, bh / 941)
      const dx = (bw - 1672 * sc) * 0.62, dy = bh - 941 * sc
      sky.style.setProperty('--moon-x', `${dx + MOON.x * 1672 * sc}px`)
      sky.style.setProperty('--moon-y', `${dy + MOON.y * 941 * sc}px`)
      sky.style.setProperty('--moon-r', `${MOON.r * 1672 * sc}px`)
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(sec)
    return () => ro.disconnect()
  }, [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      location.href = `mailto:${profile.email}`
    }
  }
  // click the night sky to throw a paper plane
  const throwPlane = (e) => {
    if (e.target.closest('a, button')) return
    const sec = secRef.current, r = sec.getBoundingClientRect()
    const el = document.createElement('div')
    el.className = 'thrown'
    el.innerHTML = '<svg viewBox="-16 -10 34 20"><path d="M-12 -7 L14 0 L-12 7 L-7 0 Z" fill="#fff"/><path d="M-7 0 L14 0" stroke="#bbb" stroke-width="1"/></svg>'
    el.style.left = `${e.clientX - r.left}px`; el.style.top = `${e.clientY - r.top}px`
    sec.appendChild(el)
    const tl = createTimeline({ onComplete: () => el.remove() })
    tl.add(el, { scale: [0.4, 1.2], rotate: [-10, -24], duration: 220, ease: 'outQuad' })
      .add(el, { translateX: 900, translateY: -520, rotate: -30, scale: 0.3, opacity: [1, 0], duration: 1700, ease: 'inQuad' })
  }
  return (
    <footer className="contact" id="contact" ref={secRef} onClick={throwPlane}>
      <div className="night-sky" ref={skyRef}>
        <div className="ns-pan">
          <img src={nightImg} alt="" width="1672" height="941" loading="lazy" decoding="async" />
          <i className="moon-glow" />
        </div>
        <Birds variant="night" />
        <i className="ns-mist m1" /><i className="ns-mist m2" />
      </div>
      <NightFx />
      <div className="contact-inner">
        <SectionHead index="06" label="Contact · after hours" light title={<>Building something?<br /><em>Let’s ship it together.</em></>} />
        <div className="contact-actions" data-aos="fade-up" data-aos-delay="140">
          <a href={`mailto:${profile.email}`} className="btn btn-lime" data-cursor="Write to me"><FiMail /> Say hello</a>
          <button className="copy-btn glass-dark" onClick={copy} aria-live="polite">
            {copied ? <><FiCheck /> Copied</> : <><FiCopy /> {profile.email}</>}
          </button>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="icon-btn glass-dark" aria-label="LinkedIn"><FiLinkedin /></a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="icon-btn glass-dark" aria-label="GitHub"><FiGithub /></a>
        </div>
        <Note arrow="up" className="contact-note">I reply fast, promise</Note>
        <p className="tip mono" data-aos="fade" data-aos-delay="300">Tip: click the sky to throw a paper plane · type “hire” anywhere</p>
      </div>
      <Skyline />
      {/* Marine Drive: the city reflected in the water the footer sits on */}
      <div className="sf-water" aria-hidden="true">
        <img src={skylineReflect} alt="" width="2132" height="465" loading="lazy" decoding="async" />
        <i className="sf-ripples" />
      </div>
      <div className="site-footer">
        <div className="sf-brand">
          <a href="#top" data-go="top" className="sf-logo" aria-label="Back to top"><img className="avatar" src={avatarImg} alt="" width="36" height="36" loading="lazy" decoding="async" />{profile.name}</a>
          <p>{profile.role} · {profile.location}</p>
          <MumbaiClock />
          <a href={`mailto:${profile.email}`} className="sf-mail" data-cursor="Write to me"><FiMail /> {profile.email} <FiArrowUpRight className="arrow" /></a>
        </div>
        <nav className="sf-col" aria-label="Site">
          <h4 className="mono">Site</h4>
          {FOOTER_SITE.map(([label, target], i) => <a key={label} href={target.startsWith('/') ? target : target.startsWith('#') ? target : '#work'} data-go={target.startsWith('/') ? undefined : target}><span className="sf-n mono">0{i + 1}</span>{label}</a>)}
        </nav>
        <nav className="sf-col" aria-label="Projects">
          <h4 className="mono">Projects</h4>
          {cases.filter((c) => c.url).map((c) => (
            <a key={c.id} href={c.url} target="_blank" rel="noreferrer">{c.title} <FiArrowUpRight className="arrow" /></a>
          ))}
          {extras.map((x) => <a key={x.title} href={x.url} target="_blank" rel="noreferrer">{x.title} <FiArrowUpRight className="arrow" /></a>)}
        </nav>
        <nav className="sf-col" aria-label="Elsewhere">
          <h4 className="mono">Elsewhere</h4>
          <a href={profile.github} target="_blank" rel="noreferrer"><FiGithub /> GitHub</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer"><FiLinkedin /> LinkedIn</a>
          <a href={`mailto:${profile.email}`}><FiMail /> Email</a>
          <a href={`tel:${profile.phone.replace(/-/g, '')}`}><FiPhone /> {profile.phone}</a>
        </nav>
      </div>
      <div className="footer-bar mono">
        <span className="fb-copy"><span className="fb-c" aria-hidden="true">©</span><span className="sr-only">Copyright</span> {YEAR} {profile.name}</span>
        <span className="fb-mid">Built in Mumbai · status <code className="fb-ok">200 OK</code> since 2022</span>
        <PlaneTop />
      </div>
    </footer>
  )
}

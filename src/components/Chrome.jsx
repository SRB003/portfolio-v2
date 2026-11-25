import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useMotionValueEvent } from 'framer-motion'
import { animate, createTimeline, stagger } from 'animejs'
import { profile } from '../data'
import avatarImg from '../assets/avatar.webp'

const fine = () => typeof window !== 'undefined' && matchMedia('(pointer: fine)').matches

/* ---------- cursor with a label pill for [data-cursor] ---------- */
export function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100)
  // slight glide, like an agent steering the pointer
  const sx = useSpring(x, { stiffness: 900, damping: 55 }), sy = useSpring(y, { stiffness: 900, damping: 55 })
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const [ripple, setRipple] = useState(0)
  const [shown, setShown] = useState(false)
  const [enabled] = useState(fine)

  useEffect(() => {
    if (!enabled) return
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); setShown(true) }
    const over = (e) => {
      const t = e.target.closest('[data-cursor], a, button, [role="button"]')
      setHover(!!t)
      if (!t) return setLabel('')
      const own = t.dataset.cursor
      const txt = (t.getAttribute('aria-label') || t.textContent || '').trim().replace(/\s+/g, ' ')
      const short = txt.length > 0 && txt.length <= 28 ? txt : ''
      setLabel(own || (t.tagName === 'A' ? (short ? `Open ${short}` : 'Open link') : short || 'Click'))
    }
    const press = () => { setDown(true); setRipple((r) => r + 1) }
    const release = () => setDown(false)
    const leave = () => setShown(false)
    addEventListener('pointermove', move); addEventListener('pointerover', over)
    addEventListener('pointerdown', press); addEventListener('pointerup', release)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      removeEventListener('pointermove', move); removeEventListener('pointerover', over)
      removeEventListener('pointerdown', press); removeEventListener('pointerup', release)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <motion.div className={`cursor ${hover ? 'hover' : ''} ${down ? 'down' : ''} ${shown ? '' : 'away'}`} style={{ x: sx, y: sy }} aria-hidden="true">
      <i className="cursor-ring" />
      {ripple > 0 && <i key={ripple} className="cursor-ripple" />}
      <svg className="cursor-arrow" viewBox="0 0 22 22" width="22" height="22">
        <defs>
          <linearGradient id="cursorFill" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#e58a6b" />
            <stop offset="1" stopColor="#c9603f" />
          </linearGradient>
        </defs>
        <path d="M3 2.2c0-.6.7-.9 1.1-.5l13.2 11.4c.5.4.2 1.2-.4 1.2h-5.6l3.1 5.9c.2.4 0 .8-.3 1l-1.7.9c-.4.2-.8 0-1-.3l-3.1-6-3.9 3.8c-.4.4-1.2.1-1.2-.5Z" />
      </svg>
      <AnimatePresence>
        {label && (
          <motion.span key={label} className="cursor-label" initial={{ opacity: 0, scale: 0.92, x: -4 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 600, damping: 34, delay: 0.04 }}>
            <i className="cursor-dot" />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ---------- design-tool style selection box on [data-sel] ---------- */
export function Selection() {
  const box = useRef(null)
  const [enabled] = useState(fine)
  useEffect(() => {
    if (!enabled) return
    let el = null, raf
    const place = () => {
      if (!el) return
      const r = el.getBoundingClientRect(), b = box.current
      b.style.transform = `translate(${r.left - 6}px, ${r.top - 6}px)`
      b.style.width = `${r.width + 12}px`; b.style.height = `${r.height + 12}px`
      raf = requestAnimationFrame(place)
    }
    const over = (e) => {
      const t = e.target.closest('[data-sel]')
      if (t === el) return
      cancelAnimationFrame(raf)
      el = t
      if (el) { box.current.querySelector('b').textContent = el.dataset.sel; box.current.classList.add('on'); place() }
      else box.current.classList.remove('on')
    }
    addEventListener('pointerover', over)
    return () => { removeEventListener('pointerover', over); cancelAnimationFrame(raf) }
  }, [enabled])
  if (!enabled) return null
  return <div className="sel" ref={box} aria-hidden="true"><i /><i /><i /><i /><b /></div>
}

/* ---------- glass pill nav ---------- */
const LINKS = [['Work', 'work'], ['Path', '#path'], ['About', '#about'], ['Research', '#research'], ['Contact', '#contact']]

export function Nav({ go }) {
  const [open, setOpen] = useState(false)
  const click = (e, h) => { e.preventDefault(); setOpen(false); go(h) }
  const navRef = useRef(null)
  // close on outside tap / Escape
  useEffect(() => {
    if (!open) return
    const out = (e) => { if (!navRef.current?.contains(e.target)) setOpen(false) }
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', out); addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', out); removeEventListener('keydown', key) }
  }, [open])
  return (
    <nav className="nav" aria-label="Primary" ref={navRef}>
      <a className="me glass" href="#top" onClick={(e) => click(e, 'top')} data-cursor="Back to top">
        <img className="avatar" src={avatarImg} alt="" width="36" height="36" decoding="async" />
        <span className="me-txt"><b>{profile.name}</b><small>{profile.role}</small></span>
      </a>
      <div className="links glass">
        {LINKS.map(([l, h]) => (
          <a key={l} href={h.startsWith('#') ? h : '#work'} onClick={(e) => click(e, h)} className="desk-only">{l}</a>
        ))}
        <a href="/projects/" className="desk-only" data-cursor="All projects">Projects</a>
        <a href={profile.github} target="_blank" rel="noreferrer" className="desk-only" data-cursor="GitHub">GitHub</a>
        <button className={`menu-toggle ${open ? 'is-open' : ''}`} type="button" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
          <span className="burger" aria-hidden="true"><i /><i /><i /></span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div className="mobile-menu" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.25 }}>
              {LINKS.map(([l, h], i) => <a key={l} href={h.startsWith('#') ? h : '#work'} onClick={(e) => click(e, h)} style={{ '--i': i }}><span className="mm-n mono">0{i + 1}</span>{l}</a>)}
              <a href="/projects/" style={{ '--i': LINKS.length }}><span className="mm-n mono">0{LINKS.length + 1}</span>All projects</a>
              <hr />
              <a href={`mailto:${profile.email}`} style={{ '--i': LINKS.length }}>Email</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ '--i': LINKS.length + 1 }}>LinkedIn</a>
              <a href={profile.github} target="_blank" rel="noreferrer" style={{ '--i': LINKS.length + 2 }}>GitHub</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

/* ---------- time-of-day dial: page runs morning → night ---------- */
const STOPS = [
  { at: 0, h: 6.5, name: 'Morning', target: 'top' },
  { at: 0.3, h: 9, name: 'Work hours', target: 'work' },
  { at: 0.6, h: 14, name: 'Afternoon', target: '#path' },
  { at: 0.8, h: 17, name: 'Golden hour', target: '#about' },
  { at: 1, h: 21.5, name: 'Night', target: '#contact' },
]
const fmt = (h) => {
  const hh = Math.floor(h), mm = Math.round(((h - hh) * 60) / 15) * 15
  const H = hh + (mm === 60 ? 1 : 0), M = mm === 60 ? 0 : mm
  return `${((H + 11) % 12) + 1}:${String(M).padStart(2, '0')} ${H >= 12 ? 'pm' : 'am'}`
}

// scroll progress → page "clock" (shared by the dial and the browser tab)
function dayAt(p) {
  let i = 1
  while (i < STOPS.length - 1 && p > STOPS[i].at) i++
  const a = STOPS[i - 1], b = STOPS[i]
  const k = Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at)))
  return { hour: a.h + (b.h - a.h) * k, name: p > 0.9 ? 'Night' : k > 0.5 ? b.name : a.name }
}

export function Dial({ go }) {
  const { scrollYProgress } = useScroll()
  const [p, setP] = useState(0)
  const [open, setOpen] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setP(Math.round(v * 200) / 200))
  const { hour, name } = dayAt(p)
  const night = hour > 19
  const ang = Math.PI * (1 - (hour - 6) / 13) // sun travels the arc 6am → 7pm
  const sx = 27 + Math.cos(ang) * 22, sy = 28 - Math.sin(Math.max(0, ang)) * 22

  return (
    <div className={`dial glass ${night ? 'is-night' : ''}`}>
      <button type="button" className="dial-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Time of day: ${name}. Open section menu.`} data-cursor="Jump through the day">
        <svg viewBox="0 0 54 30" aria-hidden="true">
          <path d="M3 28a24 24 0 0 1 48 0" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" />
          <path d="M1 28h52" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" />
          {night
            ? <path d="M27 14a7 7 0 1 0 5 11 6 6 0 1 1-5-11z" fill="#ffe7b0" />
            : <g transform={`translate(${sx} ${sy})`}><circle r="9" fill="#f4a24f" opacity=".25" /><circle r="5.5" fill="#f4a24f" /></g>}
        </svg>
        <span className="lb"><b>{fmt(hour)}</b><small>{name}</small></span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="dial-menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {STOPS.map((s) => (
              <button key={s.name} type="button" onClick={() => { setOpen(false); go(s.target) }}>
                <b>{fmt(s.h)}</b>{s.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- intro: wordmark reveals letter by letter (lime outline, then cream fill) while dawn rises ---------- */
const PRE_MIN = 2600 // ms: minimum time on screen
const PRE_YEAR = String(new Date().getFullYear()).slice(2)
const PRE_ROLES = ['Full-stack developer', 'React · Node.js · Webflow', 'Based in Mumbai', 'Full-stack developer']
const Letters = ({ text }) => text.split('').map((c, i) => <span className="pl" key={i}>{c}</span>)
export function Preloader({ onDone }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const timers = []
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('static')
      timers.push(setTimeout(onDone, 700))
      return () => timers.forEach(clearTimeout)
    }
    let alive = true, raf = 0, shown = 0, drawn = false, loaded = document.readyState === 'complete'
    const onLoad = () => { loaded = true }
    addEventListener('load', onLoad)
    timers.push(setTimeout(() => { loaded = true; drawn = true }, 7000)) // never hold the page hostage

    // counter + dawn: eases with time, holds below 100 until the page has loaded and the mark is done
    const num = el.querySelector('.pre-num'), fill = el.querySelector('.pre-line i'), sun = el.querySelector('.pre-sun')
    const t0 = performance.now()
    const exit = () => { el.classList.add('leaving'); timers.push(setTimeout(onDone, 520)) }
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / PRE_MIN)
      const target = Math.min(loaded && drawn ? 100 : 94, (1 - Math.pow(1 - t, 2.4)) * 100)
      shown += (target - shown) * 0.2
      if (target === 100 && shown > 99.4) shown = 100
      const k = shown / 100
      num.textContent = Math.round(shown)
      fill.style.transform = `scaleX(${k})`
      sun.style.left = `${shown}%`
      el.style.setProperty('--dawn', k.toFixed(3))
      if (shown === 100) { timers.push(setTimeout(exit, 300)); return }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const reveal = () => {
      if (!alive) return
      const mark = el.querySelector('.pre-mark'), letters = [...el.querySelectorAll('.pl')]
      // one continuous sheen across split letters: each letter offsets the shared gradient by its own x
      const mx = mark.getBoundingClientRect().left
      mark.style.setProperty('--ww', `${mark.offsetWidth}px`)
      letters.forEach((l) => l.style.setProperty('--ox', `${l.getBoundingClientRect().left - mx}px`))
      el.classList.add('ready')
      const sheen = { x: -2 }
      const tl = createTimeline({ onComplete: () => { drawn = true } })
      tl.add(letters, { translateY: ['0.5em', '0em'], opacity: [0, 1], filter: ['blur(14px)', 'blur(0px)'], duration: 900, delay: stagger(50), ease: 'outExpo' }, 0)
        .add(el.querySelector('.pm-dot'), { scale: [0, 1.3, 1], duration: 600, ease: 'outBack(2.2)' }, '-=450')
        .add(el.querySelectorAll('.pre-reveal'), { opacity: [0, 1], translateY: [10, 0], duration: 600, ease: 'outExpo' }, '-=500')
        .add(sheen, { x: -0.2, duration: 1100, ease: 'inOutSine', onUpdate: () => mark.style.setProperty('--sx', sheen.x.toFixed(3)) }, '-=600')
    }
    // wait for the display fonts so the wordmark never swaps mid-animation (but don't wait forever)
    const fonts = document.fonts ? Promise.all([document.fonts.load('800 100px "Bricolage Grotesque"'), document.fonts.load('italic 100px "Instrument Serif"')]) : Promise.resolve()
    Promise.race([fonts, new Promise((r) => setTimeout(r, 900))]).then(reveal)

    return () => { alive = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); removeEventListener('load', onLoad) }
  }, [onDone])

  return (
    <motion.div className="preloader" ref={ref} role="status" aria-label={`Loading ${profile.name}’s portfolio`} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}>
      <i className="pre-dawn" aria-hidden="true" />
      <span className="pre-corner tl mono" aria-hidden="true">Portfolio ’{PRE_YEAR}</span>
      <span className="pre-corner tr mono" aria-hidden="true">{profile.location.split(',')[0]}, IN · 19.07° N</span>
      <div className="pre-mark" aria-hidden="true">
        <span className="pm-word"><Letters text={profile.firstName} /></span>
        <span className="pm-word"><Letters text={profile.name.split(' ')[1]} /><i className="pm-dot" /></span>
      </div>
      <div className="pre-roles mono pre-reveal" aria-hidden="true">
        <span className="pr-k">Now loading</span>
        <span className="pr-win"><span className="pr-col">{PRE_ROLES.map((r, i) => <span key={i}>{r}</span>)}</span></span>
      </div>
      <div className="pre-count" aria-hidden="true">
        <span className="mono"><span className="pre-num">0</span> %</span>
        <span className="pre-line"><i /><b className="pre-sun" /></span>
        <span className="pre-hint mono">Sunrise in progress</span>
      </div>
    </motion.div>
  )
}

/* ---------- type "hire" anywhere for a one-screen summary ---------- */
export function HireCard() {
  const [open, setOpen] = useState(false)
  const card = useRef(null)
  useEffect(() => {
    let buf = ''
    const key = (e) => {
      if (e.target.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'Escape') return setOpen(false)
      buf = (buf + e.key.toLowerCase()).slice(-4)
      if (buf === 'hire') setOpen(true)
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [])
  useEffect(() => {
    if (!open || !card.current) return
    animate(card.current.querySelectorAll('.hire-row'), { opacity: [0, 1], translateX: [-16, 0], delay: stagger(60, { start: 200 }), duration: 600, ease: 'outExpo' })
  }, [open])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="hire-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div ref={card} className="hire-card" role="dialog" aria-modal="true" aria-label="Hiring summary"
            initial={{ y: 40, scale: 0.94, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }} onClick={(e) => e.stopPropagation()}>
            <span className="mono kicker">For hiring leads · 20-second read</span>
            <h3>{profile.name}, {profile.role}</h3>
            <div className="hire-row"><b>Now</b><span>Junior Developer, Epoch Branding Resources (June 2025 to present)</span></div>
            <div className="hire-row"><b>Shipped</b><span>Aertrip Holidays booking & payments · Made Again CMS site</span></div>
            <div className="hire-row"><b>Stack</b><span>React, Node.js, REST APIs, PostgreSQL / MySQL, Webflow, Git</span></div>
            <div className="hire-row"><b>Education</b><span>B.Tech Computer Engineering, CGPA 9.1 (2025)</span></div>
            <div className="hire-row"><b>Based</b><span>{profile.location}</span></div>
            <div className="hire-actions">
              <a className="btn" href={`mailto:${profile.email}`}>Email Sahil</a>
              <a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Close · Esc</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

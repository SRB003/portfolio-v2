import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { FiArrowLeft, FiArrowUpRight, FiGrid, FiList } from 'react-icons/fi'
import { cases, profile } from '../data'
import { Card } from '../components/Stage'
import { Cursor } from '../components/Chrome'
import { Banner } from '../art/Art'
import avatarImg from '../assets/avatar.webp'

/* All shipped projects on one page. Everything is driven by data.js `cases`: a new entry shows
   up here (and on the home rail) with no other change, and a new `kind` gets its own filter. */

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const ease = [0.2, 0.8, 0.2, 1]

function CountUp({ to, pad = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (reduce()) { el.textContent = String(to).padStart(pad, '0'); return }
    let raf, t0
    const step = (t) => {
      t0 ??= t
      const k = Math.min(1, (t - t0) / 1100)
      el.textContent = String(Math.round(to * (1 - (1 - k) ** 3))).padStart(pad, '0')
      if (k < 1) raf = requestAnimationFrame(step)
    }
    const id = setTimeout(() => { raf = requestAnimationFrame(step) }, 350)
    return () => { clearTimeout(id); cancelAnimationFrame(raf) }
  }, [to, pad])
  return <b ref={ref}>{String(0).padStart(pad, '0')}</b>
}

// index view: one row per project; on desktop a preview of the banner follows the pointer
function IndexList({ list }) {
  const [hot, setHot] = useState(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 28 }), sy = useSpring(y, { stiffness: 260, damping: 28 })
  const fine = useMemo(() => matchMedia('(pointer: fine)').matches, [])
  const move = (e) => { x.set(e.clientX + 24); y.set(e.clientY - 110) }
  return (
    <div className="pj-index" onPointerMove={fine ? move : undefined} onPointerLeave={() => setHot(null)}>
      <div className="pji-row pji-headrow mono" aria-hidden="true"><span>No.</span><span>Project</span><span>Kind</span><span>Stack</span><span>Year</span></div>
      {list.map(([c, i], k) => {
        const Root = c.url ? 'a' : 'div'
        return (
          <motion.div key={c.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, delay: k * 0.05, ease }}>
            <Root className="pji-row" {...(c.url ? { href: c.url, target: '_blank', rel: 'noreferrer', 'data-cursor': c.cta || 'Open' } : {})} onPointerEnter={() => setHot(c)}>
              <span className="mono pji-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="pji-t"><b>{c.title}</b><small>{c.line}</small></span>
              <span className="pji-k">{c.kind}{c.at && <i className="ebr">at {c.at}</i>}</span>
              <span className="pji-s">{c.stack.slice(0, 3).join(' · ')}</span>
              <span className="mono pji-y">{c.year}{c.url && <FiArrowUpRight />}</span>
            </Root>
          </motion.div>
        )
      })}
      {fine && (
        <AnimatePresence>
          {hot && (
            <motion.div className="pji-peek" style={{ x: sx, y: sy, backgroundColor: hot.tone }} initial={{ opacity: 0, scale: 0.85, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }} aria-hidden="true">
              <Banner name={hot.art} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export default function Projects() {
  const kinds = useMemo(() => {
    const m = new Map()
    cases.forEach((c) => m.set(c.kind || 'Other', (m.get(c.kind || 'Other') || 0) + 1))
    return [['All', cases.length], ...m]
  }, [])
  const tools = useMemo(() => [...new Set(cases.flatMap((c) => c.stack))], [])
  const [kind, setKind] = useState('All')
  const [view, setView] = useState('grid')
  const list = cases.map((c, i) => [c, i]).filter(([c]) => kind === 'All' || (c.kind || 'Other') === kind)
  const years = cases.map((c) => parseInt(c.year, 10)).filter(Boolean)
  const words = ['Everything', "I've"]

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Cursor />
      <div className="pj-bg" aria-hidden="true"><i className="pj-glow g1" /><i className="pj-glow g2" /></div>
      <header className="pj-nav">
        <a className="pj-me glass" href="/" data-cursor="Home">
          <img className="avatar" src={avatarImg} alt="" width="36" height="36" decoding="async" />
          <span><b>{profile.name}</b><small>{profile.role}</small></span>
        </a>
        <a className="pj-back glass" href="/" data-cursor="Back home"><FiArrowLeft /> Home</a>
      </header>

      <main id="main" className="pj">
        <section className="pj-head">
          <motion.div className="shead-rule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <span className="mono">Work archive</span><i /><span className="mono">{Math.min(...years)} - now</span>
          </motion.div>
          <h1>
            {words.map((w, k) => (
              <span key={w} className="pj-w"><motion.span initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.05 + k * 0.08, ease }}>{w}</motion.span></span>
            ))}
            <span className="pj-w"><motion.em initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.22, ease }}>shipped</motion.em></span>
            <motion.span className="pj-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.75, type: 'spring', stiffness: 400, damping: 14 }}>.</motion.span>
          </h1>
          <motion.div className="pj-sub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease }}>
            <p>Live products, client sites and in-house tools, all built and looked after at work. This page grows as I ship.</p>
            <div className="pj-stats">
              <div><CountUp to={cases.length} pad={2} /><span>projects</span></div>
              <div><CountUp to={cases.filter((c) => c.url).length} /><span>live links</span></div>
              <div><CountUp to={tools.length} /><span>tools used</span></div>
            </div>
          </motion.div>
        </section>

        <div className="pj-ticker" aria-label="Tools across these projects">
          <div className="pj-track">
            {[0, 1].map((r) => (
              <span key={r} aria-hidden={r === 1}>{tools.map((t) => <span key={t} className="pj-tool">{t}<i>✦</i></span>)}</span>
            ))}
          </div>
        </div>

        <div className="pj-bar">
          <div className="pj-filters" role="toolbar" aria-label="Filter projects">
            {kinds.map(([k, n]) => (
              <button key={k} type="button" className={k === kind ? 'on' : ''} aria-pressed={k === kind} onClick={() => setKind(k)}>
                {k === kind && <motion.i layoutId="pj-pill" className="pj-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="pj-fl">{k}</span> <span className="mono">{n}</span>
              </button>
            ))}
          </div>
          <div className="pj-views" role="group" aria-label="Layout">
            <button type="button" className={view === 'grid' ? 'on' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')} data-cursor="Cards"><FiGrid /><span>Cards</span></button>
            <button type="button" className={view === 'index' ? 'on' : ''} aria-pressed={view === 'index'} onClick={() => setView('index')} data-cursor="Index"><FiList /><span>Index</span></button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div key="grid" className="pj-grid" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <AnimatePresence mode="popLayout">
                {list.map(([c, i], k) => (
                  <motion.div key={c.id} className="pj-cell" layout initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.55, delay: k * 0.06, ease }}>
                    <Card c={c} i={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="index" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <IndexList list={list} />
            </motion.div>
          )}
        </AnimatePresence>

        <section className="pj-cta">
          <span className="mono">{String(cases.length + 1).padStart(2, '0')} · Next up</span>
          <h2>Got something worth <em>shipping</em>?</h2>
          <p>I build the database, the API and the interface, then keep it running.</p>
          <div className="pj-cta-row">
            <a className="btn btn-lime" href={`mailto:${profile.email}`} data-cursor="Say hello">Say hello <FiArrowUpRight /></a>
            <a className="pj-cta-alt" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <FiArrowUpRight /></a>
          </div>
        </section>
      </main>

      <footer className="pj-foot">
        <span className="mono">© {new Date().getFullYear()} {profile.name}</span>
        <span className="pj-foot-links">
          <a href="/">Home</a>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub <FiArrowUpRight /></a>
        </span>
      </footer>
    </>
  )
}

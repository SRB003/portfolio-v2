import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Preloader, Cursor, Nav, Dial, Selection, HireCard } from './components/Chrome'
import { Stage } from './components/Stage'
import { Path, About, Research, Sunset, Contact } from './components/Sections'
import { SideQuests } from './components/Scrap'

// Paper colour warms through the "day" as you scroll.
const PAPER = [[0, '#f8f3ea'], [0.4, '#f9f0e3'], [0.62, '#f8eadb'], [0.8, '#f5e0cf'], [1, '#efd2c0']]
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const ramp = (t) => {
  for (let i = 1; i < PAPER.length; i++) {
    if (t <= PAPER[i][0]) {
      const [a, ca] = PAPER[i - 1], [b, cb] = PAPER[i]
      const k = (t - a) / (b - a), A = hex(ca), B = hex(cb)
      return `rgb(${A.map((v, j) => Math.round(v + (B[j] - v) * k))})`
    }
  }
  return PAPER.at(-1)[1]
}

// the full laptop dive runs everywhere (phones too); only reduced-motion visitors get the stacked layout
const STACK_QUERY = '(prefers-reduced-motion: reduce)'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [stack, setStack] = useState(() => matchMedia(STACK_QUERY).matches)
  const lenis = useRef(null)
  const done = useCallback(() => setLoading(false), [])
  const { scrollYProgress } = useScroll()

  const paperStep = useRef(-1)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const q = Math.round(v * 120)
    if (q === paperStep.current) return
    paperStep.current = q
    document.body.style.backgroundColor = ramp(q / 120)
  })

  useEffect(() => {
    const mq = matchMedia(STACK_QUERY)
    const on = () => setStack(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ lerp: 0.09, smoothWheel: true })
    lenis.current = l
    let raf
    const loop = (t) => { l.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); l.destroy(); lenis.current = null }
  }, [])

  // AOS for section reveals
  useEffect(() => {
    AOS.init({ duration: 900, easing: 'ease-out-cubic', once: true, offset: 80, disable: () => matchMedia('(prefers-reduced-motion: reduce)').matches })
  }, [])
  useEffect(() => { if (!loading) setTimeout(() => AOS.refreshHard(), 100) }, [loading, stack])

  // pointer tilt for any [data-tilt] card
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    let cur = null
    const move = (e) => {
      const el = e.target.closest?.('[data-tilt]')
      if (cur && cur !== el) { cur.style.transform = ''; cur.classList.remove('tilting') }
      cur = el
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
      el.classList.add('tilting')
      el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`
      el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`); el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
    }
    addEventListener('pointermove', move, { passive: true })
    return () => removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', loading)
    if (loading) lenis.current?.stop()
    else lenis.current?.start()
  }, [loading])

  const go = useCallback((target) => {
    let y
    if (target === 'top') y = 0
    else if (target === 'work') {
      const st = document.getElementById('stage')
      y = stack
        ? document.getElementById('work').getBoundingClientRect().top + scrollY - 20
        : st.offsetTop + (st.offsetHeight - innerHeight) * 0.37
    } else {
      const el = document.querySelector(target)
      if (!el) return
      y = el.getBoundingClientRect().top + scrollY
    }
    if (lenis.current) lenis.current.scrollTo(y, { duration: 1.6 })
    else scrollTo({ top: y, behavior: 'smooth' })
  }, [stack])

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[data-go]')
      if (!a) return
      e.preventDefault()
      go(a.dataset.go)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [go])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <AnimatePresence>{loading && <Preloader onDone={done} />}</AnimatePresence>
      <Cursor />
      <Selection />
      <Nav go={go} />
      <main id="main">
        <Stage key={stack ? 's' : 'd'} ready={!loading} stack={stack} onJump={() => go('work')} />
        <Path />
        <About />
        <Research />
        <SideQuests />
        <Sunset />
      </main>
      <Contact />
      <Dial go={go} />
      <HireCard />
    </>
  )
}

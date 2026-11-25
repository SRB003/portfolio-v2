import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { Banner } from '../art/Art'
import { cases, profile } from '../data'
import { Note } from './Scrap'
import { Lottie, SCROLL } from '../fx/Lottie'
import skyImg from '../assets/hero-sky.webp'
import deskImg from '../assets/hero-desk.webp'
import Birds from '../fx/Birds'

// measured in the source art (fractions of each image)
// laptop display corners in hero-desk.webp source px (TL, TR, BR, BL): it's tilted ~3° and in
// perspective, so content is warped onto these exact corners rather than an axis-aligned box
const QUAD = [[701, 304], [1055, 322], [1033, 540], [686, 522]]
const DESK_SRC_W = 1672
const FILL = [1000, 622] // layout size of .screen-fill before it's warped onto QUAD (display aspect)
const DESK_SUN = { x: 0.1465, y: 0.351 }
const SKY_SUN = { x: 0.1435, y: 0.531 }
const SKY_AR = 941 / 1672

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t) => t * t * (3 - 2 * t)
const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
const rectPts = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]]
// bilinear point inside a TL,TR,BR,BL quad
const inQuad = (q, u, v) => lerp2(lerp2(q[0], q[1], u), lerp2(q[3], q[2], u), v)

// projective transform mapping 4 src points onto 4 dst points, as a CSS matrix3d (origin 0 0)
function warp(src, dst) {
  const A = [], b = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v)
  }
  for (let c = 0; c < 8; c++) {
    let p = c
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    ;[A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]]
    for (let r = 0; r < 8; r++) {
      if (r === c) continue
      const f = A[r][c] / A[c][c]
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]
      b[r] -= f * b[c]
    }
  }
  const h = b.map((v, i) => v / A[i][i])
  return `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`
}

const HEADLINE = 'I build web products|people rely on.'

// host shown in the card's browser frame; private client work gets a label instead of a URL
const hostOf = (c) => (c.host ? c.host : c.url.includes('linkedin.com') ? 'client projects · private' : new URL(c.url).host.replace(/^www\./, ''))

export function Card({ c, i }) {
  const linked = !!c.url
  const live = linked && !c.url.includes('linkedin.com')
  const Root = linked ? 'a' : 'div'
  const link = linked ? { href: c.url, target: '_blank', rel: 'noreferrer', 'data-cursor': c.cta || (live ? `Visit ${hostOf(c)}` : `Open ${c.title}`) } : {}
  return (
    <Root className={`card ${linked ? '' : 'card-private'}`} {...link} data-sel={`<Card /> · ${c.id}`}>
      <div className="card-art" style={{ backgroundColor: c.tone }}>
        <div className="card-chrome">
          <span className="cc-dots"><i /><i /><i /></span>
          <span className="cc-url mono">{(live || c.host) && <span className={`cc-lock ${linked ? '' : 'nda'}`} aria-hidden="true" />}{hostOf(c)}</span>
          <span className={`cc-live ${c.status ? 'verified' : live ? '' : 'ongoing'}`}><b />{c.status || (live ? 'Live' : 'Ongoing')}</span>
        </div>
        <div className="card-banner"><Banner name={c.art} /></div>
        {linked && <span className="card-visit">{c.cta || (live ? 'Visit site' : 'View profile')} <FiArrowUpRight /></span>}
      </div>
      <div className="card-body">
        <div className="card-top">
          <span className="mono ct-l">{String(i + 1).padStart(2, '0')} · {c.org}{c.at && <b className="ebr" title={c.atFull}>at {c.at}</b>}</span>
          <span className="mono">{c.year}</span>
        </div>
        <h3>{c.title} {linked && <FiArrowUpRight className="arrow" />}</h3>
        <p>{c.line}</p>
        <div className="card-facts">
          {c.facts.map(([v, l]) => (
            <div key={l}><b>{v}</b><span>{l}</span></div>
          ))}
        </div>
        <ul className="chips">{c.stack.map((st) => <li key={st}>{st}</li>)}</ul>
      </div>
    </Root>
  )
}

// the open slot at the end of the rail: same anatomy as a project card, still being sketched
const SLOT_DOMAINS = ['your-startup.com', 'your-saas.app', 'your-brand.in', 'your-next-idea.dev']
const SLOT_YEAR = new Date().getFullYear()
export function NextCard() {
  const url = useRef(null)
  useEffect(() => {
    const el = url.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let d = 0, n = 0, dir = 1, t = 0
    const tick = () => {
      const w = SLOT_DOMAINS[d]
      n += dir
      el.textContent = w.slice(0, n)
      let wait = dir > 0 ? 70 : 35
      if (dir > 0 && n === w.length) { dir = -1; wait = 1600 }
      else if (dir < 0 && n === 0) { dir = 1; d = (d + 1) % SLOT_DOMAINS.length; wait = 350 }
      t = setTimeout(tick, wait)
    }
    t = setTimeout(tick, 600)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="card card-slot" data-sel="<Card /> · your-project">
      <div className="card-art slot-art">
        <div className="card-chrome">
          <span className="cc-dots"><i /><i /><i /></span>
          <span className="cc-url mono"><span ref={url}>{SLOT_DOMAINS[0]}</span><i className="slot-caret" aria-hidden="true" /></span>
          <span className="cc-live slot-open"><b />Slot open</span>
        </div>
        <div className="slot-canvas" aria-hidden="true">
          <span className="sk sk-nav" /><span className="sk sk-h1" /><span className="sk sk-h2" /><span className="sk sk-btn" />
          <span className="sk sk-c1" /><span className="sk sk-c2" /><span className="sk sk-c3" />
          <span className="slot-plus"><i /></span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-top">
          <span className="mono ct-l">{String(cases.length + 1).padStart(2, '0')} · Next project</span>
          <span className="mono">{SLOT_YEAR}</span>
        </div>
        <h3><em>Yours,</em> next.</h3>
        <p>Bring the idea. I’ll take it from spec to a fast, reliable live product, and stay on for support.</p>
        <div className="card-facts">
          <div><b>Spec → Live</b><span>end to end</span></div>
          <div><b>Open</b><span>to new roles</span></div>
        </div>
        <div className="slot-actions">
          <a className="slot-cta" href={`mailto:${profile.email}`} data-cursor="Say hello">Say hello <i><FiArrowUpRight /></i></a>
          <a className="slot-alt" href={profile.linkedin} target="_blank" rel="noreferrer" data-cursor="LinkedIn">LinkedIn</a>
        </div>
      </div>
    </div>
  )
}

// paper plane that flies over the rail and leaves a dotted trail
function RailPlane({ planeRef, trailRef }) {
  return (
    <svg className="rail-plane" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
      <path ref={trailRef} d="M0 70 C 120 20, 220 90, 340 50 S 560 10, 680 55 S 880 85, 1000 40" fill="none" stroke="#23292c" strokeOpacity=".35" strokeWidth="2" strokeDasharray="1 9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <g ref={planeRef}>
        <path d="M-14 -8 L16 0 L-14 8 L-8 0 Z" fill="#fff" stroke="#23292c" strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d="M-8 0 L16 0" stroke="#23292c" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  )
}

function WorkInner({ trackRef, barRef, planeRef, trailRef, stack }) {
  return (
    <>
      <div className="wtop">
        <div className="shead-rule"><span className="mono">01</span><i /><span className="mono">Selected work · 2025 - 2026</span></div>
        <h2 data-sel="<h2> · Selected work">Products I've <em>shipped</em>.</h2>
        <Note arrow="down-left" className="work-note">all live, go click them!</Note>
        <p>Live products I helped design, built and still maintain. Scroll to fly through.</p>
      </div>
      {!stack && <RailPlane planeRef={planeRef} trailRef={trailRef} />}
      <div className="track" ref={trackRef}>
        {cases.map((c, i) => <Card key={c.id} c={c} i={i} />)}
        <NextCard />
      </div>
      <div className="prog-row">
        <span className="mono prog-k">Scroll</span>
        <div className="prog"><i ref={barRef} /></div>
        <a className="mono prog-k prog-all" href="/projects/" data-cursor="See every project">All {String(cases.length).padStart(2, '0')} projects →</a>
      </div>
    </>
  )
}

// thumbnail of the work section shown on the laptop screen; mirrors the real panel's layout so
// the crossfade into it during the dive reads as one continuous image
function MiniScreen() {
  return (
    <div className="mini">
      <div className="mini-rule"><span>01</span><i /><span>Selected work</span></div>
      <b>Products I've <em>shipped</em>.</b>
      <div className="mini-cards">
        {cases.slice(0, 3).map((c, i) => (
          <span key={c.id}>
            <i style={{ backgroundColor: c.tone }}><s>0{i + 1}</s></i>
            <strong>{c.title}</strong>
            <u /><u />
          </span>
        ))}
      </div>
    </div>
  )
}

function Headline({ ready }) {
  return (
    <h1 className={ready ? 'in' : ''} data-sel="<h1> · Hero">
      {HEADLINE.split('|').map((part, j) => (
        <span key={j} className={j ? 'h-accent' : ''}>
          {part.split(' ').map((w, i) => (
            <span key={i} className="w" style={{ transitionDelay: `${0.1 + (j * 6 + i) * 0.07}s` }}>{w}&nbsp;</span>
          ))}
        </span>
      ))}
    </h1>
  )
}

export function Stage({ ready, stack, onJump }) {
  const stageRef = useRef(null)
  const viewRef = useRef(null)
  const workRef = useRef(null)
  const copyRef = useRef(null)
  const hintRef = useRef(null)
  const artRef = useRef(null)
  const rigRef = useRef(null)
  const canvasRef = useRef(null)
  const skyRef = useRef(null)
  const hazeRef = useRef(null)
  const deskRef = useRef(null)
  const trackRef = useRef(null)
  const barRef = useRef(null)
  const planeRef = useRef(null)
  const trailRef = useRef(null)
  const geo = useRef(null)

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start start', 'end end'] })

  const apply = useCallback((v) => {
    const g = geo.current
    if (!g || stack || !g.S) return
    const e = smooth(clamp(v / 0.34))
    const t = clamp((v - 0.36) / 0.58)
    viewRef.current.classList.toggle('diving', e > 0.002)

    // camera push into the laptop: sky + desk zoom together about the screen centre (geometric,
    // so the speed feels constant), drift it to the middle and untilt it so it ends square-on
    const s = Math.pow(g.S, e), a = -g.th * e, tx = g.tx * e, ty = g.ty * e
    rigRef.current.style.transform = e <= 0.002 ? 'none' : `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${a.toFixed(5)}rad) scale(${s.toFixed(5)})`

    // PERF: while moving, the sky + desk are drawn into one canvas (GPU drawImage of decoded
    // bitmaps, ~1ms) instead of making Chrome re-raster a huge transformed DOM layer every frame.
    // At rest the real <img>s take over again, so the still page is pixel-identical and crisp.
    const moving = e > 0.002 && e < 1
    artRef.current.classList.toggle('canvas-on', moving)
    // lets page-level chrome (nav glass) drop to its cheap mode while the hero is in motion
    document.documentElement.classList.toggle('hero-moving', moving)
    if (moving) {
      const ctx = g.ctx, { L: sl, T: st, W: sw, H: sh } = g.sky
      ctx.setTransform(g.D, 0, 0, g.D, 0, 0)
      ctx.translate(g.ox + tx, g.oy + ty); ctx.rotate(a); ctx.scale(s, s); ctx.translate(-g.ox, -g.oy)
      ctx.drawImage(g.skyImg, sl, st, sw, sh)
      if (g.sky.left) { ctx.save(); ctx.translate(sl, 0); ctx.scale(-1, 1); ctx.drawImage(g.skyImg, 0, st, sw, sh); ctx.restore() }
      if (g.sky.right) { ctx.save(); ctx.translate(sl + 2 * sw, 0); ctx.scale(-1, 1); ctx.drawImage(g.skyImg, 0, st, sw, sh); ctx.restore() }
      ctx.drawImage(g.deskImg, g.desk[0], g.desk[1], g.desk[2], g.desk[3])
    }

    // the work panel is a fixed window inside the screen that rides the same transform; it's the
    // pre-image of the viewport, so it lands at exactly 0,0 / scale 1 when e = 1
    const ca = Math.cos(a), sa = Math.sin(a)
    const R = ([x, y]) => {
      const dx = (x - g.ox) * s, dy = (y - g.oy) * s
      return [g.ox + tx + dx * ca - dy * sa, g.oy + ty + dx * sa + dy * ca]
    }
    const w = workRef.current.style
    const done = e >= 1
    w.transform = done ? 'none' : warp(g.vrect, g.q1.map(R))
    w.willChange = done ? 'auto' : 'transform'
    w.pointerEvents = done ? 'auto' : 'none'
    // swap the screen thumbnail for the live panel once the screen is big enough to read
    const swap = smooth(clamp((e - 0.1) / 0.16))
    // never exactly 0: an invisible-but-present panel is painted once while idle, so the first
    // frame of the dive doesn't pay for painting the whole work section (~60–90ms hitch)
    w.opacity = String(Math.max(0.001, swap))
    if (g.mini) g.mini.style.opacity = String(1 - swap)
    artRef.current.style.visibility = done ? 'hidden' : 'visible'
    hazeRef.current.style.opacity = String(clamp(1 - e * 3))

    // staggered parallax: each line of the intro leaves at its own speed
    const c = copyRef.current.style
    c.setProperty('--e', e.toFixed(4))
    c.opacity = String(clamp(1 - e * 3))
    hintRef.current.style.opacity = String(clamp(1 - e * 5))

    trackRef.current.style.transform = `translate3d(${-t * g.trackMax}px, 0, 0)`
    barRef.current.style.transform = `scaleX(${t})`

    // plane rides the trail, the trail reveals behind it
    const path = trailRef.current, plane = planeRef.current
    if (path && plane) {
      const L = path.getTotalLength(), at = clamp(t * 1.02) * L
      const p0 = path.getPointAtLength(at), p1 = path.getPointAtLength(Math.min(L, at + 2))
      const ang = (Math.atan2((p1.y - p0.y) * g.vy, (p1.x - p0.x) * g.vx) * 180) / Math.PI
      plane.setAttribute('transform', `translate(${p0.x} ${p0.y}) scale(${1 / g.vx} ${1 / g.vy}) rotate(${ang})`)
      path.style.clipPath = `inset(0 ${100 - (at / L) * 100}% 0 0)`
    }
  }, [stack])

  useMotionValueEvent(scrollYProgress, 'change', apply)

  useLayoutEffect(() => {
    const calc = () => {
      const view = viewRef.current, desk = deskRef.current
      if (!view || !desk) return
      const vw = view.clientWidth, vh = view.clientHeight
      // offset* ignore transforms, so this is the resting layout even mid-intro / mid-dive
      const dL = desk.offsetLeft, dT = desk.offsetTop, dW = desk.offsetWidth, dH = desk.offsetHeight

      // place the sky so its sun sits exactly on the desk art's sun (one sun, not two). Only size
      // it to cover vertically — mirrored copies either side fill any horizontal gap seamlessly,
      // so the cloud banks stay in frame instead of being zoomed off-screen.
      const sx = dL + DESK_SUN.x * dW, sy = dT + DESK_SUN.y * dH
      const H = 4 + Math.max(vh, sy / SKY_SUN.y, (vh - sy) / (1 - SKY_SUN.y))
      const W = H / SKY_AR
      const sk = skyRef.current.style
      sk.width = `${W}px`; sk.height = `${H}px`
      sk.left = `${sx - SKY_SUN.x * W}px`; sk.top = `${sy - SKY_SUN.y * H}px`
      // only paint the mirrored copies when there's actually a gap beside the sky
      const [lf, , rf] = skyRef.current.children
      lf.style.display = sx - SKY_SUN.x * W > 0 ? '' : 'none'
      rf.style.display = sx - SKY_SUN.x * W + W < vw ? '' : 'none'
      // warp the screen thumbnail onto the display corners (desk-local px)
      const f = dW / DESK_SRC_W
      desk.querySelector('.screen-fill').style.transform = warp(rectPts(FILL[0], FILL[1]), QUAD.map(([x, y]) => [x * f, y * f]))
      if (stack) return

      const tr = trackRef.current
      const prev = tr.style.transform
      tr.style.transform = 'none'
      const trackMax = Math.max(0, tr.scrollWidth - vw)
      tr.style.transform = prev

      // the display in view px at rest; fit a view-shaped region inside it (letterbox if needed)
      const q = QUAD.map(([x, y]) => [dL + x * f, dT + y * f])
      const len = (p, r) => Math.hypot(r[0] - p[0], r[1] - p[1])
      const sw = (len(q[0], q[1]) + len(q[3], q[2])) / 2, sh = (len(q[0], q[3]) + len(q[1], q[2])) / 2
      const [ox, oy] = inQuad(q, 0.5, 0.5)
      const th = (Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]) + Math.atan2(q[2][1] - q[3][1], q[2][0] - q[3][0])) / 2
      const tx = vw / 2 - ox, ty = vh / 2 - oy
      // pre-image of the viewport under the final rig transform (untilted, scaled by S)
      const pre = (S) => rectPts(vw, vh).map(([x, y]) => {
        const dx = (x - ox - tx) / S, dy = (y - oy - ty) / S
        return [ox + dx * Math.cos(th) - dy * Math.sin(th), oy + dx * Math.sin(th) + dy * Math.cos(th)]
      })
      // smallest zoom whose viewport pre-image sits fully inside the (skewed) display, so the
      // bezel is always past the edges when the dive completes
      const inside = (pt) => q.every((a, i) => {
        const b = q[(i + 1) % 4]
        return (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]) >= 0
      })
      let S = Math.max(vw / sw, vh / sh) * 0.9
      while (!pre(S).every(inside) && S < 200) S *= 1.01
      S *= 1.02
      const q1 = pre(S)
      rigRef.current.style.transformOrigin = `${ox}px ${oy}px`
      const D = Math.min(2, devicePixelRatio || 1), cv = canvasRef.current
      cv.width = Math.round(vw * D); cv.height = Math.round(vh * D)
      geo.current = {
        D, ctx: cv.getContext('2d'), skyImg: skyRef.current.children[1], deskImg: desk.querySelector('img'),
        sky: { L: sx - SKY_SUN.x * W, T: sy - SKY_SUN.y * H, W, H, left: lf.style.display !== 'none', right: rf.style.display !== 'none' },
        desk: [dL, dT, dW, dH],
        vw, vh, trackMax, mini: desk.querySelector('.mini'), S, th, ox, oy, tx, ty, q1, vrect: rectPts(vw, vh),
        // rail svg is 100% × 8vh of the panel (viewBox 1000×100)
        // rail svg's real layout size (computed style ignores the dive transform) → viewBox 1000×100 factors
        ...(() => { const sv = trailRef.current?.ownerSVGElement, cs = sv && getComputedStyle(sv); return { vx: (cs ? parseFloat(cs.width) : vw) / 1000, vy: (cs ? parseFloat(cs.height) : 0.08 * vh) / 100 } })(),
      }
      apply(scrollYProgress.get())
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(viewRef.current)
    ro.observe(deskRef.current)
    if (trackRef.current) ro.observe(trackRef.current)
    document.fonts?.ready.then(calc)
    return () => ro.disconnect()
  }, [stack, apply, scrollYProgress])

  useEffect(() => {
    const go = () => onJump()
    addEventListener('go-work', go)
    return () => removeEventListener('go-work', go)
  }, [onJump])

  return (
    <section id="stage" ref={stageRef} className={`${stack ? 'stack' : ''} ${ready ? 'ready' : ''}`}>
      <div className="view" ref={viewRef}>
        <div className="hero-art" ref={artRef} aria-hidden="true">
          <canvas className="hero-canvas" ref={canvasRef} />
          <div className="hero-rig" ref={rigRef}>
            <div className="hero-sky" ref={skyRef}>
              <img src={skyImg} alt="" className="flip" style={{ left: '-100%' }} decoding="async" />
              <img src={skyImg} alt="" fetchPriority="high" decoding="async" />
              <img src={skyImg} alt="" className="flip" style={{ left: '100%' }} decoding="async" />
            </div>
            <Birds />
            <div className="hero-desk" ref={deskRef}>
              <img src={deskImg} alt="" width="1672" height="941" fetchPriority="high" decoding="async" draggable="false" />
              <div className="screen-fill"><MiniScreen /></div>
            </div>
          </div>
          <i className="hero-haze" ref={hazeRef} />
          <i className="hero-grain" />
        </div>
        <div className="copy" ref={copyRef}>
          <span className="eyebrow glass"><i className="dot" /> Currently shipping in Mumbai <span className="eb-sep">·</span> <a className="eb-sub" href={`mailto:${profile.email}`} data-cursor="Say hi">say hi 👋</a></span>
          <Headline ready={ready} />
          <p>
            I'm <b>Sahil</b>, a full-stack developer in Mumbai. I design the database, build the API
            and ship the interface, then keep all three running in production.
          </p>
        </div>
        <button className="hint glass" ref={hintRef} type="button" onClick={onJump} data-cursor="Jump to work">
          <Lottie data={SCROLL} loop autoplay size={26} className="hint-lottie" /> {stack ? 'Scroll to see the work' : 'Scroll into the laptop'}
          <span className="hj">or jump to the work →</span>
        </button>
        {!stack && (
          <div className="work" id="work-panel" ref={workRef}>
            <WorkInner trackRef={trackRef} barRef={barRef} planeRef={planeRef} trailRef={trailRef} stack={stack} />
          </div>
        )}
      </div>
      {stack && (
        <div className="work" id="work" ref={workRef}>
          <WorkInner trackRef={trackRef} barRef={barRef} planeRef={planeRef} trailRef={trailRef} stack={stack} />
        </div>
      )}
    </section>
  )
}

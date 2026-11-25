import { useEffect, useRef } from 'react'

/*
  Painted sky: cumulus banks built from hundreds of soft, sun-shaded puffs (the way
  illustrators paint them), pre-rendered per layer, then drifted with parallax.
  `day` 0..1 runs morning → golden hour → night (pass `dayRef` to drive it live).
*/

const P = {
  top: ['#a9cdee', '#f6a9a0', '#121433'],
  bot: ['#f9cfc4', '#ffd9a6', '#4a3a66'],
  lit: ['#fffaf3', '#fff0d8', '#6d5f93'],
  mid: ['#f6e3ea', '#ffc9b0', '#3d3566'],
  shade: ['#cdbfe6', '#e09aa8', '#231f45'],
  sun: ['#fffbe8', '#fff1c8', '#f2efff'],
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const pal = (key, t) => {
  const [a, b, c] = P[key].map(hex)
  return t < 0.5 ? mix(a, b, t / 0.5) : mix(b, c, (t - 0.5) / 0.5)
}
const rgba = (c, a = 1) => `rgba(${c.map(Math.round).join(',')},${a})`

function rng(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

// smooth 1D value noise for tower heights
function noise1(seed) {
  const r = rng(seed), v = Array.from({ length: 64 }, r)
  return (x) => {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f)
    return v[((i % 64) + 64) % 64] * (1 - u) + v[(((i + 1) % 64) + 64) % 64] * u
  }
}

const LAYERS = [
  { seed: 7,  R: 0.11, base: 0.74, haze: 0.10, tower: 0.90, speed: 10 },
  { seed: 2,  R: 0.08, base: 0.60, haze: 0.22, tower: 0.55, speed:  7 },
]

function paintLayer(W, H, L, t, sunX) {
  const cv = document.createElement('canvas')
  const LW = Math.round(W * 1.5)
  cv.width = LW; cv.height = H
  const ctx = cv.getContext('2d')
  const r = rng(L.seed), n = noise1(L.seed)
  const lit = pal('lit', t), mid = pal('mid', t), shade = pal('shade', t)
  const sky = mix(pal('bot', t), pal('top', t), 1 - L.base)
  const hz = (c) => mix(c, sky, L.haze)
  const R = L.R * H
  const baseY = L.base * H

  // solid body so banks have no gaps underneath
  const g = ctx.createLinearGradient(0, baseY - R, 0, H)
  g.addColorStop(0, rgba(hz(mid), 0)); g.addColorStop(0.25, rgba(hz(shade)))
  g.addColorStop(1, rgba(hz(shade)))
  ctx.fillStyle = g; ctx.fillRect(0, baseY - R, LW, H)

  const puffs = []
  for (let x = -R; x < LW + R; x += R * (0.7 + r() * 0.5)) {
    const u = x / LW
    const edge = Math.pow(Math.abs(((x % W) / W) - 0.5) * 2, 2.2)
    const tower = (n(u * 9) * 0.75 + edge * 0.6) * L.tower * H
    const rows = Math.max(1, Math.min(10, Math.round(tower / (R * 0.7))))
    for (let k = 0; k <= rows; k++) {
      const kk = k / Math.max(1, rows)
      const rad = R * (1.25 - kk * 0.55) * (0.75 + r() * 0.5)
      const y = baseY - k * R * 0.72 - r() * R * 0.2
      const xx = x + (r() - 0.5) * R * 0.9 * (1 - kk * 0.5)
      puffs.push({ x: xx, y, rad, k: kk })
    }
  }
  // paint from the bottom up so upper, sun-lit puffs overlap the shaded ones
  puffs.sort((a, b) => b.y - a.y)
  for (const p of puffs) {
    const lx = p.x + p.rad * 0.28 * Math.sign(sunX * LW - p.x || 1)
    const ly = p.y - p.rad * 0.42
    const gr = ctx.createRadialGradient(lx, ly, p.rad * 0.05, p.x, p.y, p.rad)
    const top = mix(lit, mid, 0.15 * (1 - p.k))
    gr.addColorStop(0, rgba(hz(top)))
    gr.addColorStop(0.5, rgba(hz(mix(top, mid, 0.55))))
    gr.addColorStop(0.86, rgba(hz(mix(mid, shade, 0.6))))
    gr.addColorStop(1, rgba(hz(shade), 0))
    ctx.fillStyle = gr
    ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.fill()
  }
  return cv
}

function grainTile() {
  const c = document.createElement('canvas'); c.width = c.height = 160
  const x = c.getContext('2d'), d = x.createImageData(160, 160)
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() * 255
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 7
  }
  x.putImageData(d, 0, 0)
  return c
}

export default function SkyCanvas({ day = 0, sun = [0.78, 0.3], dayRef, className = '' }) {
  const ref = useRef(null)
  const props = useRef({ day, sun })
  props.current = { day, sun }

  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const grain = ctx.createPattern(grainTile(), 'repeat')
    let W = 0, H = 0, D = 1, layers = [], painted = -1, raf, visible = true, last = 0, drawnStatic = false
    const t0 = performance.now()

    const size = () => {
      const r = cv.getBoundingClientRect()
      D = Math.min(1.5, devicePixelRatio || 1)
      W = Math.max(2, r.width); H = Math.max(2, r.height)
      cv.width = Math.round(W * D); cv.height = Math.round(H * D)
      painted = -1; drawnStatic = false
    }
    const repaint = (t) => {
      const sx = props.current.sun[0]
      // paint at 1× CSS resolution — cheap; drawImage scales up to DPR
      layers = LAYERS.map((L) => paintLayer(Math.round(W * 1.5), Math.round(H), L, t, sx))
      painted = t
    }
    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      if (!visible || now - last < 33) return
      last = now
      const t = Math.min(1, Math.max(0, dayRef ? dayRef.current : props.current.day))
      const tq = Math.round(t * 40) / 40
      const animated = LAYERS.length > 0 || t > 0.62
      if (!animated && tq === painted && drawnStatic) return // static sky: nothing changed since the last paint
      if (tq !== painted) repaint(tq)
      drawnStatic = !animated
      const w = cv.width, h = cv.height
      // sky
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, rgba(pal('top', t))); g.addColorStop(1, rgba(pal('bot', t)))
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // stars
      if (t > 0.62) {
        const sr = rng(7)
        ctx.fillStyle = '#fff'
        for (let i = 0; i < 160; i++) {
          const x = sr() * w, y = sr() * h * 0.6, tw = 0.5 + 0.5 * Math.sin(now / 700 + i)
          ctx.globalAlpha = (t - 0.62) * 2.6 * tw * 0.9
          ctx.fillRect(x, y, D * (sr() > 0.9 ? 2 : 1.2), D * (sr() > 0.9 ? 2 : 1.2))
        }
        ctx.globalAlpha = 1
      }
      // sun / moon glow
      const [sx, sy] = props.current.sun
      const cx = sx * w, cy = sy * h, sc = pal('sun', t)
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.55)
      glow.addColorStop(0, rgba(sc, 0.75)); glow.addColorStop(0.12, rgba(sc, 0.35)); glow.addColorStop(1, rgba(sc, 0))
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = rgba(sc); ctx.beginPath(); ctx.arc(cx, cy, h * 0.035, 0, Math.PI * 2); ctx.fill()
      // cloud layers, drifting with parallax
      const secs = reduce ? 0 : (now - t0) / 1000
      layers.forEach((lc, i) => {
        // lc is 1× CSS pixels; scale to DPR canvas with drawImage
        const off = (secs * LAYERS[i].speed) % (lc.width - W)
        ctx.drawImage(lc, Math.round(-off * D), 0, Math.round(lc.width * D), Math.round(lc.height * D))
      })
      // painterly grain
      ctx.fillStyle = grain; ctx.fillRect(0, 0, w, h)
    }

    size()
    const ro = new ResizeObserver(size); ro.observe(cv)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(cv)
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [dayRef])

  return <canvas ref={ref} className={`sky-gl ${className}`} aria-hidden="true" />
}

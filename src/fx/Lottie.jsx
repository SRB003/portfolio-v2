import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

/*
  Hand-authored Lottie (Bodymovin JSON) icons, rendered with lottie-web's light SVG player.
  No external files: the animation data lives here, so it ships with the bundle and never 404s.
*/

const ease = { i: { x: [0.2], y: [1] }, o: { x: [0.6], y: [0] } }
const tr = { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
const layer = (ind, nm, shapes, ks = {}) => ({
  ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op: 120, st: 0, bm: 0,
  ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [24, 24, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }, ...ks },
  shapes,
})

// success: a lime disc pops in with overshoot, then the check draws itself
export const CHECK = {
  v: '5.7.4', fr: 60, ip: 0, op: 48, w: 48, h: 48, nm: 'check', ddd: 0, assets: [],
  layers: [
    layer(1, 'tick', [
      { ty: 'gr', it: [
        { ty: 'sh', ks: { a: 0, k: { i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-8, 0.5], [-2.5, 6], [8.5, -5.5]], c: false } } },
        { ty: 'st', c: { a: 0, k: [0.06, 0.27, 0.22, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3.6 }, lc: 2, lj: 2 },
        tr,
      ] },
      { ty: 'tm', s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: 14, s: [0], ...ease }, { t: 34, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 },
    ]),
    layer(2, 'disc', [
      { ty: 'gr', it: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [40, 40] } },
        { ty: 'fl', c: { a: 0, k: [0.85, 1, 0.35, 1] }, o: { a: 0, k: 100 } },
        tr,
      ] },
    ], { s: { a: 1, k: [{ t: 0, s: [0, 0, 100], ...ease }, { t: 14, s: [118, 118, 100], ...ease }, { t: 24, s: [100, 100, 100] }] } }),
  ],
}

// scroll cue: a mouse outline with a wheel dot that rolls down and fades, looping
export const SCROLL = {
  v: '5.7.4', fr: 60, ip: 0, op: 90, w: 48, h: 48, nm: 'scroll', ddd: 0, assets: [],
  layers: [
    layer(1, 'wheel', [
      { ty: 'gr', it: [
        { ty: 'rc', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [3, 7] }, r: { a: 0, k: 1.5 } },
        { ty: 'fl', c: { a: 0, k: [0.14, 0.16, 0.17, 1] }, o: { a: 0, k: 100 } },
        tr,
      ] },
    ], {
      p: { a: 1, k: [{ t: 0, s: [24, 15, 0], ...ease }, { t: 50, s: [24, 25, 0], ...ease }, { t: 90, s: [24, 25, 0] }] },
      o: { a: 1, k: [{ t: 0, s: [0], ...ease }, { t: 12, s: [100], ...ease }, { t: 46, s: [100], ...ease }, { t: 60, s: [0] }] },
    }),
    layer(2, 'mouse', [
      { ty: 'gr', it: [
        { ty: 'rc', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [18, 28] }, r: { a: 0, k: 9 } },
        { ty: 'st', c: { a: 0, k: [0.14, 0.16, 0.17, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2 },
        tr,
      ] },
    ]),
  ],
}

let playerPromise
const loadPlayer = () => (playerPromise ||= import('lottie-web/build/player/lottie_light').then((m) => m.default || m))

export const Lottie = forwardRef(function Lottie({ data, loop = false, autoplay = false, className, size = 24 }, ref) {
  const box = useRef(null)
  const anim = useRef(null)
  useImperativeHandle(ref, () => ({
    play: () => { anim.current?.goToAndPlay(0, true) },
    stop: () => { anim.current?.goToAndStop(0, true) },
  }), [])
  useEffect(() => {
    let alive = true
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    loadPlayer().then((lottie) => {
      if (!alive || !box.current) return
      anim.current = lottie.loadAnimation({
        container: box.current, renderer: 'svg', loop: loop && !reduce, autoplay: autoplay && !reduce,
        animationData: JSON.parse(JSON.stringify(data)),
      })
      if (reduce) anim.current.goToAndStop(anim.current.totalFrames - 1, true)
    })
    return () => { alive = false; anim.current?.destroy(); anim.current = null }
  }, [data, loop, autoplay])
  return <span ref={box} className={className} style={{ width: size, height: size, display: 'inline-block' }} aria-hidden="true" />
})

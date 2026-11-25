import { useEffect, useRef } from 'react'

/*
  Flying gulls. Motion is split into layers so it stays smooth:
   · .flock-x  — constant-speed horizontal glide (linear, GPU transform, never changes direction)
   · .flock-y  — slow eased rise and fall (alternate, ease-in-out → smooth curves, no corners)
   · each bird — its own bob + wing flap (SMIL path morph between wing poses, eased)
  `variant="dusk"` draws dark silhouettes for the golden-hour sky.
*/
const WINGS = {
  up: 'M-18 -7 Q -10 -13 -1 0 L 1 0 Q 10 -13 18 -7 Q 10 -9 1 2 L -1 2 Q -10 -9 -18 -7 Z',
  mid: 'M-18 0 Q -10 -6 -1 0 L 1 0 Q 10 -6 18 0 Q 10 -2 1 2 L -1 2 Q -10 -2 -18 0 Z',
  down: 'M-17 7 Q -9 1 -1 0 L 1 0 Q 9 1 17 7 Q 9 4 1 2 L -1 2 Q -9 4 -17 7 Z',
}
const FLAP = `${WINGS.up};${WINGS.mid};${WINGS.down};${WINGS.mid};${WINGS.up}`
const FLOCKS = [
  { cls: 'near', birds: [[0, 18, 1.05], [52, 0, 0.95], [100, 26, 0.9], [150, 6, 1], [196, 34, 0.82]] },
  { cls: 'far', birds: [[0, 10, 1], [40, 0, 0.9], [76, 16, 0.85], [112, 4, 0.95]] },
]

export default function Birds({ variant = 'day' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const svgs = [...el.querySelectorAll('svg')]
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { svgs.forEach((sv) => sv.pauseAnimations?.()); return }
    // only animate while on screen
    const io = new IntersectionObserver(([e]) => {
      el.classList.toggle('paused', !e.isIntersecting)
      svgs.forEach((sv) => (e.isIntersecting ? sv.unpauseAnimations?.() : sv.pauseAnimations?.()))
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`birds ${variant}`} ref={ref} aria-hidden="true">
      {FLOCKS.map((f) => (
        <div key={f.cls} className={`flock-x ${f.cls}`}>
          <div className="flock-y">
            <svg className="flock" viewBox="-24 -24 250 80" overflow="visible">
              {f.birds.map(([x, y, sc], i) => (
                <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}>
                  <g className="bird" style={{ animationDelay: `${-i * 0.7}s`, animationDuration: `${3 + (i % 3) * 0.6}s` }}>
                    <path d={WINGS.mid}>
                      <animate attributeName="d" values={FLAP} dur={`${(0.82 + ((i * 37) % 23) / 100).toFixed(2)}s`} begin={`${-i * 0.23}s`} repeatCount="indefinite"
                        calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1" />
                    </path>
                  </g>
                </g>
              ))}
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}

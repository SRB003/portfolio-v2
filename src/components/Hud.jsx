import { useEffect, useRef, useState } from 'react'
import { useSpring, useTrail, animated, config } from '@react-spring/web'
import { Lottie, CHECK } from '../fx/Lottie'

/*
  Live request console for the 3D full-stack model.
  The scene emits `rt` events as a request travels down (Interface → API → DB) and the
  response comes back up; each hop lights here. react-spring drives the button press
  and the hop trail; a Lottie check plays on 200 OK.
*/

const HOPS = [
  { key: 'request', label: 'React' },
  { key: 'api', label: 'API' },
  { key: 'db', label: 'DB' },
  { key: 'api-back', label: 'API' },
  { key: 'ui', label: 'UI' },
]

export function RequestHud() {
  const [route, setRoute] = useState('GET /trips')
  const [lit, setLit] = useState(-1)
  const [ms, setMs] = useState(null)
  const check = useRef(null)
  const [press, pressApi] = useSpring(() => ({ s: 1, config: config.wobbly }), [])
  const trail = useTrail(HOPS.length, { o: lit >= 0 ? 1 : 0.35, y: 0, config: { tension: 260, friction: 18 } })

  useEffect(() => {
    const on = (e) => {
      const { stage } = e.detail
      if (stage === 'request') { setRoute(e.detail.route); setMs(null); setLit(0); check.current?.stop() }
      const i = HOPS.findIndex((h) => h.key === stage)
      if (i >= 0) setLit(i)
      if (stage === 'done') { setMs(e.detail.ms); check.current?.play() }
    }
    addEventListener('rt', on)
    return () => removeEventListener('rt', on)
  }, [])

  const send = () => {
    pressApi.start({ from: { s: 0.9 }, to: { s: 1 } })
    dispatchEvent(new CustomEvent('stack-request'))
  }

  return (
    <div className="hud" aria-live="polite">
      <animated.button type="button" className="hud-send" onClick={send} style={{ scale: press.s }} data-cursor="Watch it travel the stack">
        <span className="hud-play" aria-hidden="true">▶</span> Send a request
      </animated.button>
      <div className="hud-line">
        <span className="hud-route mono">{route}</span>
        <ol className="hud-hops">
          {trail.map((st, i) => (
            <animated.li key={i} className={i <= lit ? `on ${i >= 3 ? 'res' : 'req'}` : ''} style={{ opacity: i <= lit ? 1 : st.o }}>
              {HOPS[i].label}
            </animated.li>
          ))}
        </ol>
        <span className={`hud-status ${ms ? 'ok' : ''}`}>
          <Lottie ref={check} data={CHECK} size={20} />
          <span className="mono">{ms ? `200 OK · ${ms} ms` : lit >= 0 ? 'in flight…' : 'idle'}</span>
        </span>
      </div>
    </div>
  )
}

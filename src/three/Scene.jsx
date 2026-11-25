import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, ContactShadows, Environment, Lightformer, Trail, PerformanceMonitor, Preload, Sparkles } from '@react-three/drei'
import { useSprings, animated } from '@react-spring/three'
import { EffectComposer, N8AO, Bloom, Vignette, ToneMapping, SMAA } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { animate, createTimeline } from 'animejs'
import { LABELS } from './labels'

/*
  "The Full Stack. Literally."
  Three floating tiers: Data (graphite, databases, servers, a Mumbai local train looping the rim),
  API (frosted glass, glowing Node core) and Interface (terrazzo terrace with the desk + laptop).
  Glowing packets stream up through glass tubes from the databases into the interface.
  Scroll pulls the tiers apart, then the camera dives into the laptop screen.
*/

/* ------------------------------------------------------------------ helpers */
const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const outBack = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const say = (label) => window.dispatchEvent(new CustomEvent('cursor-label', { detail: label }))
const hover = (label) => ({
  onPointerOver: (e) => { e.stopPropagation(); say(label); document.body.style.cursor = 'pointer' },
  onPointerOut: () => { say(''); document.body.style.cursor = '' },
})

const GLOW_LIME = new THREE.Color('#d8ff5a').multiplyScalar(3)
// flashes set by the request/response round trip, decayed every frame
const FX = { db: 0, api: 0, ui: 0 }
const emit = (stage, extra = {}) => window.dispatchEvent(new CustomEvent('rt', { detail: { stage, ...extra } }))
const GLOW_CYAN = new THREE.Color('#62e8ff').multiplyScalar(3)

/* ------------------------------------------------------------------ generated textures (no network) */
function useTerrazzo() {
  return useMemo(() => {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S
    const x = c.getContext('2d'), r = rng(11)
    x.fillStyle = '#efe7dc'; x.fillRect(0, 0, S, S)
    const chips = ['#0f4539', '#f3b48b', '#bcd6ec', '#d9c9b6', '#c9d77a', '#ffffff']
    for (let i = 0; i < 1400; i++) {
      const cx = r() * S, cy = r() * S, rad = 2 + r() * (r() > 0.92 ? 16 : 6)
      x.fillStyle = chips[Math.floor(r() * chips.length)]; x.globalAlpha = 0.55 + r() * 0.4
      x.beginPath()
      const n = 5 + Math.floor(r() * 3)
      for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, rr = rad * (0.6 + r() * 0.5); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) }
      x.fill()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.4, 1); t.anisotropy = 8
    return t
  }, [])
}

function useScreenTexture() {
  const [tex] = useState(() => {
    const c = document.createElement('canvas'); c.width = 1240; c.height = 780
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return t
  })
  useEffect(() => {
    const draw = () => {
      const c = tex.image, x = c.getContext('2d'), W = c.width, H = c.height

      // ── macOS browser chrome ──────────────────────────────────────────────
      x.fillStyle = '#1e1e1e'; x.fillRect(0, 0, W, 42)
      // traffic lights
      ;[['#ff5f56', 14], ['#ffbd2e', 32], ['#27c93f', 50]].forEach(([col, bx]) => {
        x.fillStyle = col; x.beginPath(); x.arc(bx, 21, 7, 0, Math.PI * 2); x.fill()
      })
      // active tab
      x.fillStyle = '#fbf7f0'; x.beginPath(); x.roundRect(70, 8, 230, 28, [6, 6, 0, 0]); x.fill()
      x.fillStyle = '#6f6a62'; x.font = '500 11px system-ui, sans-serif'; x.fillText('sahilbhuvad.dev', 86, 27)
      // URL bar
      x.fillStyle = '#2d2d2d'; x.beginPath(); x.roundRect(W / 2 - 220, 10, 440, 22, 4); x.fill()
      x.fillStyle = '#8a8a8a'; x.font = '12px system-ui, sans-serif'; x.textAlign = 'center'
      x.fillText('sahilbhuvad.dev', W / 2, 25); x.textAlign = 'left'

      // ── site background ───────────────────────────────────────────────────
      x.fillStyle = '#fbf7f0'; x.fillRect(0, 42, W, H - 42)
      // subtle dot grain
      x.fillStyle = 'rgba(70,50,40,.07)'
      for (let i = 10; i < W; i += 22) for (let j = 52; j < H; j += 22) x.fillRect(i, j, 1.5, 1.5)
      // warm top-right glow
      const rg = x.createRadialGradient(W, 42, 0, W, 42, 540)
      rg.addColorStop(0, 'rgba(250,214,196,.55)'); rg.addColorStop(1, 'rgba(250,214,196,0)')
      x.fillStyle = rg; x.fillRect(0, 42, W, H - 42)

      // ── site nav ─────────────────────────────────────────────────────────
      x.fillStyle = 'rgba(251,247,240,0.95)'; x.fillRect(0, 42, W, 52)
      // avatar
      x.fillStyle = '#0f4539'; x.beginPath(); x.arc(72, 68, 18, 0, Math.PI * 2); x.fill()
      x.fillStyle = '#d8ff5a'; x.font = 'italic 700 18px Georgia, serif'; x.textAlign = 'center'
      x.fillText('S', 72, 74); x.textAlign = 'left'
      x.fillStyle = '#23292c'; x.font = '700 14px "Bricolage Grotesque", system-ui, sans-serif'
      x.fillText('Sahil Bhuvad', 98, 65)
      x.fillStyle = '#6f6a62'; x.font = '500 11px "Inter Tight", system-ui, sans-serif'
      x.fillText('Full-Stack Developer', 100, 80)
      ;['Work', 'Path', 'About', 'Contact'].forEach((link, i) => {
        x.fillStyle = i === 0 ? '#23292c' : '#6f6a62'
        x.font = `${i === 0 ? '600' : '500'} 13px "Inter Tight", system-ui, sans-serif`
        x.fillText(link, W - 240 + i * 58, 73)
      })
      x.fillStyle = 'rgba(70,50,40,.12)'; x.fillRect(0, 93, W, 1)

      // ── section head ─────────────────────────────────────────────────────
      x.fillStyle = '#8f9d9a'; x.font = '500 11px "JetBrains Mono", monospace'
      x.fillText('01 ·── SELECTED WORK', 60, 128)
      x.fillStyle = '#23292c'; x.font = '700 50px "Bricolage Grotesque", system-ui, sans-serif'
      x.fillText("Products I've", 60, 186)
      const hW = x.measureText("Products I've ").width
      x.fillStyle = '#0f4539'; x.font = 'italic 700 50px Georgia, serif'
      x.fillText('shipped.', 60 + hW, 186)
      x.fillStyle = '#6f6a62'; x.font = '400 16px "Inter Tight", system-ui, sans-serif'
      x.fillText('Live products built, shipped and maintained. Click to explore.', 62, 214)

      // ── cards ────────────────────────────────────────────────────────────
      const CARDS = [
        { tone: '#cfe3ea', accent: '#0d7a8a', title: 'Aertrip Holidays', org: 'Travel platform', year: '2025', stacks: ['React', 'Node.js', 'PostgreSQL'], facts: ['3 flows', 'UAT→Prod'] },
        { tone: '#e3efc9', accent: '#3d7a0d', title: 'Made Again', org: 'CMS website', year: '2026', stacks: ['JavaScript', 'HTML5', 'CMS'], facts: ['100%', 'Live'] },
        { tone: '#f6dcc6', accent: '#8a4a0d', title: 'Client web apps', org: 'Epoch Branding', year: '2025+', stacks: ['React', 'APIs', 'Webflow'], facts: ['Full SDLC', 'Reviews'] },
      ]
      CARDS.forEach(({ tone, accent, title, org, year, stacks, facts }, i) => {
        const cx = 60 + i * 394, cy = 236, cw = 372, ch = 496
        // card shadow + base
        x.save(); x.shadowColor = 'rgba(80,50,30,.16)'; x.shadowBlur = 28; x.shadowOffsetY = 12
        x.fillStyle = '#fff'; x.beginPath(); x.roundRect(cx, cy, cw, ch, 20); x.fill(); x.restore()
        // art area
        x.save(); x.beginPath(); x.roundRect(cx, cy, cw, 200, [20, 20, 0, 0]); x.clip()
        x.fillStyle = tone; x.fillRect(cx, cy, cw, 200)
        // mini browser mockup inside card art
        x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.roundRect(cx + 32, cy + 26, cw - 64, 130, 10); x.fill()
        x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(cx + 32, cy + 26, cw - 64, 24) // titlebar
        ;[['#ff5f56', 7], ['#ffbd2e', 19], ['#27c93f', 31]].forEach(([col, ox]) => {
          x.fillStyle = col; x.beginPath(); x.arc(cx + 42 + ox, cy + 38, 5, 0, Math.PI * 2); x.fill()
        })
        x.fillStyle = accent; x.fillRect(cx + 42, cy + 64, 120, 10); x.fillRect(cx + 42, cy + 80, 80, 7)
        x.fillStyle = accent; x.beginPath(); x.roundRect(cx + 42, cy + 100, 60, 22, 4); x.fill()
        x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(cx + 32 + (cw - 64) * 0.55, cy + 26, (cw - 64) * 0.45, 130)
        x.restore()
        // year tag
        x.fillStyle = tone; x.beginPath(); x.roundRect(cx + cw - 72, cy + 14, 56, 22, 6); x.fill()
        x.fillStyle = accent; x.font = '700 11px "JetBrains Mono", monospace'
        x.fillText(year, cx + cw - 64, cy + 29)
        // body
        const bx = cx + 22, by = cy + 215
        x.fillStyle = '#6f6a62'; x.font = '500 11px "JetBrains Mono", monospace'
        x.fillText(org.toUpperCase(), bx, by + 3)
        x.fillStyle = '#23292c'; x.font = '700 27px "Bricolage Grotesque", system-ui, sans-serif'
        x.fillText(title, bx, by + 36)
        // stack chips
        let chipX = bx
        stacks.forEach((s) => {
          x.font = '500 11px "Inter Tight", system-ui, sans-serif'
          const tw = x.measureText(s).width + 18
          x.fillStyle = '#f6f2ea'; x.beginPath(); x.roundRect(chipX, by + 50, tw, 22, 5); x.fill()
          x.fillStyle = '#4a5155'; x.fillText(s, chipX + 9, by + 65)
          chipX += tw + 6
        })
        // divider
        x.fillStyle = 'rgba(70,50,40,.1)'; x.fillRect(bx, by + 86, cw - 44, 1)
        // facts
        facts.forEach((v, fi) => {
          const fx = bx + fi * 170
          x.fillStyle = '#23292c'; x.font = '700 20px "Bricolage Grotesque", system-ui, sans-serif'
          x.fillText(v, fx, by + 118)
        })
        // open link
        x.fillStyle = accent; x.font = '600 13px "Inter Tight", system-ui, sans-serif'
        x.fillText('↗ Open', bx, by + 150)
      })

      // ── progress bar ─────────────────────────────────────────────────────
      x.fillStyle = 'rgba(70,50,40,.1)'; x.fillRect(60, H - 32, W - 120, 3)
      x.fillStyle = '#0f4539'; x.beginPath(); x.roundRect(60, H - 32, 290, 3, 1.5); x.fill()

      tex.needsUpdate = true
    }
    draw()
    document.fonts?.ready.then(draw)
  }, [tex])
  return tex
}

/* ------------------------------------------------------------------ shared materials */
function useMats() {
  return useMemo(() => ({
    graphite: new THREE.MeshPhysicalMaterial({ color: '#0d2a1a', roughness: 0.38, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.25 }),
    steel: new THREE.MeshStandardMaterial({ color: '#d7dade', metalness: 0.9, roughness: 0.22 }),
    darkSteel: new THREE.MeshStandardMaterial({ color: '#3a4046', metalness: 0.7, roughness: 0.35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#d8f0e4', transmission: 0.92, roughness: 0.28, thickness: 1.2, ior: 1.45, attenuationColor: '#a8dfc0', attenuationDistance: 1.2, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9 }),
    tube: new THREE.MeshPhysicalMaterial({ color: '#eaf6ff', transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.4, depthWrite: false }),
    brass: new THREE.MeshStandardMaterial({ color: '#c9a24a', metalness: 0.85, roughness: 0.28 }),
  }), [])
}

/* ------------------------------------------------------------------ Tier 1: Data */
function DbStack({ position, m, i }) {
  const glow = useRef()
  useFrame(({ clock }) => { glow.current.children.forEach((r, k) => { r.material.color.copy(i === 0 && FX.db > 0.02 ? GLOW_LIME : GLOW_CYAN).multiplyScalar(0.55 + 0.45 * Math.sin(clock.elapsedTime * 2.2 + k + i) + (i === 0 ? FX.db * 2 : 0)) }) })
  return (
    <group position={position} {...hover(i === 0 ? 'PostgreSQL' : i === 1 ? 'MySQL' : 'Data models')}>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, 0.07 + k * 0.15, 0]} castShadow receiveShadow material={m.steel}>
          <cylinderGeometry args={[0.24, 0.24, 0.12, 48]} />
        </mesh>
      ))}
      <group ref={glow}>
        {[0, 1].map((k) => (
          <mesh key={k} position={[0, 0.145 + k * 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.243, 0.012, 8, 64]} />
            <meshBasicMaterial color={GLOW_CYAN} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Rack({ position, m, seed }) {
  const leds = useRef()
  const N = 24
  const base = useMemo(() => { const r = rng(seed); return Array.from({ length: N }, () => r()) }, [seed])
  useEffect(() => {
    const mtx = new THREE.Matrix4()
    for (let i = 0; i < N; i++) { mtx.setPosition(-0.12 + (i % 4) * 0.08, 0.12 + Math.floor(i / 4) * 0.12, 0.201); leds.current.setMatrixAt(i, mtx) }
    leds.current.instanceMatrix.needsUpdate = true
  }, [])
  const col = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < N; i++) {
      const on = Math.sin(t * (2 + base[i] * 6) + base[i] * 20) > 0.2
      col.copy(base[i] > 0.75 ? GLOW_CYAN : GLOW_LIME).multiplyScalar(on ? 1 : 0.08)
      leds.current.setColorAt(i, col)
    }
    leds.current.instanceColor.needsUpdate = true
  })
  return (
    <group position={position} {...hover('Servers · always on')}>
      <RoundedBox args={[0.42, 0.82, 0.4]} radius={0.03} position={[0, 0.41, 0]} castShadow receiveShadow material={m.darkSteel} />
      <instancedMesh ref={leds} args={[null, null, N]}>
        <boxGeometry args={[0.05, 0.022, 0.01]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

// a little Mumbai local looping the rim of the data tier
function LocalTrain({ m }) {
  const cars = useRef()
  const curve = useMemo(() => {
    const w = 1.98, d = 1.38, rr = 0.45, pts = []
    const corner = (cx, cz, a0) => { for (let k = 0; k <= 6; k++) { const a = a0 + (k / 6) * (Math.PI / 2); pts.push(new THREE.Vector3(cx + Math.cos(a) * rr, 0, cz + Math.sin(a) * rr)) } }
    corner(w - rr, d - rr, 0); corner(-w + rr, d - rr, Math.PI / 2); corner(-w + rr, -d + rr, Math.PI); corner(w - rr, -d + rr, Math.PI * 1.5)
    return new THREE.CatmullRomCurve3(pts, true, 'centripetal')
  }, [])
  const rail = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.012, 6, true), [curve])
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), [])
  useFrame(({ clock }) => {
    const s = clock.elapsedTime * 0.045
    cars.current.children.forEach((car, i) => {
      const u = (s - i * 0.034 + 10) % 1
      curve.getPointAt(u, tmp.p); curve.getTangentAt(u, tmp.t)
      car.position.copy(tmp.p)
      car.rotation.y = Math.atan2(-tmp.t.z, tmp.t.x)
    })
  })
  return (
    <group position={[0, 0.2, 0]} {...hover('Mumbai local · data arrives on time')}>
      <mesh geometry={rail} material={m.steel} />
      <group ref={cars}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i}>
            <RoundedBox args={[0.26, 0.1, 0.11]} radius={0.025} position={[0, 0.06, 0]} castShadow>
              <meshStandardMaterial color="#7d1f2b" roughness={0.45} />
            </RoundedBox>
            <mesh position={[0, 0.095, 0]}><boxGeometry args={[0.262, 0.025, 0.112]} /><meshStandardMaterial color="#f1e2c4" roughness={0.5} /></mesh>
            {[-0.08, 0, 0.08].map((x) => (
              <mesh key={x} position={[x, 0.07, 0.0565]}><planeGeometry args={[0.05, 0.03]} /><meshBasicMaterial color={new THREE.Color('#ffe7a8').multiplyScalar(1.6)} toneMapped={false} /></mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  )
}

function DataTier({ m }) {
  return (
    <group>
      <RoundedBox args={[3.6, 0.36, 2.4]} radius={0.12} smoothness={6} castShadow receiveShadow material={m.graphite} />
      {/* glowing seam around the slab */}
      <RoundedBox args={[3.62, 0.02, 2.42]} radius={0.01} position={[0, 0.05, 0]}>
        <meshBasicMaterial color={GLOW_CYAN} toneMapped={false} />
      </RoundedBox>
      <group position={[0, 0.18, 0]}>
        <DbStack position={[-0.95, 0, -0.35]} m={m} i={0} />
        <DbStack position={[-0.35, 0, -0.55]} m={m} i={1} />
        <DbStack position={[-0.65, 0, 0.3]} m={m} i={2} />
        <Rack position={[0.55, 0, -0.45]} m={m} seed={3} />
        <Rack position={[1.05, 0, -0.45]} m={m} seed={8} />
      </group>
      <Cables />
      <LocalTrain m={m} />
      <ContactShadows position={[0, 0.181, 0]} scale={[3.5, 2.3]} blur={1.6} opacity={0.7} far={1} resolution={512} color="#000000" frames={1} />
    </group>
  )
}

// rubber cable runs from the racks to the databases
function Cables() {
  const geos = useMemo(() => {
    const runs = [
      [[0.55, 0.2, -0.62], [0.3, 0.2, -0.85], [-0.2, 0.2, -0.8], [-0.35, 0.22, -0.72]],
      [[1.05, 0.2, -0.62], [0.7, 0.2, -0.95], [-0.6, 0.2, -0.95], [-0.95, 0.22, -0.55]],
      [[0.6, 0.2, -0.26], [0.35, 0.2, 0.2], [-0.2, 0.2, 0.45], [-0.5, 0.22, 0.32]],
    ]
    return runs.map((r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(r.map((v) => new THREE.Vector3(...v))), 48, 0.018, 8, false))
  }, [])
  return geos.map((g, i) => (
    <mesh key={i} geometry={g} castShadow receiveShadow>
      <meshStandardMaterial color={['#1b1f22', '#24333a', '#1b1f22'][i]} roughness={0.55} />
    </mesh>
  ))
}

/* ------------------------------------------------------------------ Tier 2: API (glass) */
function ApiTier({ m }) {
  const core = useRef(), shell = useRef(), orbit = useRef()
  useFrame((_, d) => {
    core.current.rotation.y += d * 0.6; core.current.rotation.x += d * 0.25
    shell.current.rotation.y -= d * 0.3; shell.current.rotation.z += d * 0.15
    orbit.current.rotation.y += d * 0.9
    const k = 1 + FX.api * 0.6
    core.current.scale.setScalar(k)
    core.current.material.color.copy(FX.api > 0.05 ? GLOW_CYAN : GLOW_LIME).multiplyScalar(1 + FX.api * 1.5)
  })
  const pulse = () => window.dispatchEvent(new CustomEvent('stack-request'))
  return (
    <group>
      <RoundedBox args={[3.3, 0.3, 2.2]} radius={0.1} smoothness={6} castShadow receiveShadow material={m.glass} />
      <group position={[0, 0.5, 0]} {...hover('Node.js · REST API · click to send a request')} onClick={pulse}>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshBasicMaterial color={GLOW_LIME} toneMapped={false} />
        </mesh>
        <mesh ref={shell}>
          <icosahedronGeometry args={[0.36, 1]} />
          <meshStandardMaterial color="#0f4539" wireframe transparent opacity={0.6} />
        </mesh>
        <group ref={orbit} rotation={[0.4, 0, 0.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.008, 8, 96]} /><meshBasicMaterial color={GLOW_CYAN} toneMapped={false} /></mesh>
          <mesh position={[0.55, 0, 0]}><sphereGeometry args={[0.035, 16, 16]} /><meshBasicMaterial color={GLOW_CYAN} toneMapped={false} /></mesh>
        </group>
      </group>
      <mesh position={[0, 0.2, 0]} material={m.steel} castShadow><cylinderGeometry args={[0.05, 0.12, 0.12, 24]} /></mesh>
      {[['GET /trips', -1.2, -0.6], ['POST /pay', 1.15, -0.55], ['PUT /cms', -1.1, 0.65], ['GET /users', 1.2, 0.6]].map(([t, x, z]) => (
        <TagSprite key={t} text={t} position={[x, 0.36, z]} />
      ))}
    </group>
  )
}

function TagSprite({ text, position }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64
    const x = c.getContext('2d')
    x.fillStyle = 'rgba(22,32,29,0.88)'; x.beginPath(); x.roundRect(4, 8, 248, 48, 12); x.fill()
    x.fillStyle = '#d8ff5a'; x.font = '500 26px "JetBrains Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.fillText(text, 128, 33)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
    return t
  }, [text])
  return (
    <sprite position={position} scale={[0.62, 0.155, 1]} raycast={() => null}>
      <spriteMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

/* ------------------------------------------------------------------ Tier 3: Interface (desk) */
function Laptop({ screenRef }) {
  const tex = useScreenTexture()
  const jump = () => window.dispatchEvent(new CustomEvent('go-work'))
  return (
    <group position={[0.05, 0.995, -0.08]}>
      <RoundedBox args={[1.38, 0.045, 0.94]} radius={0.02} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#d9dadf" metalness={0.65} roughness={0.32} />
      </RoundedBox>
      <mesh position={[0, 0.0235, -0.1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.18, 0.42]} /><meshStandardMaterial color="#2c3034" roughness={0.7} /></mesh>
      <Keys />
      <mesh position={[0, 0.0236, 0.27]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.46, 0.26]} /><meshStandardMaterial color="#c9cace" metalness={0.5} roughness={0.35} /></mesh>
      <group position={[0, 0.02, -0.465]} rotation={[-0.24, 0, 0]}>
        <RoundedBox args={[1.38, 0.9, 0.032]} radius={0.02} smoothness={4} position={[0, 0.45, 0]} castShadow {...hover('Open the work →')} onClick={jump}>
          <meshStandardMaterial color="#cfd1d6" metalness={0.7} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0.45, 0.0165]}><planeGeometry args={[1.32, 0.84]} /><meshStandardMaterial color="#0d0f12" roughness={0.2} /></mesh>
        <mesh ref={screenRef} position={[0, 0.465, 0.0172]} {...hover('Open the work →')} onClick={jump}>
          <planeGeometry args={[1.24, 0.78]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        <ScreenFlash />
        {/* cover glass: faint environment reflections */}
        <mesh position={[0, 0.45, 0.0185]} raycast={() => null}>
          <planeGeometry args={[1.32, 0.84]} />
          <meshPhysicalMaterial transparent opacity={0.1} roughness={0.04} metalness={0} clearcoat={1} envMapIntensity={1.6} color="#ffffff" depthWrite={false} />
        </mesh>
        {/* hinge + webcam */}
        <mesh position={[0, 0.885, 0.017]}><circleGeometry args={[0.008, 16]} /><meshBasicMaterial color="#1a1a1a" /></mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.018, 0.018, 1.2, 16]} /><meshStandardMaterial color="#9a9ca1" metalness={0.8} roughness={0.3} /></mesh>
      </group>
    </group>
  )
}

function Keys() {
  const ref = useRef()
  useEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i < 70; i++) { m.setPosition(-0.56 + (i % 14) * 0.0805, 0.026, -0.29 + Math.floor(i / 14) * 0.079); ref.current.setMatrixAt(i, m) }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[null, null, 70]}>
      <boxGeometry args={[0.068, 0.008, 0.066]} /><meshStandardMaterial color="#3b4045" roughness={0.6} />
    </instancedMesh>
  )
}

function ScreenFlash() {
  const ref = useRef()
  useFrame(() => { ref.current.material.opacity = FX.ui * 0.35 })
  return (
    <mesh ref={ref} position={[0, 0.465, 0.018]} raycast={() => null}>
      <planeGeometry args={[1.24, 0.78]} />
      <meshBasicMaterial color={GLOW_CYAN} transparent opacity={0} toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

function Mug() {
  const g = useRef(), steam = useRef()
  const puff = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])
  const lathe = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(0.15, 0), new THREE.Vector2(0.165, 0.02), new THREE.Vector2(0.165, 0.3),
    new THREE.Vector2(0.15, 0.3), new THREE.Vector2(0.15, 0.03), new THREE.Vector2(0, 0.03),
  ], 48), [])
  useFrame(({ clock }) => {
    steam.current?.children.forEach((s, i) => {
      const t = (clock.elapsedTime * 0.3 + i / 4) % 1
      s.position.y = 0.33 + t * 0.5; s.position.x = Math.sin(t * 5 + i * 2) * 0.05
      s.material.opacity = Math.sin(t * Math.PI) * 0.28; s.scale.setScalar(0.1 + t * 0.22)
    })
  })
  const click = () => {
    animate(g.current.rotation, { z: [0, 0.18, -0.12, 0.06, 0], duration: 900, ease: 'outElastic(1, .4)' })
    animate(g.current.position, { y: [0.99, 1.12, 0.99], duration: 700, ease: 'outBounce' })
    say('Coffee #3 ☕')
  }
  return (
    <group ref={g} position={[-1.05, 0.99, 0.22]} {...hover('Refill coffee')} onClick={click}>
      <mesh geometry={lathe} castShadow receiveShadow><meshPhysicalMaterial color="#0f4539" roughness={0.25} clearcoat={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.15, 32]} /><meshStandardMaterial color="#b07a46" roughness={0.15} /></mesh>
      <mesh position={[0.19, 0.15, 0]} castShadow><torusGeometry args={[0.075, 0.022, 12, 32]} /><meshPhysicalMaterial color="#0f4539" roughness={0.25} clearcoat={1} /></mesh>
      <group ref={steam}>
        {[0, 1, 2, 3].map((i) => <sprite key={i} scale={0.14}><spriteMaterial map={puff} transparent opacity={0} depthWrite={false} /></sprite>)}
      </group>
    </group>
  )
}

function Plant() {
  const leaves = useRef()
  useFrame(({ clock }) => { if (leaves.current) leaves.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.03 })
  const pot = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(0.15, 0), new THREE.Vector2(0.2, 0.32), new THREE.Vector2(0.22, 0.34), new THREE.Vector2(0.22, 0.38), new THREE.Vector2(0.19, 0.38),
  ], 40), [])
  const click = () => animate(leaves.current.rotation, { z: [0, 0.25, -0.2, 0.1, 0], duration: 1400, ease: 'outElastic(1, .3)' })
  // a leaf: tapered width, folded along the midrib, arching outward
  const leafGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 6, 16)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) * 2, v = p.getY(i) + 0.5 // u: -1..1 across, v: 0..1 along
      const w = Math.sin(Math.PI * Math.min(1, v * 1.05)) * (1 - v * 0.35)
      const x = u * w * 0.5
      const fold = Math.abs(u) * w * 0.18
      p.setXYZ(i, x, v, fold + v * v * 0.55)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const L = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: 13 }, (_, i) => ({ a: (i / 13) * Math.PI * 2 + r(), tilt: 0.3 + r() * 0.55, len: 0.42 + r() * 0.38, c: ['#3f8f5f', '#2f7a4f', '#4ea36d'][i % 3] }))
  }, [])
  return (
    <group position={[1.12, 0.99, -0.42]} {...hover('Water the plant')} onClick={click}>
      <mesh geometry={pot} castShadow receiveShadow><meshStandardMaterial color="#d9734a" roughness={0.8} /></mesh>
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.19, 24]} /><meshStandardMaterial color="#4a3428" /></mesh>
      <group ref={leaves} position={[0, 0.36, 0]}>
        {L.map((l, i) => (
          <group key={i} rotation={[0, l.a, 0]}><group rotation={[0, 0, -l.tilt]}>
            <mesh geometry={leafGeo} scale={[0.17, l.len, 0.17]} castShadow>
              <meshPhysicalMaterial color={l.c} roughness={0.42} sheen={1} sheenColor="#d6f5b0" side={THREE.DoubleSide} clearcoat={0.3} />
            </mesh>
          </group></group>
        ))}
      </group>
    </group>
  )
}

function Lamp({ m }) {
  const head = useRef()
  const [on, setOn] = useState(true)
  const toggle = () => {
    setOn((v) => !v)
    animate(head.current.rotation, { z: [head.current.rotation.z, head.current.rotation.z + 0.25, head.current.rotation.z], duration: 900, ease: 'outElastic(1, .4)' })
  }
  return (
    <group position={[-1.32, 0.99, -0.68]} rotation={[0, 0.7, 0]} {...hover(on ? 'Lights off' : 'Lights on')} onClick={toggle}>
      <mesh castShadow material={m.brass}><cylinderGeometry args={[0.14, 0.16, 0.035, 32]} /></mesh>
      <mesh position={[0, 0.34, 0]} rotation={[0, 0, -0.25]} castShadow material={m.brass}><cylinderGeometry args={[0.014, 0.014, 0.7, 12]} /></mesh>
      <mesh position={[0.085, 0.67, 0]} material={m.brass}><sphereGeometry args={[0.03, 16, 16]} /></mesh>
      <group ref={head} position={[0.085, 0.67, 0]} rotation={[0, 0, -1.1]}>
        <mesh position={[0, 0.22, 0]} castShadow material={m.brass}><cylinderGeometry args={[0.012, 0.012, 0.44, 12]} /></mesh>
        <group position={[0, 0.44, 0]} rotation={[0, 0, 0.55]}>
          <mesh castShadow><coneGeometry args={[0.13, 0.2, 32, 1, true]} /><meshStandardMaterial color="#0f4539" roughness={0.4} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.04, 0]}><sphereGeometry args={[0.05, 16, 16]} /><meshBasicMaterial color={on ? new THREE.Color('#fff1c4').multiplyScalar(2.5) : '#8a8a80'} toneMapped={false} /></mesh>
          <pointLight position={[0, -0.12, 0]} intensity={on ? 2.4 : 0} distance={3.2} decay={1.6} color="#ffcf8a" />
        </group>
      </group>
    </group>
  )
}

function Books() {
  const b = [['#e4fb7a', 0.56, 0.08, 0.1], ['#f3b48b', 0.6, 0.07, -0.08], ['#0f4539', 0.52, 0.075, 0.04]]
  let y = 0
  return (
    <group position={[-0.92, 0.99, -0.55]} rotation={[0, 0.4, 0]}>
      {b.map(([c, w, h, r], i) => { const yy = y + h / 2; y += h; return (
        <RoundedBox key={i} args={[w, h, 0.4]} radius={0.012} position={[0, yy, 0]} rotation={[0, r, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={c} roughness={0.6} />
        </RoundedBox>
      ) })}
    </group>
  )
}

function Phone() {
  return (
    <group position={[0.92, 0.995, 0.42]} rotation={[0, -0.5, 0]}>
      <RoundedBox args={[0.22, 0.018, 0.44]} radius={0.008} castShadow><meshStandardMaterial color="#1c1f22" metalness={0.4} roughness={0.3} /></RoundedBox>
      <mesh position={[0, 0.0095, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.2, 0.41]} /><meshBasicMaterial color={new THREE.Color('#ffb38a').multiplyScalar(1.3)} toneMapped={false} /></mesh>
    </group>
  )
}

function Notebook({ m }) {
  return (
    <group position={[-0.62, 0.995, 0.55]} rotation={[0, 0.25, 0]}>
      <RoundedBox args={[0.62, 0.03, 0.42]} radius={0.01} castShadow receiveShadow><meshStandardMaterial color="#fffaf0" roughness={0.9} /></RoundedBox>
      <mesh position={[0.1, 0.03, 0.02]} rotation={[0, 0.6, Math.PI / 2]} castShadow material={m.brass}><cylinderGeometry args={[0.012, 0.012, 0.36, 12]} /></mesh>
    </group>
  )
}

const WIND = { value: 0 }
const windShader = (shader) => {
  shader.uniforms.uTime = WIND
  shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float h = clamp(transformed.y + 0.055, 0.0, 0.11) / 0.11;
    vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
    transformed.x += sin(uTime * 1.7 + ip.x * 2.3 + ip.z * 1.7) * 0.022 * h * h;
    transformed.z += cos(uTime * 1.3 + ip.x * 1.9) * 0.012 * h * h;`)
}

function Grass() {
  // soft lawn border around the terrace (fine, short blades)
  const ref = useRef()
  const N = 2000
  useEffect(() => {
    const r = rng(21), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3()
    const greens = ['#5f9a4a', '#77b05a', '#8cc06a', '#4f8740', '#a2cf7a'].map((c) => new THREE.Color(c))
    let i = 0
    while (i < N) {
      const x = (r() - 0.5) * 3.64, z = (r() - 0.5) * 2.44
      if (Math.abs(x) < 1.62 && Math.abs(z) < 0.95) continue // keep the stone visible under the desk
      p.set(x, 0, z); e.set((r() - 0.5) * 0.4, r() * Math.PI, (r() - 0.5) * 0.4); q.setFromEuler(e)
      s.set(1, 0.6 + r() * 0.9, 1); m.compose(p, q, s)
      ref.current.setMatrixAt(i, m); ref.current.setColorAt(i, greens[Math.floor(r() * greens.length)]); i++
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[null, null, N]} position={[0, 0.17, 0]} receiveShadow>
      <coneGeometry args={[0.012, 0.11, 3]} /><meshStandardMaterial roughness={0.85} onBeforeCompile={windShader} />
    </instancedMesh>
  )
}

function Desk({ m }) {
  const legs = [[-1.35, -0.72], [1.35, -0.72], [-1.35, 0.72], [1.35, 0.72]]
  return (
    <group>
      <RoundedBox args={[3.05, 0.08, 1.72]} radius={0.04} smoothness={4} position={[0, 0.95, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f4ece2" roughness={0.3} clearcoat={0.5} />
      </RoundedBox>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.46, z]} castShadow material={m.brass}><cylinderGeometry args={[0.03, 0.022, 0.92, 16]} /></mesh>
      ))}
    </group>
  )
}

// task chair: five-star base with casters, gas lift, upholstered seat and back
function Chair({ m }) {
  const fabric = <meshPhysicalMaterial color="#1f4b40" roughness={0.85} sheen={1} sheenColor="#5c8f7f" />
  return (
    <group position={[1.05, 0, 1.0]} rotation={[0, Math.PI + 0.95, 0]} scale={0.9} {...hover('Ergonomics matter')}>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <mesh position={[0.17, 0.06, 0]} rotation={[0, 0, 0.12]} castShadow material={m.darkSteel}><boxGeometry args={[0.34, 0.035, 0.05]} /></mesh>
          <mesh position={[0.33, 0.03, 0]} castShadow><sphereGeometry args={[0.03, 12, 12]} /><meshStandardMaterial color="#1a1a1a" roughness={0.4} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.25, 0]} castShadow material={m.steel}><cylinderGeometry args={[0.028, 0.034, 0.36, 16]} /></mesh>
      <RoundedBox args={[0.56, 0.09, 0.52]} radius={0.04} smoothness={4} position={[0, 0.47, 0]} castShadow receiveShadow>{fabric}</RoundedBox>
      <mesh position={[0, 0.62, -0.27]} rotation={[0.08, 0, 0]} castShadow material={m.darkSteel}><boxGeometry args={[0.06, 0.3, 0.03]} /></mesh>
      <RoundedBox args={[0.52, 0.56, 0.07]} radius={0.05} smoothness={4} position={[0, 0.98, -0.31]} rotation={[-0.12, 0, 0]} castShadow>{fabric}</RoundedBox>
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.3, 0.6, -0.02]}>
          <mesh position={[0, -0.06, 0]} material={m.darkSteel}><boxGeometry args={[0.03, 0.14, 0.03]} /></mesh>
          <RoundedBox args={[0.06, 0.03, 0.26]} radius={0.012} castShadow material={m.darkSteel} />
        </group>
      ))}
    </group>
  )
}

function UiTier({ m, screenRef }) {
  const terrazzo = useTerrazzo()
  return (
    <group>
      <RoundedBox args={[3.8, 0.34, 2.6]} radius={0.12} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial map={terrazzo} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} />
      </RoundedBox>
      <Grass />
      <group position={[0, 0.17, 0]} scale={0.92}>
        <Desk m={m} />
        <Laptop screenRef={screenRef} />
        <Mug />
        <Plant />
        <Books />
        <Lamp m={m} />
        <Phone />
        <Notebook m={m} />
        <Chair m={m} />
        <ContactShadows position={[0, 0.992, 0]} scale={[3, 1.7]} blur={2.2} opacity={0.45} far={0.6} resolution={512} color="#5a3d2e" frames={1} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ data flow between tiers */
function Tubes({ m, ys }) {
  const refs = useRef([])
  useFrame(() => {
    const { d, a, u } = ys.current
    // two tubes Data→API (front corners), two API→Interface (back corners)
    const spec = [[-1.45, 0.75, d + 0.18, a - 0.15], [1.45, 0.75, d + 0.18, a - 0.15], [-1.33, -0.7, a + 0.15, u - 0.17], [1.33, -0.7, a + 0.15, u - 0.17]]
    refs.current.forEach((t, i) => {
      if (!t) return
      const [x, z, lo, hi] = spec[i]
      t.position.set(x, (lo + hi) / 2, z)
      t.scale.y = Math.max(0.01, hi - lo)
    })
  })
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} material={m.tube}>
          <cylinderGeometry args={[0.06, 0.06, 1, 24, 1, true]} />
        </mesh>
      ))}
    </group>
  )
}

function Packets({ ys }) {
  const ref = useRef()
  const N = 46
  const seeds = useMemo(() => { const r = rng(42); return Array.from({ length: N }, (_, i) => ({ o: i / N, lane: i % 2, s: 0.11 + r() * 0.05 })) }, [])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), c: new THREE.Color(), e: new THREE.Euler() }), [])
  const lanes = useMemo(() => [Array.from({ length: 6 }, () => [0, 0, 0]), Array.from({ length: 6 }, () => [0, 0, 0])], [])
  useFrame(({ clock }) => {
    const { d, a, u } = ys.current
    const t = clock.elapsedTime
    // database → front tube → API core → back tube → interface tier; lane 0 on the right, lane 1 on the left
    for (let l = 0; l < 2; l++) {
      const sx = l ? -1 : 1, P = lanes[l]
      P[0][0] = -0.65; P[0][1] = d + 0.6; P[0][2] = -0.2
      P[1][0] = sx * 1.45; P[1][1] = d + 0.2; P[1][2] = 0.75
      P[2][0] = sx * 1.45; P[2][1] = a - 0.15; P[2][2] = 0.75
      P[3][0] = 0; P[3][1] = a + 0.5; P[3][2] = 0
      P[4][0] = sx * 1.33; P[4][1] = a + 0.15; P[4][2] = -0.7
      P[5][0] = sx * 1.33; P[5][1] = u - 0.17; P[5][2] = -0.7
    }
    for (let i = 0; i < N; i++) {
      const sd = seeds[i]
      const up = sd.lane === 1 // cyan responses rise, lime requests fall
      const k0 = (t * sd.s + sd.o) % 1
      const k = up ? k0 : 1 - k0
      const pts = lanes[up ? 1 : 0]
      const seg = k * (pts.length - 1), j = Math.floor(seg), f = seg - j
      const A = pts[j], B = pts[Math.min(j + 1, pts.length - 1)]
      tmp.p.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f)
      tmp.s.setScalar((Math.sin(k * Math.PI) * 0.9 + 0.1) * 0.75)
      tmp.e.set(t + i, t * 0.7 + i, 0); tmp.q.setFromEuler(tmp.e)
      tmp.m.compose(tmp.p, tmp.q, tmp.s); ref.current.setMatrixAt(i, tmp.m)
      ref.current.setColorAt(i, tmp.c.copy(up ? GLOW_CYAN : GLOW_LIME).multiplyScalar(0.7))
    }
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, N]} frustumCulled={false}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------ request → response round trip */
const pathLen = (pts) => { let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]); seg.push(d); L += d } return { L, seg } }
const along = (pts, k, out) => {
  const { L, seg } = pathLen(pts)
  let d = clamp(k) * L, i = 0
  while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++ }
  const f = seg[i] ? d / seg[i] : 0, A = pts[i], B = pts[i + 1]
  out.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f)
  return i
}
const reqPath = ({ d, a, u }) => [[0.05, u + 1.12, -0.12], [1.33, u + 0.2, -0.7], [1.33, a + 0.15, -0.7], [0, a + 0.5, 0], [1.45, a - 0.15, 0.75], [1.45, d + 0.2, 0.75], [-0.95, d + 0.78, -0.35]]
const resPath = ({ d, a, u }) => [[-0.95, d + 0.78, -0.35], [-1.45, d + 0.2, 0.75], [-1.45, a - 0.15, 0.75], [0, a + 0.5, 0], [-1.33, a + 0.15, -0.7], [-1.33, u + 0.2, -0.7], [0.05, u + 1.12, -0.12]]

function RoundTrip({ ys }) {
  const req = useRef(), res = useRef()
  const st = useRef({ p: -1, busy: false, hit: '' })
  useEffect(() => {
    const o = st.current
    const run = () => {
      if (o.busy) return
      o.busy = true; o.hit = ''; o.p = 0
      emit('request', { route: ['GET /trips', 'POST /pay', 'GET /users', 'PUT /cms'][Math.floor(Math.random() * 4)] })
      createTimeline({ onComplete: () => { o.busy = false; o.p = -1; emit('done', { ms: 28 + Math.round(Math.random() * 24) }) } })
        .add(o, { p: [0, 0.5], duration: 1500, ease: 'inOutSine' })
        .add(o, { p: 0.5, duration: 320 }) // the query runs
        .add(o, { p: [0.5, 1], duration: 1500, ease: 'inOutSine' })
    }
    const onReq = () => run()
    addEventListener('stack-request', onReq)
    const auto = setInterval(() => { if (!document.hidden && scrollY < innerHeight * 0.3) run() }, 7500)
    const first = setTimeout(run, 2600)
    return () => { removeEventListener('stack-request', onReq); clearInterval(auto); clearTimeout(first) }
  }, [])
  useFrame(() => {
    const o = st.current, y = ys.current
    const goingDown = o.p >= 0 && o.p < 0.5, goingUp = o.p >= 0.5
    if (goingDown) {
      const i = along(reqPath(y), o.p * 2, req.current.position)
      if (i >= 3 && !o.hit.includes('a')) { o.hit += 'a'; FX.api = 1; emit('api') }
      if (o.p > 0.49 && !o.hit.includes('d')) { o.hit += 'd'; FX.db = 1; emit('db') }
    } else along(reqPath(y), 0, req.current.position)
    if (goingUp) {
      const i = along(resPath(y), (o.p - 0.5) * 2, res.current.position)
      if (i >= 3 && !o.hit.includes('b')) { o.hit += 'b'; FX.api = 1; emit('api-back') }
      if (o.p > 0.99 && !o.hit.includes('u')) { o.hit += 'u'; FX.ui = 1; emit('ui') }
    } else along(resPath(y), 0, res.current.position)
    req.current.visible = goingDown
    res.current.visible = goingUp
  })
  return (
    <>
      <Trail width={1.8} length={5} color={'#d8ff5a'} attenuation={(t) => t * t}>
        <mesh ref={req}><sphereGeometry args={[0.095, 24, 24]} /><meshBasicMaterial color={GLOW_LIME} toneMapped={false} /></mesh>
      </Trail>
      <Trail width={1.8} length={5} color={'#62e8ff'} attenuation={(t) => t * t}>
        <mesh ref={res}><sphereGeometry args={[0.095, 24, 24]} /><meshBasicMaterial color={GLOW_CYAN} toneMapped={false} /></mesh>
      </Trail>
    </>
  )
}

function PaperPlane() {
  const g = useRef()
  const geo = useMemo(() => {
    const v = new Float32Array([0.5, 0, 0, -0.4, 0.02, 0.32, -0.3, 0, 0, 0.5, 0, 0, -0.3, 0, 0, -0.4, 0.02, -0.32, 0.5, 0, 0, -0.3, 0, 0, -0.35, -0.12, 0])
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(v, 3)); gg.computeVertexNormals(); return gg
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.2
    g.current.position.set(Math.cos(t) * 3.6, 0.6 + Math.sin(t * 2) * 0.4, Math.sin(t) * 2.6)
    g.current.rotation.set(Math.sin(t * 2) * 0.15, -t - Math.PI / 2, Math.cos(t) * 0.25)
  })
  return <mesh ref={g} geometry={geo} scale={0.36} castShadow><meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} roughness={0.7} /></mesh>
}

/* ------------------------------------------------------------------ atmosphere
   Studio staging instead of painted clouds: a warm light pool the model floats over,
   two slow orbit rings with travelling nodes (the stack's "network"), and fine dust. */
const noRay = () => null
function useGlowTexture(stops) {
  return useMemo(() => {
    const S = 256, c = document.createElement('canvas'); c.width = c.height = S
    const x = c.getContext('2d'), g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
    stops.forEach(([o, col]) => g.addColorStop(o, col))
    x.fillStyle = g; x.fillRect(0, 0, S, S)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
    return t
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

function Orbit({ radius, tilt, speed, color, nodes = 3, y = -1.5 }) {
  const g = useRef(), pts = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    g.current.rotation.y = t * 0.25
    pts.current.forEach((m, i) => {
      if (!m) return
      const a = t + (i / nodes) * Math.PI * 2
      m.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius)
    })
  })
  return (
    <group position-y={y} rotation={tilt}>
      <group ref={g}>
        <mesh rotation-x={Math.PI / 2} raycast={noRay}>
          <torusGeometry args={[radius, 0.006, 6, 160]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} toneMapped={false} />
        </mesh>
        {Array.from({ length: nodes }, (_, i) => (
          <mesh key={i} ref={(m) => (pts.current[i] = m)} raycast={noRay}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Atmosphere() {
  const pool = useGlowTexture([[0, 'rgba(255,236,200,0.95)'], [0.35, 'rgba(255,220,180,0.45)'], [0.7, 'rgba(232,255,180,0.12)'], [1, 'rgba(255,255,255,0)']])
  const shade = useGlowTexture([[0, 'rgba(40,52,46,0.42)'], [0.5, 'rgba(40,52,46,0.16)'], [1, 'rgba(40,52,46,0)']])
  const poolRef = useRef()
  useFrame(({ clock }) => {
    const k = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.03
    poolRef.current.scale.set(9 * k, 9 * k, 1)
  })
  return (
    <group>
      {/* soft cast shadow + warm light pool under the floating stack */}
      <mesh position={[0, -4.55, 0]} rotation-x={-Math.PI / 2} scale={[5.2, 3.6, 1]} raycast={noRay} renderOrder={-2}>
        <planeGeometry />
        <meshBasicMaterial map={shade} transparent depthWrite={false} />
      </mesh>
      <mesh ref={poolRef} position={[0, -4.6, 0]} rotation-x={-Math.PI / 2} raycast={noRay} renderOrder={-3}>
        <planeGeometry />
        <meshBasicMaterial map={pool} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.28} />
      </mesh>
      <Orbit radius={3.5} tilt={[0.32, 0, -0.12]} speed={0.35} color="#9fd8c4" nodes={3} y={-1.4} />
      <Orbit radius={4.3} tilt={[-0.18, 0, 0.2]} speed={-0.22} color="#e3c79a" nodes={2} y={-1.8} />
      <Sparkles count={70} scale={[11, 8, 6]} position={[0, -1, 0]} size={2.2} speed={0.25} opacity={0.6} color="#fff4d6" noise={0.6} />
      <Sparkles count={24} scale={[6, 6, 4]} position={[0, -1.4, 0]} size={3.2} speed={0.35} opacity={0.8} color="#d8ff5a" noise={1} />
    </group>
  )
}

/* ------------------------------------------------------------------ layer labels */
function LabelProjector() {
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    for (const l of LABELS) {
      v.set(...l.at).project(camera)
      l.x = (v.x * 0.5 + 0.5) * size.width; l.y = (-v.y * 0.5 + 0.5) * size.height; l.on = v.z < 1
    }
  })
  useEffect(() => () => LABELS.forEach((l) => (l.on = false)), [])
  return null
}

/* ------------------------------------------------------------------ camera rig */
function Rig({ zoomRef, screenRef, stack }) {
  const { camera, size, pointer } = useThree()
  const base = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => ({ c: new THREE.Vector3(), n: new THREE.Vector3(), q: new THREE.Quaternion(), p: new THREE.Vector3(), l: new THREE.Vector3() }), [])
  const sm = useRef({ x: 0, y: 0 })
  useFrame(() => {
    const aspect = size.width / size.height
    const narrow = aspect < 1.1
    const phone = aspect < 0.8
    const dist = phone ? 25 : narrow ? 22.5 : 21.5
    // copy sits centred on top; aim the camera above the model so it settles into the lower part of the frame
    base.set(0, 2.4, dist); look.set(0, phone ? 0.9 : narrow ? 1.6 : 1.1, 0)
    sm.current.x += (pointer.x - sm.current.x) * 0.04; sm.current.y += (pointer.y - sm.current.y) * 0.04
    base.x += sm.current.x * 0.9; base.y += sm.current.y * 0.4

    const e = stack ? 0 : zoomRef.current
    const k = smooth(0.25, 1, e)
    // desktop: the model sits on the right so the headline owns the left; the offset releases as we dive in
    const off = 0
    camera.setViewOffset(size.width, size.height, off, 0, size.width, size.height)

    const s = screenRef.current
    if (s && k > 0) {
      s.getWorldPosition(tmp.c); s.getWorldQuaternion(tmp.q)
      tmp.n.set(0, 0, 1).applyQuaternion(tmp.q)
      const fov = (camera.fov * Math.PI) / 180
      const dH = (0.78 * 0.92) / 2 / Math.tan(fov / 2), dW = (1.24 * 0.92) / 2 / Math.tan(fov / 2) / aspect
      tmp.p.copy(tmp.c).addScaledVector(tmp.n, Math.min(dH, dW) * 0.92)
      camera.position.lerpVectors(base, tmp.p, k)
      tmp.l.lerpVectors(look, tmp.c, Math.min(1, k * 1.4))
      camera.lookAt(tmp.l)
    } else {
      camera.position.copy(base); camera.lookAt(look)
    }
    camera.updateProjectionMatrix()
  })
  return null
}

/* ------------------------------------------------------------------ world */
function World({ zoomRef, stack }) {
  const m = useMats()
  const screenRef = useRef()
  const data = useRef(), api = useRef(), ui = useRef(), all = useRef()
  const ys = useRef({ d: -2.95, a: -1.48, u: 0 })
  const start = useRef(null)
  const frame = useRef(1e9) // last shadow signature
  const gl = useThree((st) => st.gl)
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    gl.transmissionResolutionScale = 0.5 // glass tier refracts a half-res copy of the scene
  }, [gl])
  // hovering a tier lifts it on a spring (react-spring physics)
  const [lift, liftApi] = useSprings(3, () => ({ y: 0, s: 1, config: { mass: 1, tension: 240, friction: 13 } }), [])
  const hovered = useRef(null)
  const hov = (i) => {
    if (hovered.current === i) return
    hovered.current = i
    liftApi.start((k) => ({ y: k === i ? 0.16 : 0, s: k === i ? 1.015 : 1 }))
  }
  const tierProps = (i) => ({ 'position-y': lift[i].y, scale: lift[i].s, onPointerMove: () => hov(i), onPointerOut: () => hov(null) })

  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime
    const now = clock.elapsedTime, t = now - start.current
    WIND.value = now
    FX.db *= 0.95; FX.api *= 0.93; FX.ui *= 0.95

    const e = stack ? 0 : zoomRef.current
    // tiers assemble on load (bottom first), then pull apart as you start to scroll
    const spread = smooth(0, 0.3, e) * 0.75
    const intro = (delay) => outBack(clamp((t - delay) / 1.3))
    data.current.position.y = -2.95 - spread * 2 - (1 - intro(0.1)) * 3 + Math.sin(now * 0.6 + 1.2) * 0.05
    api.current.position.y = -1.48 - spread - (1 - intro(0.35)) * 3 + Math.sin(now * 0.6 + 0.6) * 0.05
    ui.current.position.y = Math.sin(now * 0.6) * 0.05 - (1 - intro(0.6)) * 3
    ys.current = { d: data.current.position.y, a: api.current.position.y, u: ui.current.position.y }
    // scroll choreography: the model turns to show its side while the tiers twist apart,
    // then they square up again before the camera dives into the screen
    const turn = smooth(0, 0.3, e), settle = smooth(0.32, 0.6, e)
    all.current.rotation.y = -0.32 + Math.sin(now * 0.15) * 0.06 * (1 - turn) + turn * 0.55
    data.current.rotation.y = -turn * 0.18 * (1 - settle)
    api.current.rotation.y = turn * 0.12 * (1 - settle)
    // re-render the shadow map only when the model has moved enough to matter
    const sig = all.current.rotation.y * 10 + ys.current.d + ys.current.a * 3 + ys.current.u * 7
    if (Math.abs(sig - frame.current) > 0.04) { frame.current = sig; gl.shadowMap.needsUpdate = true }
  })

  return (
    <>
      <Rig zoomRef={zoomRef} screenRef={screenRef} stack={stack} />
      <hemisphereLight args={['#ffe8c0', '#c8f0dc', 1.1]} />
      <directionalLight position={[5, 9, 6]} intensity={3.8} color="#ffdd9a" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={4} shadow-camera-bottom={-6} shadow-camera-far={30} />
      <directionalLight position={[-6, 2, -5]} intensity={1.4} color="#b8d8ff" />
      <directionalLight position={[0, -2, -8]} intensity={0.9} color="#ffc87a" />
      <pointLight position={[0, -4.5, 2]} intensity={14} distance={8} color="#7fd8ff" />
      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 6, -6]} scale={[12, 4, 1]} color="#fff3e0" />
        <Lightformer intensity={1.4} position={[-7, 1, 3]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#e8e2ff" />
        <Lightformer intensity={1.6} position={[7, 1, 3]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} color="#ffe0c8" />
        <Lightformer form="ring" intensity={3} position={[3, 4, 5]} scale={2} color="#ffffff" />
      </Environment>

      <group ref={all}>
        <group ref={data}><animated.group {...tierProps(0)}><DataTier m={m} /></animated.group></group>
        <group ref={api}><animated.group {...tierProps(1)}><ApiTier m={m} /></animated.group></group>
        <group ref={ui}><animated.group {...tierProps(2)}><UiTier m={m} screenRef={screenRef} /></animated.group></group>
        <Tubes m={m} ys={ys} />
        <Packets ys={ys} />
        <RoundTrip ys={ys} />
        <PaperPlane />
      </group>

      <LabelProjector />

      <Atmosphere />
    </>
  )
}

export default function Scene({ zoomRef, stack, active = true }) {
  const rich = !stack && typeof window !== 'undefined' && matchMedia('(pointer: fine)').matches
  // adaptive quality: start high, step down resolution + AO if the frame rate can't hold
  const topDpr = Math.min(rich ? 1.5 : 1.25, typeof window !== 'undefined' ? window.devicePixelRatio : 1)
  const [dpr, setDpr] = useState(topDpr)
  // fixed per device: swapping effect chains at runtime recompiles shaders and hitches. Screen-space AO costs ~40% of
  // the frame, so it is opt-in (?ao=1); baked contact shadows give the grounding instead.
  const hq = rich && typeof location !== 'undefined' && new URLSearchParams(location.search).get('ao') === '1'
  return (
    <Canvas
      className="scene3d"
      shadows
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 30, near: 0.05, far: 120, position: [0, 2.6, 14.5] }}
      gl={{ antialias: !rich, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => say('')}
    >
      {/* step resolution down once if a device can't hold ~45fps; never back up (each resize reallocates buffers) */}
      <PerformanceMonitor bounds={() => [40, 58]} flipflops={1}
        onDecline={() => setDpr((d) => (d > 1 ? 1 : d))}
        onFallback={() => setDpr(1)} />
      <World zoomRef={zoomRef} stack={stack} />
      <Preload all />
      {hq ? (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <N8AO aoRadius={0.6} intensity={1.8} distanceFalloff={1} quality="performance" halfRes />
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.18} intensity={1.1} radius={0.78} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.28} darkness={0.42} />
          <SMAA />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.18} intensity={1.1} radius={0.78} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.28} darkness={0.42} />
          {rich ? <SMAA /> : null}
        </EffectComposer>
      )}
    </Canvas>
  )
}

// Screen positions of the 3D layer labels, written by the scene each frame and
// read by the DOM overlay in Stage (avoids one React root per drei <Html>).
export const LABELS = [
  { kicker: '03 · Interface', title: 'React.js', sub: 'UI, state, responsive', at: [2.0, 0.25, 0.4], x: 0, y: 0, on: false },
  { kicker: '02 · API', title: 'Node.js + REST', sub: 'auth, validation, flows', at: [1.95, -1.35, 0.4], x: 0, y: 0, on: false },
  { kicker: '01 · Data', title: 'PostgreSQL · MySQL', sub: 'models, queries, integrity', at: [2.0, -2.95, 0.4], x: 0, y: 0, on: false },
]

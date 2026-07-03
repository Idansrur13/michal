import { useEffect, useRef, useState } from 'react'

export interface Building3DProps {
  height: number
  width: number
}

/**
 * Three.js is loaded at runtime from a CDN (self-contained ESM build),
 * so no npm install is required for the 3D scene to work.
 */
const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js'

let threePromise: Promise<any> | null = null
function loadThree(): Promise<any> {
  if (!threePromise) {
    threePromise = import(/* @vite-ignore */ THREE_CDN)
  }
  return threePromise
}

/* ---------- lightweight orbit controls (drag to rotate, wheel to zoom) ---------- */

interface Orbit {
  update: (dt: number) => void
  setFrame: (targetY: number, radius: number) => void
  dispose: () => void
}

function createOrbit(camera: any, dom: HTMLElement): Orbit {
  const target = { x: 0, y: 14, z: 0 }
  let theta = Math.PI * 0.3
  let phi = 1.18
  let radius = 90
  let minR = 20
  let maxR = 280
  let dragging = false
  let px = 0
  let py = 0
  let lastInteraction = 0

  function apply() {
    const sp = Math.sin(phi)
    camera.position.set(
      target.x + radius * sp * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * sp * Math.cos(theta),
    )
    camera.lookAt(target.x, target.y, target.z)
  }

  function onPointerDown(e: PointerEvent) {
    dragging = true
    px = e.clientX
    py = e.clientY
    lastInteraction = performance.now()
    dom.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return
    theta -= (e.clientX - px) * 0.005
    phi = Math.min(1.5, Math.max(0.15, phi - (e.clientY - py) * 0.005))
    px = e.clientX
    py = e.clientY
    lastInteraction = performance.now()
  }

  function onPointerUp() {
    dragging = false
    lastInteraction = performance.now()
  }

  function onWheel(e: WheelEvent) {
    // zoom only with Ctrl / trackpad pinch, so normal scrolling still works
    if (!e.ctrlKey) return
    e.preventDefault()
    radius = Math.min(maxR, Math.max(minR, radius * (1 + e.deltaY * 0.0025)))
    lastInteraction = performance.now()
  }

  dom.addEventListener('pointerdown', onPointerDown)
  dom.addEventListener('pointermove', onPointerMove)
  dom.addEventListener('pointerup', onPointerUp)
  dom.addEventListener('pointercancel', onPointerUp)
  dom.addEventListener('wheel', onWheel, { passive: false })

  return {
    update(dt: number) {
      if (!dragging && performance.now() - lastInteraction > 2500) {
        theta += dt * 0.12
      }
      apply()
    },
    setFrame(targetY: number, r: number) {
      target.y = targetY
      radius = r
      minR = Math.max(12, r * 0.35)
      maxR = r * 2.6
      apply()
    },
    dispose() {
      dom.removeEventListener('pointerdown', onPointerDown)
      dom.removeEventListener('pointermove', onPointerMove)
      dom.removeEventListener('pointerup', onPointerUp)
      dom.removeEventListener('pointercancel', onPointerUp)
      dom.removeEventListener('wheel', onWheel)
    },
  }
}

/* ---------- helpers ---------- */

function makeLabel(THREE: any, text: string): any {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 112
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(8, 13, 24, 0.78)'
  ctx.beginPath()
  ctx.roundRect(4, 4, 312, 104, 26)
  ctx.fill()
  ctx.strokeStyle = 'rgba(232, 196, 106, 0.5)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.font = 'bold 46px system-ui, "Segoe UI", sans-serif'
  ctx.fillStyle = '#e8c46a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = 'rtl'
  ctx.fillText(text, 160, 60)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
  )
  sprite.scale.set(9, 3.15, 1)
  sprite.renderOrder = 10
  return sprite
}

function addDimLine(THREE: any, group: any, a: number[], b: number[], mat: any) {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(a[0], a[1], a[2]),
    new THREE.Vector3(b[0], b[1], b[2]),
  ])
  group.add(new THREE.Line(geo, mat))
}

/* ---------- the tower itself ---------- */

function buildTower(THREE: any, h: number, w: number): any {
  const g = new THREE.Group()
  const d = w * 0.8
  const floors = Math.max(1, Math.round(h / 3))
  const floorH = h / floors

  const concrete = new THREE.MeshStandardMaterial({ color: 0xd9dde4, roughness: 0.6, metalness: 0.05 })
  const darkConcrete = new THREE.MeshStandardMaterial({ color: 0x8f98a3, roughness: 0.7 })
  const stone = new THREE.MeshStandardMaterial({ color: 0x6d747f, roughness: 0.45, metalness: 0.15 })
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x16344f,
    roughness: 0.08,
    metalness: 0.6,
    envMapIntensity: 1.4,
  })
  const railGlass = new THREE.MeshPhysicalMaterial({
    color: 0x8fc3e8,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.35,
  })

  // main glass volume
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glass)
  body.position.y = h / 2
  body.castShadow = true
  g.add(body)

  // floor slabs
  const slabGeo = new THREE.BoxGeometry(w + 0.7, 0.26, d + 0.7)
  for (let f = 1; f <= floors; f++) {
    const slab = new THREE.Mesh(slabGeo, concrete)
    slab.position.y = f * floorH
    slab.castShadow = true
    g.add(slab)
  }

  // corner columns
  const colGeo = new THREE.BoxGeometry(0.7, h, 0.7)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const col = new THREE.Mesh(colGeo, stone)
      col.position.set(sx * (w / 2), h / 2, sz * (d / 2))
      col.castShadow = true
      g.add(col)
    }
  }

  // windows — instanced, some warmly lit
  const winGeo = new THREE.PlaneGeometry(1, 1)
  const litMat = new THREE.MeshStandardMaterial({
    color: 0x2a2318,
    emissive: 0xffc46b,
    emissiveIntensity: 1.5,
    roughness: 0.5,
  })
  const darkWinMat = new THREE.MeshStandardMaterial({ color: 0x0a141f, roughness: 0.15, metalness: 0.7 })
  const litMatrices: any[] = []
  const darkMatrices: any[] = []
  const pos = new THREE.Vector3()
  const quat = new THREE.Quaternion()
  const scl = new THREE.Vector3()
  const mtx = new THREE.Matrix4()
  const euler = new THREE.Euler()
  const faces = [
    { rotY: 0, faceW: w, off: d / 2 + 0.06, axis: 'z', sign: 1 },
    { rotY: Math.PI, faceW: w, off: d / 2 + 0.06, axis: 'z', sign: -1 },
    { rotY: Math.PI / 2, faceW: d, off: w / 2 + 0.06, axis: 'x', sign: 1 },
    { rotY: -Math.PI / 2, faceW: d, off: w / 2 + 0.06, axis: 'x', sign: -1 },
  ]
  for (const face of faces) {
    const cols = Math.max(2, Math.round(face.faceW / 2.4))
    const cellW = face.faceW / cols
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const u = -face.faceW / 2 + (c + 0.5) * cellW
        if (face.axis === 'z') {
          pos.set(u, (f + 0.55) * floorH, face.sign * face.off)
        } else {
          pos.set(face.sign * face.off, (f + 0.55) * floorH, u)
        }
        euler.set(0, face.rotY, 0)
        quat.setFromEuler(euler)
        scl.set(cellW * 0.62, floorH * 0.55, 1)
        mtx.compose(pos, quat, scl)
        if (Math.random() < 0.48) litMatrices.push(mtx.clone())
        else darkMatrices.push(mtx.clone())
      }
    }
  }
  const litMesh = new THREE.InstancedMesh(winGeo, litMat, litMatrices.length)
  litMatrices.forEach((m, i) => litMesh.setMatrixAt(i, m))
  const darkMesh = new THREE.InstancedMesh(winGeo, darkWinMat, darkMatrices.length)
  darkMatrices.forEach((m, i) => darkMesh.setMatrixAt(i, m))
  g.add(litMesh, darkMesh)

  // balconies, alternating sides on the front facade
  if (floors > 2) {
    const balcW = Math.min(w * 0.34, 7)
    const balcSlabGeo = new THREE.BoxGeometry(balcW, 0.14, 1.7)
    const balcRailGeo = new THREE.BoxGeometry(balcW, Math.min(floorH * 0.34, 1.15), 0.06)
    for (let f = 1; f < floors; f++) {
      const side = f % 2 === 0 ? 1 : -1
      const bx = side * w * 0.2
      const slab = new THREE.Mesh(balcSlabGeo, concrete)
      slab.position.set(bx, f * floorH + 0.08, d / 2 + 0.9)
      slab.castShadow = true
      const rail = new THREE.Mesh(balcRailGeo, railGlass)
      rail.position.set(bx, f * floorH + 0.65, d / 2 + 1.72)
      g.add(slab, rail)
    }
  }

  // lobby base
  const lobbyH = Math.min(4.4, Math.max(3, floorH * 1.15))
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, lobbyH, d + 1.6), stone)
  lobby.position.y = lobbyH / 2
  lobby.castShadow = true
  g.add(lobby)

  // glowing entrance + canopy
  const doorH = Math.min(3, lobbyH * 0.8)
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(4.4, w * 0.35), doorH),
    new THREE.MeshStandardMaterial({ color: 0x120e06, emissive: 0xffe0a3, emissiveIntensity: 1.8 }),
  )
  door.position.set(0, doorH / 2 + 0.05, d / 2 + 0.85)
  g.add(door)
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(Math.min(7, w * 0.5), 0.18, 3), darkConcrete)
  canopy.position.set(0, doorH + 0.35, d / 2 + 2.1)
  canopy.castShadow = true
  g.add(canopy)

  // roof + penthouse + spire
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.9, 0.4, d + 0.9), darkConcrete)
  roof.position.y = h + 0.2
  roof.castShadow = true
  g.add(roof)
  if (floors >= 6) {
    const ph = new THREE.Mesh(new THREE.BoxGeometry(w * 0.52, floorH * 1.05, d * 0.52), glass)
    ph.position.y = h + 0.4 + floorH * 0.52
    ph.castShadow = true
    g.add(ph)
    const phRoof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.58, 0.25, d * 0.58), concrete)
    phRoof.position.y = h + 0.5 + floorH * 1.05
    g.add(phRoof)
  }
  const spireH = Math.max(3.5, h * 0.07)
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, spireH, 8), stone)
  spire.position.y = h + (floors >= 6 ? floorH * 1.1 : 0) + spireH / 2 + 0.5
  g.add(spire)
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x330a0a, emissive: 0xff4444, emissiveIntensity: 2.4 }),
  )
  beacon.position.y = spire.position.y + spireH / 2 + 0.2
  g.add(beacon)

  // gold dimension lines + labels
  const dimMat = new THREE.LineBasicMaterial({ color: 0xe8c46a, transparent: true, opacity: 0.9 })
  const dims = new THREE.Group()
  const hx = w / 2 + 4
  const hz = d / 2 + 1.5
  addDimLine(THREE, dims, [hx, 0, hz], [hx, h, hz], dimMat)
  addDimLine(THREE, dims, [hx - 1.1, 0.02, hz], [hx + 1.1, 0.02, hz], dimMat)
  addDimLine(THREE, dims, [hx - 1.1, h, hz], [hx + 1.1, h, hz], dimMat)
  const hLabel = makeLabel(THREE, `גובה ${Math.round(h)} מ׳`)
  hLabel.position.set(hx + 1, h / 2, hz)
  dims.add(hLabel)

  const wz = d / 2 + 5
  addDimLine(THREE, dims, [-w / 2, 0.05, wz], [w / 2, 0.05, wz], dimMat)
  addDimLine(THREE, dims, [-w / 2, 0.05, wz - 1], [-w / 2, 0.05, wz + 1], dimMat)
  addDimLine(THREE, dims, [w / 2, 0.05, wz - 1], [w / 2, 0.05, wz + 1], dimMat)
  const wLabel = makeLabel(THREE, `רוחב ${Math.round(w)} מ׳`)
  wLabel.position.set(0, 2, wz + 1)
  dims.add(wLabel)
  g.add(dims)

  return g
}

/* ---------- static surroundings ---------- */

function buildSurroundings(THREE: any): any {
  const g = new THREE.Group()

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(170, 64),
    new THREE.MeshStandardMaterial({ color: 0x0c1524, roughness: 0.95 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  g.add(ground)

  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(42, 64),
    new THREE.MeshStandardMaterial({ color: 0x152137, roughness: 0.85 }),
  )
  plaza.rotation.x = -Math.PI / 2
  plaza.position.y = 0.02
  plaza.receiveShadow = true
  g.add(plaza)

  const grid = new THREE.GridHelper(340, 68, 0x233350, 0x17233a)
  grid.position.y = 0.04
  const gridMat = grid.material
  gridMat.transparent = true
  gridMat.opacity = 0.3
  g.add(grid)

  // neighbouring low-rise buildings
  const ctxMat = new THREE.MeshStandardMaterial({ color: 0x1a2740, roughness: 0.8 })
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.4
    const r = 52 + Math.random() * 40
    const bw = 8 + Math.random() * 8
    const bh = 7 + Math.random() * 16
    const box = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bw * (0.7 + Math.random() * 0.5)), ctxMat)
    box.position.set(Math.sin(angle) * r, bh / 2, Math.cos(angle) * r)
    box.rotation.y = Math.random() * Math.PI
    box.castShadow = true
    box.receiveShadow = true
    g.add(box)
  }

  // trees
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.6, 6)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2b1c, roughness: 1 })
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1e4d2b, roughness: 1 })
  for (let i = 0; i < 22; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 27 + Math.random() * 34
    const x = Math.sin(angle) * r
    const z = Math.cos(angle) * r
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.set(x, 0.8, z)
    const size = 1.3 + Math.random() * 1
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), leafMat)
    leaf.position.set(x, 1.6 + size * 0.8, z)
    leaf.castShadow = true
    g.add(trunk, leaf)
  }

  // street lamps around the plaza
  const poleGeo = new THREE.CylinderGeometry(0.07, 0.09, 4.4, 6)
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a3348, roughness: 0.6 })
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0x2a2416,
    emissive: 0xffd9a0,
    emissiveIntensity: 2.2,
  })
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const x = Math.sin(angle) * 38
    const z = Math.cos(angle) * 38
    const pole = new THREE.Mesh(poleGeo, poleMat)
    pole.position.set(x, 2.2, z)
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), lampMat)
    lamp.position.set(x, 4.5, z)
    g.add(pole, lamp)
  }

  return g
}

/* ---------- scene lifecycle ---------- */

interface SceneApi {
  setBuilding: (h: number, w: number) => void
  dispose: () => void
}

function disposeObject(obj: any) {
  obj.traverse((child: any) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of mats) {
        if (m.map) m.map.dispose()
        m.dispose()
      }
    }
  })
}

function createScene(THREE: any, mount: HTMLElement): SceneApi {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(mount.clientWidth, mount.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.domElement.style.touchAction = 'none'
  renderer.domElement.style.display = 'block'
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b1322)
  scene.fog = new THREE.Fog(0x0b1322, 110, 300)

  const camera = new THREE.PerspectiveCamera(
    45,
    mount.clientWidth / Math.max(1, mount.clientHeight),
    0.1,
    700,
  )

  // simple environment for glass reflections
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  const envSphere = new THREE.Mesh(
    new THREE.SphereGeometry(60, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x33445f, side: THREE.BackSide }),
  )
  envScene.add(envSphere)
  const softbox = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshBasicMaterial({ color: 0xbfd4ee }),
  )
  softbox.position.set(0, 45, 0)
  softbox.rotation.x = Math.PI / 2
  envScene.add(softbox)
  scene.environment = pmrem.fromScene(envScene).texture
  disposeObject(envScene)

  const hemi = new THREE.HemisphereLight(0x93aed4, 0x1a1410, 0.55)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffd9b0, 1.5)
  sun.position.set(70, 100, 45)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -95
  sun.shadow.camera.right = 95
  sun.shadow.camera.top = 130
  sun.shadow.camera.bottom = -60
  sun.shadow.camera.far = 320
  sun.shadow.bias = -0.0004
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x5a76b8, 0.45)
  fill.position.set(-60, 40, -50)
  scene.add(fill)

  scene.add(buildSurroundings(THREE))

  const orbit = createOrbit(camera, renderer.domElement)

  let building: any = null

  const observer = new ResizeObserver(() => {
    const wPx = mount.clientWidth
    const hPx = mount.clientHeight
    if (wPx === 0 || hPx === 0) return
    camera.aspect = wPx / hPx
    camera.updateProjectionMatrix()
    renderer.setSize(wPx, hPx)
  })
  observer.observe(mount)

  const clock = new THREE.Clock()
  let raf = 0
  function animate() {
    raf = requestAnimationFrame(animate)
    orbit.update(clock.getDelta())
    renderer.render(scene, camera)
  }
  animate()

  return {
    setBuilding(h: number, w: number) {
      if (building) {
        scene.remove(building)
        disposeObject(building)
      }
      building = buildTower(THREE, h, w)
      scene.add(building)
      const radius = Math.max(h * 1.5, w * 2.7, 40)
      orbit.setFrame(h * 0.42, radius)
    },
    dispose() {
      cancelAnimationFrame(raf)
      observer.disconnect()
      orbit.dispose()
      if (building) disposeObject(building)
      disposeObject(scene)
      pmrem.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement)
      }
    },
  }
}

/* ---------- React component ---------- */

export default function Building3D({ height, width }: Building3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<SceneApi | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let disposed = false
    loadThree()
      .then((THREE) => {
        if (disposed || !mountRef.current) return
        apiRef.current = createScene(THREE, mountRef.current)
        setStatus('ready')
      })
      .catch(() => {
        if (!disposed) setStatus('error')
      })
    return () => {
      disposed = true
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'ready' && apiRef.current) {
      apiRef.current.setBuilding(height, width)
    }
  }, [height, width, status])

  return (
    <div ref={mountRef} className="scene-mount" aria-label="הדמיה תלת־ממדית של הבניין">
      {status === 'loading' && <div className="scene-overlay">טוען הדמיה תלת־ממדית…</div>}
      {status === 'error' && (
        <div className="scene-overlay">לא ניתן לטעון את ההדמיה — בדקו את החיבור לאינטרנט ורעננו</div>
      )}
    </div>
  )
}

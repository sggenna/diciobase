import { useEffect, useRef } from "react"
import { geoEquirectangular, geoPath } from "d3-geo"
import {
  CatmullRomCurve3,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three"

const LAND_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/50m/physical/ne_50m_land.json"

const GLOBE_RADIUS = 1.3
const CAMERA_DISTANCE = 3.7
const FOV = 50
const MIN_ZOOM = 1.8
const MAX_ZOOM = 4.8
const ZOOM_SENSITIVITY = 0.0022
const IDLE_SPEED = 0.0018
const DRAG_SENSITIVITY = 0.0028
const VELOCITY_DECAY = 0.94
const LERP = 0.08
const DOT_STEP = 1.5
const DOT_SIZE = 0.0075
const RING_SIMPLIFY = 3
const OCEAN_COLOR = "#000000"
const DOT_COLOR = "#ffffff"
const OUTLINE_COLOR = "#ffffff"
const GRATICULE_COLOR = "#D4D4D4"
const BITMAP_W = 1024
const BITMAP_H = 512

function latLngToVector3(lat: number, lng: number): Vector3 {
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  return new Vector3(
    Math.cos(latRad) * Math.sin(lngRad),
    Math.sin(latRad),
    Math.cos(latRad) * Math.cos(lngRad),
  )
}

function simplifyRing(ring: number[][], step: number): number[][] {
  if (ring.length <= step * 2) return ring
  const out: number[][] = [ring[0]]
  for (let i = step; i < ring.length - 1; i += step) out.push(ring[i])
  out.push(ring[ring.length - 1])
  return out
}

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    let width = container.clientWidth || 320
    let height = container.clientHeight || 320
    let zoom = CAMERA_DISTANCE

    const scene = new Scene()
    const camera = new PerspectiveCamera(FOV, width / height, 0.1, 100)
    camera.position.set(0, 0, zoom)
    camera.lookAt(0, 0, 0)

    const renderer = new WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const canvas = renderer.domElement
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.display = "block"
    canvas.style.cursor = "grab"
    container.appendChild(canvas)

    const group = new Group()
    scene.add(group)

    const dotColorObj = new Color(DOT_COLOR)
    const outlineColorObj = new Color(OUTLINE_COLOR)

    const ocean = new Mesh(
      new SphereGeometry(GLOBE_RADIUS, 64, 64),
      new MeshBasicMaterial({ color: new Color(OCEAN_COLOR) }),
    )
    group.add(ocean)

    const graticuleGroup = new Group()
    const graticuleMaterial = new MeshBasicMaterial({
      color: new Color(GRATICULE_COLOR),
    })
    const graticuleGeometries: TubeGeometry[] = []
    const addGraticuleLine = (pts: Vector3[]) => {
      const geo = new TubeGeometry(
        new CatmullRomCurve3(pts),
        pts.length * 2,
        GLOBE_RADIUS * 0.0008,
        6,
        false,
      )
      graticuleGeometries.push(geo)
      graticuleGroup.add(new Mesh(geo, graticuleMaterial))
    }
    for (let lat = -90; lat <= 90; lat += 15) {
      const pts: Vector3[] = []
      for (let i = 0; i <= 64; i++) {
        pts.push(
          latLngToVector3(lat, (i / 64) * 360 - 180).multiplyScalar(
            GLOBE_RADIUS * 1.002,
          ),
        )
      }
      addGraticuleLine(pts)
    }
    for (let lng = -180; lng < 180; lng += 15) {
      const pts: Vector3[] = []
      for (let i = 0; i <= 64; i++) {
        pts.push(
          latLngToVector3((i / 64) * 180 - 90, lng).multiplyScalar(
            GLOBE_RADIUS * 1.002,
          ),
        )
      }
      addGraticuleLine(pts)
    }
    group.add(graticuleGroup)

    const outlineGroup = new Group()
    group.add(outlineGroup)
    let dotsMesh: InstancedMesh | null = null

    async function load() {
      try {
        const res = await fetch(LAND_URL)
        if (!res.ok) throw new Error("land fetch failed")
        const land = await res.json()
        if (cancelled) return

        const offscreen = document.createElement("canvas")
        offscreen.width = BITMAP_W
        offscreen.height = BITMAP_H
        const ctx = offscreen.getContext("2d", { willReadFrequently: true })
        if (!ctx) throw new Error("no 2d context")
        const projection = geoEquirectangular().fitSize(
          [BITMAP_W, BITMAP_H],
          { type: "Sphere" } as unknown as GeoJSON.GeometryCollection,
        )
        const pathGen = geoPath().projection(projection).context(ctx)
        ctx.fillStyle = "#000"
        ctx.fillRect(0, 0, BITMAP_W, BITMAP_H)
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        land.features.forEach((f: GeoJSON.Feature) => pathGen(f))
        ctx.fill()
        const pixels = ctx.getImageData(0, 0, BITMAP_W, BITMAP_H).data

        function isOnLand(lng: number, lat: number) {
          const x = Math.round(((lng + 180) / 360) * BITMAP_W) % BITMAP_W
          const y = Math.round(((90 - lat) / 180) * BITMAP_H)
          const cy = Math.max(0, Math.min(BITMAP_H - 1, y))
          const idx = (cy * BITMAP_W + x) * 4
          return pixels[idx] > 128
        }

        const dotPositions: Vector3[] = []
        for (let lat = -84; lat <= 84; lat += DOT_STEP) {
          const latRad = (Math.abs(lat) * Math.PI) / 180
          const cosLat = Math.cos(latRad)
          const lngStep = cosLat > 0.01 ? DOT_STEP / Math.max(0.3, cosLat) : 360
          for (let lng = -180; lng < 180; lng += lngStep) {
            if (isOnLand(lng, lat)) {
              dotPositions.push(
                latLngToVector3(lat, lng).multiplyScalar(GLOBE_RADIUS * 1.006),
              )
            }
          }
        }
        buildDots(dotPositions)

        const projection2 = geoEquirectangular()
        const pathGen2 = geoPath().projection(projection2)
        land.features.forEach((feature: GeoJSON.Feature) => {
          const geometry = feature.geometry
          if (!geometry) return
          if (!pathGen2(feature)) return
          const processRing = (ring: number[][]) => {
            if (ring.length < 2) return
            const simplified = simplifyRing(ring, RING_SIMPLIFY)
            const pts = simplified.map(([lng, lat]) =>
              latLngToVector3(lat, lng).multiplyScalar(GLOBE_RADIUS * 1.008),
            )
            if (pts.length < 2) return
            if (pts[0].distanceTo(pts[pts.length - 1]) > 0.001) {
              pts.push(pts[0].clone())
            }
            if (pts.length < 2) return
            const curve = new CatmullRomCurve3(pts)
            const tube = new TubeGeometry(
              curve,
              pts.length * 2,
              GLOBE_RADIUS * 0.0016,
              6,
              false,
            )
            const mat = new MeshBasicMaterial({
              color: outlineColorObj,
            })
            outlineGroup.add(new Mesh(tube, mat))
          }
          if (geometry.type === "Polygon") {
            processRing(geometry.coordinates[0])
          } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((poly) => processRing(poly[0]))
          }
        })
      } catch {
        if (!cancelled) {
          const fallback: Vector3[] = []
          for (let lat = -84; lat <= 84; lat += DOT_STEP) {
            const latRad = (Math.abs(lat) * Math.PI) / 180
            const cosLat = Math.cos(latRad)
            const lngStep = cosLat > 0.01 ? DOT_STEP / Math.max(0.3, cosLat) : 360
            for (let lng = -180; lng < 180; lng += lngStep) {
              fallback.push(
                latLngToVector3(lat, lng).multiplyScalar(GLOBE_RADIUS * 1.006),
              )
            }
          }
          buildDots(fallback)
        }
      }
    }

    function buildDots(positions: Vector3[]) {
      if (!positions.length) return
      const geometry = new SphereGeometry(DOT_SIZE, 5, 5)
      const material = new MeshBasicMaterial({ color: dotColorObj })
      const mesh = new InstancedMesh(geometry, material, positions.length)
      const matrix = new Matrix4()
      positions.forEach((p, i) => {
        matrix.setPosition(p.x, p.y, p.z)
        mesh.setMatrixAt(i, matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      dotsMesh = mesh
      group.add(mesh)
    }

    load()

    const rotation = { x: 0, y: 0.3 }
    const target = { x: 0, y: 0.3 }
    const velocity = { x: 0, y: 0 }
    let isDragging = false
    let isHovering = false
    let lastX = 0
    let lastY = 0
    let rafId: number | null = null

    function animate() {
      if (!isDragging && !reduceMotion && !isHovering) {
        target.x += IDLE_SPEED
      }
      if (!isDragging) {
        target.x += velocity.x
        target.y += velocity.y
        target.y = Math.max(-1.2, Math.min(1.2, target.y))
        velocity.x *= VELOCITY_DECAY
        velocity.y *= VELOCITY_DECAY
      }
      rotation.x += (target.x - rotation.x) * LERP
      rotation.y += (target.y - rotation.y) * LERP
      group.rotation.y = rotation.x
      group.rotation.x = rotation.y

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    function onPointerDown(e: PointerEvent) {
      isDragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.style.cursor = "grabbing"
      canvas.setPointerCapture(e.pointerId)
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      target.x += dx * DRAG_SENSITIVITY
      target.y += dy * DRAG_SENSITIVITY
      target.y = Math.max(-1.2, Math.min(1.2, target.y))
      velocity.x = dx * DRAG_SENSITIVITY * 0.4
      velocity.y = dy * DRAG_SENSITIVITY * 0.4
      lastX = e.clientX
      lastY = e.clientY
    }
    function onPointerUp(e: PointerEvent) {
      isDragging = false
      canvas.style.cursor = "grab"
      canvas.releasePointerCapture(e.pointerId)
    }
    function onPointerEnter() {
      isHovering = true
    }
    function onPointerLeave() {
      isHovering = false
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      zoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoom + e.deltaY * ZOOM_SENSITIVITY),
      )
      camera.position.z = zoom
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointerenter", onPointerEnter)
    canvas.addEventListener("pointerleave", onPointerLeave)
    canvas.addEventListener("wheel", onWheel, { passive: false })

    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth || width
      height = container.clientHeight || height
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    })
    resizeObserver.observe(container)

    return () => {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointerenter", onPointerEnter)
      canvas.removeEventListener("pointerleave", onPointerLeave)
      canvas.removeEventListener("wheel", onWheel)
      resizeObserver.disconnect()
      ocean.geometry.dispose()
      ocean.material.dispose()
      graticuleGeometries.forEach((g) => g.dispose())
      graticuleMaterial.dispose()
      dotsMesh?.geometry.dispose()
      ;(dotsMesh?.material as MeshBasicMaterial | undefined)?.dispose()
      outlineGroup.children.forEach((c) => {
        const m = c as Mesh
        m.geometry.dispose()
        ;(m.material as MeshBasicMaterial).dispose()
      })
      renderer.dispose()
      container.removeChild(canvas)
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full" aria-hidden="true" />
  )
}

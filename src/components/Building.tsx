import { useMemo } from 'react'

const CANVAS_W = 460
const CANVAS_H = 520
const GROUND_Y = 470
const MAX_BUILDING_H = 400
const MAX_BUILDING_W = 320

export interface BuildingProps {
  height: number
  width: number
}

interface WindowRect {
  x: number
  y: number
  w: number
  h: number
}

export function buildingStats(height: number, width: number): { floors: number; windowCols: number } {
  const floors = Math.max(1, Math.round(Math.max(height, 1) / 3))
  const windowCols = Math.max(1, Math.round(Math.max(width, 1) / 3.5))
  return { floors, windowCols }
}

export default function Building({ height, width }: BuildingProps) {
  const h = Math.max(height, 1)
  const w = Math.max(width, 1)

  const scale = Math.min(14, MAX_BUILDING_H / h, MAX_BUILDING_W / w)
  const buildingH = h * scale
  const buildingW = w * scale
  const buildingX = (CANVAS_W - buildingW) / 2
  const buildingY = GROUND_Y - buildingH

  const { floors, windowCols } = buildingStats(h, w)
  const floorH = buildingH / floors

  const windows = useMemo(() => {
    const list: WindowRect[] = []
    const wPad = buildingW * 0.12
    const hPad = floorH * 0.28
    const colGap = 6
    const usableW = buildingW - wPad * 2
    const winW = Math.max(4, (usableW - colGap * (windowCols - 1)) / windowCols)
    const winH = Math.max(4, floorH - hPad * 2)
    const middleCol = Math.floor(windowCols / 2)

    for (let f = 0; f < floors; f++) {
      const isGroundFloor = f === floors - 1
      for (let c = 0; c < windowCols; c++) {
        if (isGroundFloor && c === middleCol && windowCols > 1) continue
        list.push({
          x: buildingX + wPad + c * (winW + colGap),
          y: buildingY + f * floorH + hPad,
          w: winW,
          h: winH,
        })
      }
    }
    return list
  }, [buildingX, buildingY, buildingW, floorH, floors, windowCols])

  const doorW = Math.min(buildingW * 0.16, 34)
  const doorH = Math.min(floorH * 0.75, 46)
  const doorX = buildingX + buildingW / 2 - doorW / 2
  const doorY = GROUND_Y - doorH
  const heightLabelY = (buildingY + GROUND_Y) / 2

  return (
    <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="building-canvas" role="img" aria-label="הדמיית הבניין">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f1b30" />
          <stop offset="100%" stopColor="#16233d" />
        </linearGradient>
        <linearGradient id="facade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#eef2f8" />
          <stop offset="100%" stopColor="#cfd8e6" />
        </linearGradient>
        <pattern id="grid" width={24} height={24} patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#2a3a5c" strokeWidth={0.6} opacity={0.5} />
        </pattern>
      </defs>

      <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="url(#sky)" />
      <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="url(#grid)" />

      <line x1={0} y1={GROUND_Y} x2={CANVAS_W} y2={GROUND_Y} stroke="#4c6187" strokeWidth={1.5} />
      <rect x={0} y={GROUND_Y} width={CANVAS_W} height={CANVAS_H - GROUND_Y} fill="#0b1424" />

      <g stroke="#7dd3fc" strokeWidth={1} fill="none">
        <line x1={buildingX - 22} y1={buildingY} x2={buildingX - 22} y2={GROUND_Y} />
        <line x1={buildingX - 28} y1={buildingY} x2={buildingX - 16} y2={buildingY} />
        <line x1={buildingX - 28} y1={GROUND_Y} x2={buildingX - 16} y2={GROUND_Y} />
      </g>
      <text
        x={buildingX - 32}
        y={heightLabelY}
        fill="#7dd3fc"
        fontSize={13}
        textAnchor="middle"
        transform={`rotate(-90 ${buildingX - 32} ${heightLabelY})`}
      >
        {height} מ&apos;
      </text>

      <g stroke="#7dd3fc" strokeWidth={1} fill="none">
        <line x1={buildingX} y1={GROUND_Y + 20} x2={buildingX + buildingW} y2={GROUND_Y + 20} />
        <line x1={buildingX} y1={GROUND_Y + 14} x2={buildingX} y2={GROUND_Y + 26} />
        <line x1={buildingX + buildingW} y1={GROUND_Y + 14} x2={buildingX + buildingW} y2={GROUND_Y + 26} />
      </g>
      <text x={buildingX + buildingW / 2} y={GROUND_Y + 38} fill="#7dd3fc" fontSize={13} textAnchor="middle">
        {width} מ&apos;
      </text>

      <rect
        x={buildingX}
        y={buildingY}
        width={buildingW}
        height={buildingH}
        fill="url(#facade)"
        stroke="#8b98ab"
        strokeWidth={1.5}
      />
      <rect x={buildingX - 4} y={buildingY - 8} width={buildingW + 8} height={8} fill="#9aa7ba" />

      {Array.from({ length: floors - 1 }, (_, i) => i + 1).map((f) => (
        <line
          key={`floor-${f}`}
          x1={buildingX}
          y1={buildingY + f * floorH}
          x2={buildingX + buildingW}
          y2={buildingY + f * floorH}
          stroke="#aab4c4"
          strokeWidth={0.75}
        />
      ))}

      {windows.map((win, i) => (
        <rect
          key={`win-${i}`}
          x={win.x}
          y={win.y}
          width={win.w}
          height={win.h}
          rx={1}
          fill="#ffd873"
          stroke="#7a6420"
          strokeWidth={0.5}
        />
      ))}

      <rect x={doorX} y={doorY} width={doorW} height={doorH} fill="#3b2c22" stroke="#20160f" strokeWidth={0.5} />
    </svg>
  )
}

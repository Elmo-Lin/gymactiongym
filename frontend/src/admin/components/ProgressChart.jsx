import { useEffect, useRef, useState } from 'react'
import { formatWeight, shortDate } from '../utils.js'

const HEIGHT = 220
const PAD = { top: 24, right: 20, bottom: 28, left: 40 }

function niceTicks(min, max, count = 4) {
  const span = max - min || 1
  const raw = span / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)
  const start = Math.floor(min / step) * step
  const ticks = []
  for (let v = start; v <= max + step * 0.5; v += step) ticks.push(v)
  return ticks
}

// points: [{ date, weight, reps }]
export default function ProgressChart({ points }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(600)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const el = wrapRef.current
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (points.length === 0) return <p className="empty">尚無紀錄</p>

  const weights = points.map((p) => p.weight)
  const ticks = niceTicks(Math.min(...weights) * 0.9, Math.max(...weights) * 1.05)
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]
  const innerW = width - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const x = (i) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v) => PAD.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.weight)}`).join(' ')

  // x 軸只標幾個日期，避免擠在一起
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(innerW / 64))))
  const last = points.length - 1

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    let nearest = 0
    points.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(nearest) - px)) nearest = i
    })
    setHover(nearest)
  }

  const hp = hover !== null ? points[hover] : null

  return (
    <div className="chart" ref={wrapRef}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`重量從 ${points[0].weight} 公斤進步到 ${points[last].weight} 公斤`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="axis" x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
              {formatWeight(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === last ? (
            <text key={p.date} className="axis" x={x(i)} y={HEIGHT - 8} textAnchor="middle">
              {shortDate(p.date)}
            </text>
          ) : null,
        )}
        <path className="line" d={path} />
        {hp && (
          <line
            className="crosshair"
            x1={x(hover)}
            x2={x(hover)}
            y1={PAD.top}
            y2={PAD.top + innerH}
          />
        )}
        {points.map((p, i) => (
          <circle
            key={p.date + i}
            className={`dot ${i === last ? 'last' : ''} ${hover === i ? 'active' : ''}`}
            cx={x(i)}
            cy={y(p.weight)}
            r={hover === i || i === last ? 5 : 3.5}
          />
        ))}
        <text className="value-label" x={x(last)} y={y(points[last].weight) - 12} textAnchor="end">
          {formatWeight(points[last].weight)} kg
        </text>
      </svg>
      {hp && (
        <div
          className="tooltip"
          style={{
            left: Math.min(Math.max(x(hover), 70), width - 70),
            top: y(hp.weight) - 12,
          }}
        >
          <span className="muted">{shortDate(hp.date)}</span>
          <strong>
            {formatWeight(hp.weight)} kg × {hp.reps}
          </strong>
        </div>
      )}
    </div>
  )
}

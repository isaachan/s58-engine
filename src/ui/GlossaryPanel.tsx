import React, { useEffect, useMemo, useRef, useState } from 'react'
import { GLOSSARY, GLOSSARY_LIST, type GlossaryEntry } from '../data/glossary'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { SourceList } from './SourceList'

type GlossaryEdge = {
  source: string
  target: string
  key: string
}

type Vec3 = {
  x: number
  y: number
  z: number
}

type SphereNode = {
  id: string
  entry: GlossaryEntry
  position: Vec3
  width: number
  height: number
  fontSize: number
  degree: number
}

type Rotation = {
  x: number
  y: number
}

type ProjectedPoint = {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
}

type ProjectedNode = SphereNode & ProjectedPoint

const CLOUD_WIDTH = 720
const CLOUD_HEIGHT = 500
const SPHERE_RADIUS = 190
const CENTER_X = CLOUD_WIDTH / 2
const CENTER_Y = CLOUD_HEIGHT / 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const buildEdges = (): GlossaryEdge[] => {
  const keys = new Set<string>()
  const edges: GlossaryEdge[] = []

  for (const entry of GLOSSARY_LIST) {
    for (const relatedId of entry.related ?? []) {
      if (!GLOSSARY[relatedId]) continue
      const [source, target] = [entry.id, relatedId].sort()
      const key = `${source}:${target}`
      if (keys.has(key)) continue
      keys.add(key)
      edges.push({ source, target, key })
    }
  }

  return edges
}

const EDGES = buildEdges()

const estimateNodeWidth = (entry: GlossaryEntry, lang: 'en' | 'zh', fontSize: number) => {
  const label = entry.term[lang]
  const characterWidth = lang === 'zh' ? fontSize : fontSize * 0.56
  return Math.max(58, Math.min(184, label.length * characterWidth + 18))
}

const buildSphereNodes = (lang: 'en' | 'zh'): SphereNode[] => {
  const degree = new Map(GLOSSARY_LIST.map((entry) => [entry.id, 0]))
  for (const edge of EDGES) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
  }

  const ordered = [...GLOSSARY_LIST].sort((a, b) => {
    const degreeDelta = (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0)
    return degreeDelta || a.term[lang].localeCompare(b.term[lang])
  })

  return ordered.map((entry, index) => {
    const nodeDegree = degree.get(entry.id) ?? 0
    const fontSize = 12.5 + Math.min(7.5, nodeDegree * 1.8)
    const y = ordered.length === 1 ? 0 : 1 - (index / (ordered.length - 1)) * 2
    const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = index * GOLDEN_ANGLE

    return {
      id: entry.id,
      entry,
      degree: nodeDegree,
      fontSize,
      width: estimateNodeWidth(entry, lang, fontSize),
      height: 28 + Math.min(8, nodeDegree * 2),
      position: {
        x: Math.cos(theta) * horizontalRadius,
        y,
        z: Math.sin(theta) * horizontalRadius,
      },
    }
  })
}

const rotatePoint = (point: Vec3, rotation: Rotation): Vec3 => {
  const cosY = Math.cos(rotation.y)
  const sinY = Math.sin(rotation.y)
  const yawedX = point.x * cosY + point.z * sinY
  const yawedZ = -point.x * sinY + point.z * cosY

  const cosX = Math.cos(rotation.x)
  const sinX = Math.sin(rotation.x)
  return {
    x: yawedX,
    y: point.y * cosX - yawedZ * sinX,
    z: point.y * sinX + yawedZ * cosX,
  }
}

const projectPoint = (point: Vec3, rotation: Rotation): ProjectedPoint => {
  const rotated = rotatePoint(point, rotation)
  const depth = (rotated.z + 1) / 2
  const perspective = 0.9 + depth * 0.16

  return {
    x: CENTER_X + rotated.x * SPHERE_RADIUS * perspective,
    y: CENTER_Y + rotated.y * SPHERE_RADIUS * perspective,
    z: rotated.z,
    scale: 0.68 + depth * 0.48,
    opacity: 0.2 + Math.pow(depth, 1.15) * 0.8,
  }
}

const normalize = (point: Vec3): Vec3 => {
  const length = Math.hypot(point.x, point.y, point.z) || 1
  return { x: point.x / length, y: point.y / length, z: point.z / length }
}

/** Samples the shortest great-circle route so relationship lines follow the sphere. */
const greatCirclePoints = (source: Vec3, target: Vec3, steps = 14): Vec3[] => {
  const dot = Math.max(-1, Math.min(1, source.x * target.x + source.y * target.y + source.z * target.z))
  const omega = Math.acos(dot)
  const sinOmega = Math.sin(omega)

  if (omega < 0.001 || Math.abs(sinOmega) < 0.001) {
    return Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps
      return normalize({
        x: source.x * (1 - t) + target.x * t,
        y: source.y * (1 - t) + target.y * t,
        z: source.z * (1 - t) + target.z * t,
      })
    })
  }

  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps
    const sourceWeight = Math.sin((1 - t) * omega) / sinOmega
    const targetWeight = Math.sin(t * omega) / sinOmega
    return {
      x: source.x * sourceWeight + target.x * targetWeight,
      y: source.y * sourceWeight + target.y * targetWeight,
      z: source.z * sourceWeight + target.z * targetWeight,
    }
  })
}

const buildArcPath = (source: Vec3, target: Vec3, rotation: Rotation) =>
  greatCirclePoints(source, target)
    .map((point, index) => {
      const projected = projectPoint(point, rotation)
      return `${index === 0 ? 'M' : 'L'} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`
    })
    .join(' ')

const focusRotation = (point: Vec3): Rotation => ({
  x: Math.atan2(point.y, Math.hypot(point.x, point.z)),
  y: Math.atan2(-point.x, point.z),
})

const matchesQuery = (entry: GlossaryEntry, query: string) => {
  const trimmed = query.trim()
  const normalized = trimmed.toLowerCase()
  if (!normalized) return true

  return (
    entry.term.en.toLowerCase().includes(normalized) ||
    entry.term.zh.includes(trimmed) ||
    entry.match.en.some((match) => match.toLowerCase().includes(normalized)) ||
    entry.match.zh.some((match) => match.includes(trimmed))
  )
}

/**
 * Searchable glossary rendered as a rotating spherical word cloud. Terms sit
 * on a Fibonacci sphere; explicit glossary relationships follow great-circle
 * arcs across its surface.
 */
export const GlossaryPanel: React.FC = () => {
  const open = useStore((state) => state.glossaryOpen)
  const { lang, t } = useI18n()
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [rotation, setRotation] = useState<Rotation>({ x: -0.2, y: 0.35 })
  const dragRef = useRef<{
    pointerId: number
    lastX: number
    lastY: number
    totalDistance: number
    candidateId: string | null
  } | null>(null)

  const nodes = useMemo(() => buildSphereNodes(lang), [lang])
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])

  const matchedIds = useMemo(
    () => new Set(GLOSSARY_LIST.filter((entry) => matchesQuery(entry, query)).map((entry) => entry.id)),
    [query],
  )
  const hasQuery = query.trim().length > 0

  const visibleIds = useMemo(() => {
    if (!hasQuery) return new Set(GLOSSARY_LIST.map((entry) => entry.id))

    const ids = new Set(matchedIds)
    for (const edge of EDGES) {
      if (matchedIds.has(edge.source) || matchedIds.has(edge.target)) {
        ids.add(edge.source)
        ids.add(edge.target)
      }
    }
    return ids
  }, [hasQuery, matchedIds])

  const activeRelatedIds = useMemo(() => {
    const ids = new Set<string>()
    if (!activeId) return ids
    for (const edge of EDGES) {
      if (edge.source === activeId) ids.add(edge.target)
      if (edge.target === activeId) ids.add(edge.source)
    }
    return ids
  }, [activeId])

  const projectedNodes = useMemo(
    () =>
      nodes
        .filter((node) => visibleIds.has(node.id))
        .map((node) => ({ ...node, ...projectPoint(node.position, rotation) }))
        .sort((a, b) => a.z - b.z),
    [nodes, rotation, visibleIds],
  )

  const visibleEdges = useMemo(
    () => EDGES.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
    [visibleIds],
  )

  useEffect(() => {
    if (!open) return

    let frameId = 0
    let previousTime = performance.now()
    const animate = (time: number) => {
      const elapsed = Math.min(40, time - previousTime)
      previousTime = time
      if (!dragRef.current) {
        setRotation((current) => ({ ...current, y: current.y + elapsed * 0.000075 }))
      }
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [open])

  if (!open) return null

  const active = activeId ? GLOSSARY[activeId] : null
  const close = () => useStore.getState().setGlossaryOpen(false)

  const selectNode = (node: SphereNode) => {
    setActiveId(node.id)
    setRotation(focusRotation(node.position))
  }

  const beginDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    const target = event.target as Element
    const candidateId = target.closest('[data-glossary-node-id]')?.getAttribute('data-glossary-node-id') ?? null

    dragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      totalDistance: 0,
      candidateId,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.lastX
    const deltaY = event.clientY - drag.lastY
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    drag.totalDistance += Math.abs(deltaX) + Math.abs(deltaY)

    setRotation((current) => ({
      x: current.x + deltaY * 0.008,
      y: current.y + deltaX * 0.008,
    }))
  }

  const endDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (drag?.pointerId !== event.pointerId) return

    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (drag.totalDistance <= 5 && drag.candidateId) {
      const node = nodeById.get(drag.candidateId)
      if (node) selectNode(node)
    }
  }

  return (
    <div className="gloss-overlay" onMouseDown={close}>
      <div className="gloss-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="gloss-modal-head">
          <h2>{t('glossary.title')}</h2>
          <button className="gloss-close" onClick={close} aria-label="Close">
            ✕
          </button>
        </div>
        <input
          className="gloss-search"
          placeholder={t('glossary.search')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
        <div className="gloss-body">
          <div className="gloss-cloud">
            <svg
              className="gloss-cloud-viewport"
              viewBox={`0 0 ${CLOUD_WIDTH} ${CLOUD_HEIGHT}`}
              role="group"
              aria-label={t('glossary.title')}
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <g className="gloss-sphere-guides" aria-hidden="true">
                <circle cx={CENTER_X} cy={CENTER_Y} r={SPHERE_RADIUS} />
                <ellipse cx={CENTER_X} cy={CENTER_Y} rx={SPHERE_RADIUS} ry={SPHERE_RADIUS * 0.32} />
                <ellipse cx={CENTER_X} cy={CENTER_Y} rx={SPHERE_RADIUS * 0.32} ry={SPHERE_RADIUS} />
                <ellipse cx={CENTER_X} cy={CENTER_Y} rx={SPHERE_RADIUS} ry={SPHERE_RADIUS * 0.68} />
              </g>

              <g className="gloss-sphere-edges" aria-hidden="true">
                {visibleEdges.map((edge) => {
                  const source = nodeById.get(edge.source)
                  const target = nodeById.get(edge.target)
                  if (!source || !target) return null

                  const sourceProjection = projectPoint(source.position, rotation)
                  const targetProjection = projectPoint(target.position, rotation)
                  const depthOpacity = 0.14 + ((sourceProjection.opacity + targetProjection.opacity) / 2) * 0.56
                  const activeEdge = Boolean(activeId && (edge.source === activeId || edge.target === activeId))
                  const dimmedEdge = Boolean(activeId && !activeEdge)

                  return (
                    <path
                      key={edge.key}
                      className={`gloss-edge${activeEdge ? ' active' : ''}${dimmedEdge ? ' dimmed' : ''}`}
                      d={buildArcPath(source.position, target.position, rotation)}
                      style={{ opacity: activeEdge ? 0.96 : dimmedEdge ? 0.06 : depthOpacity }}
                    />
                  )
                })}
              </g>

              {projectedNodes.map((node) => {
                const isActive = node.id === activeId
                const isRelated = activeRelatedIds.has(node.id)
                const isMatch = matchedIds.has(node.id)
                const isDimmed = Boolean(activeId && !isActive && !isRelated)
                const stateOpacity = isDimmed ? 0.18 : hasQuery && !isMatch ? 0.48 : 1
                const classes = [
                  'gloss-node',
                  isActive ? 'active' : '',
                  isRelated ? 'related' : '',
                  hasQuery && isMatch ? 'search-match' : '',
                  hasQuery && !isMatch ? 'search-context' : '',
                  node.z < -0.15 ? 'back' : 'front',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <g
                    key={node.id}
                    className={classes}
                    transform={`translate(${node.x} ${node.y}) scale(${node.scale})`}
                    style={{ opacity: node.opacity * stateOpacity }}
                    role="button"
                    tabIndex={0}
                    data-glossary-node-id={node.id}
                    aria-label={node.entry.term[lang]}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        selectNode(node)
                      }
                    }}
                  >
                    <rect
                      className="gloss-node-hit"
                      x={-node.width / 2}
                      y={-node.height / 2}
                      width={node.width}
                      height={node.height}
                      rx={node.height / 2}
                    />
                    <text textAnchor="middle" dominantBaseline="central" style={{ fontSize: node.fontSize }}>
                      {node.entry.term[lang]}
                    </text>
                  </g>
                )
              })}

              {visibleIds.size === 0 && (
                <text className="gloss-cloud-empty" x={CENTER_X} y={CENTER_Y} textAnchor="middle">
                  {t('glossary.none')}
                </text>
              )}
            </svg>
            <div className="gloss-cloud-hint">{lang === 'zh' ? '拖动旋转 · 点击术语' : 'Drag to rotate · click a term'}</div>
          </div>

          <div className="gloss-detail">
            {active ? (
              <>
                <h3>{active.term[lang]}</h3>
                <p>{active.short[lang]}</p>
                {active.long && <p className="gloss-detail-long">{active.long[lang]}</p>}
                {active.sources && active.sources.length > 0 && (
                  <>
                    <span className="info-key">{t('info.sources')}</span>
                    <SourceList sources={active.sources} />
                  </>
                )}
                {activeRelatedIds.size > 0 && (
                  <div className="gloss-related">
                    {[...activeRelatedIds].map((relatedId) => {
                      const related = nodeById.get(relatedId)
                      if (!related) return null
                      return (
                        <button key={relatedId} className="gloss-chip" onClick={() => selectNode(related)}>
                          {related.entry.term[lang]}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="muted">{t('glossary.pickHint')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

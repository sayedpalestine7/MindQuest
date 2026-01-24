import React, { useEffect, useState, useRef } from "react"
import {
  BASE_SHAPE_SIZE,
  DEFAULT_ANIMATION_DURATION,
  getCanvasTransform,
  getCompoundStatesAtTime,
  getObjectStateAtTime,
  normalizeAnimation
} from "../../utils/animationUtils"

export default function AnimationPreview({ demo, animation }) {
  const [animationState, setAnimationState] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [demo])

  // If it's a real animation with objects, render the actual animation
  useEffect(() => {
    if (animation && !animation.isDemo && animation.objects && animation.objects.length > 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const normalized = normalizeAnimation(animation)
      const duration = normalized.effectiveDuration || DEFAULT_ANIMATION_DURATION
      
      const animate = () => {
        setCurrentTime((prev) => {
          const next = (prev + 0.05) % duration
          renderAnimationFrame(ctx, normalized, next, duration)
          return next
        })
      }

      const animationId = setInterval(animate, 50)
      return () => clearInterval(animationId)
    }
  }, [animation])

  // Render animation frame based on object data
  const renderAnimationFrame = (ctx, normalizedAnimation, time, duration) => {
    if (!ctx) return
    
    const canvas = ctx.canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const objects = normalizedAnimation?.objects
    if (!objects || objects.length === 0) return
    
    const { scale, offsetX, offsetY } = getCanvasTransform(normalizedAnimation, canvas)
    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    if (Array.isArray(normalizedAnimation?.connections)) {
      normalizedAnimation.connections.forEach((conn) => {
        const fromObj = objects.find((obj) => obj.id === conn.fromId)
        const toObj = objects.find((obj) => obj.id === conn.toId)
        if (!fromObj || !toObj) return
        const fromState = getObjectStateAtTime(fromObj, time)
        const toState = getObjectStateAtTime(toObj, time)
        if (!fromState || !toState) return

        const drawArrow = (from, to, color = "#facc15", width = 2) => {
          const headLength = 10
          const dx = to.x - from.x
          const dy = to.y - from.y
          const angle = Math.atan2(dy, dx)

          ctx.strokeStyle = color
          ctx.lineWidth = width
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.stroke()

          ctx.fillStyle = color
          ctx.beginPath()
          ctx.moveTo(to.x, to.y)
          ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6))
          ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6))
          ctx.closePath()
          ctx.fill()
        }

        drawArrow(
          { x: fromState.x ?? 0, y: fromState.y ?? 0 },
          { x: toState.x ?? 0, y: toState.y ?? 0 },
          conn.color || "#facc15",
          conn.width || 2
        )
      })
    }

    const drawShape = (shapeType, state) => {
      if (!state || state.opacity <= 0) return
      
      ctx.save()
      
      ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity ?? 1))
      ctx.fillStyle = (state.fillColor ?? state.color) || "#3b82f6"
      ctx.strokeStyle = (state.strokeColor ?? state.color) || "#3b82f6"
      
      const x = state.x ?? 0
      const y = state.y ?? 0
      const scale = state.scale ?? 1
      const size = BASE_SHAPE_SIZE * scale
      
      ctx.translate(x, y)
      if (state.rotation) {
        ctx.rotate((state.rotation * Math.PI) / 180)
      }
      
      switch (shapeType) {
        case "circle":
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") {
            ctx.beginPath()
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
            ctx.fill()
          }
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2
            ctx.beginPath()
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
            ctx.stroke()
          }
          break

        case "square":
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") {
            ctx.fillRect(-size / 2, -size / 2, size, size)
          }
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2
            ctx.strokeRect(-size / 2, -size / 2, size, size)
          }
          break

        case "triangle":
          ctx.beginPath()
          ctx.moveTo(0, -size / 2)
          ctx.lineTo(size / 2, size / 2)
          ctx.lineTo(-size / 2, size / 2)
          ctx.closePath()
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") {
            ctx.fill()
          }
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2
            ctx.stroke()
          }
          break

        case "rectangle": {
          const w = (state.width ?? 100) * scale
          const h = (state.height ?? 60) * scale
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") {
            ctx.fillRect(-w / 2, -h / 2, w, h)
          }
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2
            ctx.beginPath()
            ctx.rect(-w / 2, -h / 2, w, h)
            ctx.stroke()
            if (state.openTop) {
              ctx.clearRect(-w / 2 - 1, -h / 2 - 1, w + 2, (state.borderWidth ?? 2) + 2)
            }
          }
          break
        }

        case "text":
          ctx.fillStyle = state.color || "#000000"
          ctx.font = "16px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(state.text || "", 0, 0)
          break

        default:
          break
      }
      
      ctx.restore()
    }

    objects.forEach(obj => {
      if (obj.children?.length) {
        const compound = getCompoundStatesAtTime(obj, time)
        if (!compound) return
        obj.children.forEach((child, index) => {
          drawShape(child.type, compound.children[index])
        })
        return
      }

      const state = getObjectStateAtTime(obj, time)
      drawShape(obj.type, state)
    })

    ctx.restore()
  }

  const renderSortingDemo = () => {
    const bars = [65, 45, 80, 30, 95, 50, 70, 40]
    const sortedIndices = Math.floor((animationState / 100) * bars.length)
    
    return (
      <div className="flex items-end justify-center gap-2 h-48 w-full px-8">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className={`flex-1 rounded-t-lg transition-all duration-300 ${
              idx < sortedIndices
                ? "bg-gradient-to-t from-green-500 to-green-400"
                : "bg-gradient-to-t from-blue-500 to-blue-400"
            }`}
            style={{
              height: `${height}%`,
              transform: idx === sortedIndices ? "scale(1.1)" : "scale(1)"
            }}
          >
            <div className="text-white text-xs text-center mt-2 font-bold">
              {idx < sortedIndices ? "✓" : ""}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderDataStructuresDemo = () => {
    const nodes = 5
    const activeNode = Math.floor((animationState / 100) * nodes)
    
    return (
      <div className="flex items-center justify-center h-48 w-full">
        <div className="flex items-center gap-4">
          {[...Array(nodes)].map((_, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all duration-300 ${
                  idx <= activeNode
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-lg"
                    : "bg-gray-300"
                }`}
              >
                {idx + 1}
              </div>
              {idx < nodes - 1 && (
                <div
                  className={`w-8 h-1 transition-all duration-300 ${
                    idx < activeNode ? "bg-purple-500" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const renderPathfindingDemo = () => {
    const gridSize = 6
    const progress = animationState / 100
    const pathLength = Math.floor(progress * gridSize * 2)
    
    return (
      <div className="flex items-center justify-center h-48 w-full">
        <div className="grid grid-cols-6 gap-2">
          {[...Array(gridSize * gridSize)].map((_, idx) => {
            const row = Math.floor(idx / gridSize)
            const col = idx % gridSize
            const isPath = row + col <= pathLength && row + col >= pathLength - 2
            const isStart = idx === 0
            const isEnd = idx === gridSize * gridSize - 1
            
            return (
              <div
                key={idx}
                className={`w-10 h-10 rounded-lg transition-all duration-300 ${
                  isStart
                    ? "bg-green-500 shadow-lg"
                    : isEnd
                    ? "bg-red-500 shadow-lg"
                    : isPath
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse"
                    : "bg-gray-200"
                }`}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      {/* If it's a real animation from database, render canvas */}
      {animation && !animation.isDemo && animation.objects && animation.objects.length > 0 ? (
        <canvas
          ref={canvasRef}
          width={1400}
          height={600}
          className="w-full h-auto"
        />
      ) : (
        /* Otherwise render demo animations */
        <>
          {demo === "sorting" && renderSortingDemo()}
          {demo === "dataStructures" && renderDataStructuresDemo()}
          {demo === "pathfinding" && renderPathfindingDemo()}
        </>
      )}
    </div>
  )
}

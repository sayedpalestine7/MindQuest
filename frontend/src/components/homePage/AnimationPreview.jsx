import React, { useEffect, useState, useRef } from "react"

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
      const duration = animation.duration || 10
      
      const animate = () => {
        setCurrentTime((prev) => {
          const next = (prev + 0.05) % duration
          renderAnimationFrame(ctx, animation.objects, next, duration)
          return next
        })
      }

      const animationId = setInterval(animate, 50)
      return () => clearInterval(animationId)
    }
  }, [animation])

  // Render animation frame based on object data
  const renderAnimationFrame = (ctx, objects, time, duration) => {
    if (!ctx) return
    
    const canvas = ctx.canvas
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (!objects || objects.length === 0) return
    
    objects.forEach(obj => {
      const state = getObjectStateAtTime(obj, time)
      if (!state) return
      
      // Skip if opacity is 0 (invisible)
      if (state.opacity <= 0) return
      
      ctx.save()
      
      ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity ?? 1))
      ctx.fillStyle = state.color || "#3b82f6"
      ctx.strokeStyle = state.color || "#3b82f6"
      
      const x = state.x ?? 0
      const y = state.y ?? 0
      const scale = state.scale ?? 1
      
      ctx.translate(x, y)
      if (state.rotation) {
        ctx.rotate((state.rotation * Math.PI) / 180)
      }
      
      switch (obj.type) {
        case "circle":
          ctx.beginPath()
          ctx.arc(0, 0, (50 * scale) / 2, 0, Math.PI * 2)
          ctx.fill()
          break

        case "square":
          ctx.fillRect(-30 * scale, -30 * scale, 60 * scale, 60 * scale)
          break

        case "triangle":
          ctx.beginPath()
          ctx.moveTo(0, -30 * scale)
          ctx.lineTo(30 * scale, 30 * scale)
          ctx.lineTo(-30 * scale, 30 * scale)
          ctx.closePath()
          ctx.fill()
          break

        case "rectangle":
          const w = (state.width ?? 100) * scale
          const h = (state.height ?? 60) * scale
          ctx.fillRect(-w / 2, -h / 2, w, h)
          break

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
    })
  }

  const getObjectStateAtTime = (obj, time) => {
    const transitions = obj.transitions
    if (!transitions || transitions.length === 0) return null

    for (let i = 0; i < transitions.length; i++) {
      const trans = transitions[i]
      const startTime = trans.startTime
      const duration = trans.duration || 0
      const endTime = startTime + duration

      // Check if current time is in range for this transition
      if (time >= startTime && time <= endTime) {
        // If duration is 0, this is an instant state
        if (duration === 0) {
          return {
            x: trans.x ?? 0,
            y: trans.y ?? 0,
            width: trans.width,
            height: trans.height,
            scale: trans.scale ?? 1,
            rotation: trans.rotation ?? 0,
            opacity: trans.opacity ?? 1,
            color: trans.color,
            text: trans.text || "",
          }
        }

        // For non-zero duration, interpolate between this and next transition
        const nextTrans = transitions[i + 1]
        const progress = (time - startTime) / duration
        const t = applyEasing(progress, trans.easing || 'linear')

        if (nextTrans) {
          return {
            x: lerp(trans.x, nextTrans.x, t),
            y: lerp(trans.y, nextTrans.y, t),
            width: trans.width,
            height: trans.height,
            scale: lerp(trans.scale ?? 1, nextTrans.scale ?? 1, t),
            rotation: lerp(trans.rotation ?? 0, nextTrans.rotation ?? 0, t),
            opacity: lerp(trans.opacity ?? 1, nextTrans.opacity ?? 1, t),
            color: trans.color || nextTrans.color,
            text: trans.text || "",
          }
        } else {
          return {
            x: trans.x ?? 0,
            y: trans.y ?? 0,
            width: trans.width,
            height: trans.height,
            scale: trans.scale ?? 1,
            rotation: trans.rotation ?? 0,
            opacity: trans.opacity ?? 1,
            color: trans.color,
            text: trans.text || "",
          }
        }
      }
    }

    // Return last state if time is beyond all transitions
    const lastTrans = transitions[transitions.length - 1]
    return {
      x: lastTrans.x ?? 0,
      y: lastTrans.y ?? 0,
      width: lastTrans.width,
      height: lastTrans.height,
      scale: lastTrans.scale ?? 1,
      rotation: lastTrans.rotation ?? 0,
      opacity: lastTrans.opacity ?? 1,
      color: lastTrans.color,
      text: lastTrans.text || "",
    }
  }

  const lerp = (a, b, t) => a + (b - a) * t
  
  const applyEasing = (t, easing) => {
    switch (easing) {
      case 'ease-in': return t * t
      case 'ease-out': return t * (2 - t)
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      default: return t
    }
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

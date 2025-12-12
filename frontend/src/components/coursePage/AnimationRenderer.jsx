import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Play, Pause } from "lucide-react"

export default function AnimationRenderer({ animationId }) {
  const [animation, setAnimation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!animationId) {
      setError("No animation selected")
      setIsLoading(false)
      return
    }

    loadAnimation()
  }, [animationId])

  const loadAnimation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(
        `http://localhost:5000/api/animations/${animationId}`
      )
      console.log('Loaded animation:', response.data)
      setAnimation(response.data)
      setCurrentTime(0)
    } catch (err) {
      console.error("Error loading animation:", err)
      setError("Failed to load animation: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const animate = () => {
      setCurrentTime((prev) => {
        const next = prev + 0.016 // ~60fps
        const duration = animation?.duration || 15
        if (next >= duration) {
          setIsPlaying(false)
          return duration
        }
        return next
      })
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, animation?.duration])

  useEffect(() => {
    if (!canvasRef.current || !animation) {
      console.log('Canvas or animation not ready:', { canvas: !!canvasRef.current, animation: !!animation })
      return
    }
    console.log('Rendering frame at time:', currentTime, 'Animation objects:', animation.objects?.length)
    renderFrame()
  }, [currentTime, animation])

  const interpolate = (from, to, t) => {
    if (from === undefined || from === null) return to
    if (to === undefined || to === null) return from
    return from + (to - from) * t
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

        if (nextTrans) {
          return {
            x: interpolate(trans.x, nextTrans.x, progress),
            y: interpolate(trans.y, nextTrans.y, progress),
            width: trans.width,
            height: trans.height,
            scale: interpolate(trans.scale ?? 1, nextTrans.scale ?? 1, progress),
            rotation: interpolate(trans.rotation ?? 0, nextTrans.rotation ?? 0, progress),
            opacity: interpolate(trans.opacity ?? 1, nextTrans.opacity ?? 1, progress),
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

  const renderFrame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!animation?.objects || animation.objects.length === 0) {
      console.log('No objects in animation')
      return
    }

    animation.objects.forEach((obj) => {
      const state = getObjectStateAtTime(obj, currentTime)
      if (!state) {
        console.log('No state for object:', obj.id, 'at time:', currentTime)
        return
      }

      // Skip if opacity is 0 (invisible)
      if (state.opacity <= 0) {
        return
      }

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

  if (isLoading) {
    return (
      <div className="rounded-lg border-2 border-gray-300 p-8 bg-gray-50 text-center">
        <p className="text-gray-600">Loading animation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-red-300 p-8 bg-red-50">
        <p className="text-red-700 font-semibold">{error}</p>
        <p className="text-red-600 text-sm mt-2">Check browser console for more details</p>
      </div>
    )
  }

  if (!animation) {
    return (
      <div className="rounded-lg border-2 border-yellow-300 p-8 bg-yellow-50">
        <p className="text-yellow-700">No animation data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          width={1400}
          height={600}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-4 px-4 py-3 bg-gray-100 rounded-lg">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={animation?.duration || 15}
            step="0.016"
            value={currentTime}
            onChange={(e) => {
              setCurrentTime(parseFloat(e.target.value))
              setIsPlaying(false)
            }}
            className="w-full cursor-pointer"
          />
        </div>

        <span className="text-sm font-semibold whitespace-nowrap text-gray-700">
          {currentTime.toFixed(2)}s / {animation?.duration || 15}s
        </span>
      </div>
    </div>
  )
}

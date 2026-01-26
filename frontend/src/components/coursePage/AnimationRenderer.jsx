import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Play, Pause } from "lucide-react"
import {
  BASE_SHAPE_SIZE,
  DEFAULT_ANIMATION_DURATION,
  getCanvasTransform,
  getCompoundStatesAtTime,
  getObjectStateAtTime,
  normalizeAnimation
} from "../../utils/animationUtils"

export default function AnimationRenderer({ animationId, playbackMode = "start-stop" }) {
  useEffect(() => {
    console.log('AnimationRenderer mounted; animationId=', animationId)
  }, [animationId])
  const [animation, setAnimation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)

  const isLoopMode = playbackMode === "loop"
  const isSlideMode = animation?.mode === 'slides'

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
      
      const data = response.data || {}
      
      if (data.mode === 'slides') {
        // Slide mode - set data directly without normalization
        setAnimation(data)
      } else {
        // Timeline mode - normalize as before
        const normalized = normalizeAnimation(data)
        setAnimation(normalized)
      }
      
      setCurrentTime(0)
      setCurrentSlideIndex(0)
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

    if (isSlideMode) {
      // Slide mode playback with auto-advance - optimized with direct rendering
      const slides = animation?.slideData?.slides || []
      if (slides.length === 0) return
      
      let lastTimestamp = null
      let localTime = currentTime
      let localSlideIndex = currentSlideIndex
      let frameCount = 0
      
      const animate = (timestamp) => {
        if (lastTimestamp === null) lastTimestamp = timestamp
        const deltaSec = (timestamp - lastTimestamp) / 1000
        lastTimestamp = timestamp

        localTime += deltaSec
        
        // Find current slide
        let accumulatedTime = 0
        let foundSlide = false
        
        for (let i = 0; i < slides.length; i++) {
          if (localTime >= accumulatedTime && localTime < accumulatedTime + slides[i].duration) {
            localSlideIndex = i
            foundSlide = true
            break
          }
          accumulatedTime += slides[i].duration
        }
        
        // End of animation
        if (!foundSlide) {
          if (isLoopMode) {
            localTime = 0
            localSlideIndex = 0
          } else {
            setIsPlaying(false)
            setCurrentTime(accumulatedTime)
            setCurrentSlideIndex(localSlideIndex)
            return
          }
        }
        
        // Render frame directly to avoid state update re-renders
        renderSlideFrame(slides, localSlideIndex, localTime)
        
        // Update state less frequently (every 10 frames ~160ms) to avoid lag
        frameCount++
        if (frameCount % 10 === 0) {
          setCurrentTime(localTime)
          setCurrentSlideIndex(localSlideIndex)
        }
        
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      // Timeline mode playback (existing logic)
      let lastTimestamp = null
      const duration = animation?.effectiveDuration || animation?.duration || DEFAULT_ANIMATION_DURATION

      const animate = (timestamp) => {
        if (lastTimestamp === null) lastTimestamp = timestamp
        const deltaSec = (timestamp - lastTimestamp) / 1000
        lastTimestamp = timestamp

        setCurrentTime((prev) => {
          const next = prev + deltaSec
          if (next >= duration) {
            if (isLoopMode && duration > 0) {
              return next % duration
            }
            // stop playback at exact duration
            setIsPlaying(false)
            return duration
          }
          return next
        })

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, isLoopMode, isSlideMode, animation?.effectiveDuration, animation?.duration, animation?.slideData])

  useEffect(() => {
    if (isLoopMode) {
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
    setCurrentTime(0)
  }, [isLoopMode, animationId])

  useEffect(() => {
    if (!canvasRef.current || !animation) {
      console.log('Canvas or animation not ready:', { canvas: !!canvasRef.current, animation: !!animation })
      return
    }
    // Only render timeline mode here - slide mode renders directly in animation loop
    if (!isSlideMode) {
      console.log('Rendering frame:', `time ${currentTime}`)
      renderFrame()
    }
  }, [currentTime, animation, isSlideMode])

  const drawArrow = (ctx, from, to, color = "#facc15", width = 2) => {
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

  // Optimized slide mode rendering - called directly from animation loop
  const renderSlideFrame = (slides, slideIndex, time) => {
    const canvas = canvasRef.current
    if (!canvas || slides.length === 0) return

    const ctx = canvas.getContext("2d")
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = isLoopMode ? "#ffffff" : "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const currentSlide = slides[slideIndex]
    const nextSlide = slides[slideIndex + 1]
    if (!currentSlide) return

    // Calculate progress within current slide
    let accumulatedTime = 0
    for (let i = 0; i < slideIndex; i++) {
      accumulatedTime += slides[i].duration
    }
    const progress = Math.min(1, Math.max(0, (time - accumulatedTime) / currentSlide.duration))

    // Helper functions for interpolation
    const lerp = (start, end, t) => start + (end - start) * t
    const easingFunctions = {
      linear: (t) => t,
      'ease-in': (t) => t * t,
      'ease-out': (t) => t * (2 - t),
      'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      bounce: (t) => {
        if (t < 1 / 2.75) return 7.5625 * t * t
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
      }
    }

    const getSlideObjectState = (objectId) => {
      const currentObj = currentSlide.objects.find(o => o.id === objectId)
      const nextObj = nextSlide?.objects.find(o => o.id === objectId)
      
      if (!currentObj || !currentObj.visible) return null
      if (!nextSlide || !nextObj || !nextObj.visible) return currentObj
      
      const easingFunc = easingFunctions[currentSlide.easing] || easingFunctions.linear
      const t = easingFunc(progress)
      
      return {
        ...currentObj,
        x: lerp(currentObj.x, nextObj.x, t),
        y: lerp(currentObj.y, nextObj.y, t),
        scale: lerp(currentObj.scale ?? 1, nextObj.scale ?? 1, t),
        rotation: lerp(currentObj.rotation ?? 0, nextObj.rotation ?? 0, t),
        opacity: lerp(currentObj.opacity ?? 1, nextObj.opacity ?? 1, t),
        width: lerp(currentObj.width ?? BASE_SHAPE_SIZE, nextObj.width ?? BASE_SHAPE_SIZE, t),
        height: lerp(currentObj.height ?? BASE_SHAPE_SIZE, nextObj.height ?? BASE_SHAPE_SIZE, t)
      }
    }

    // Get all unique object IDs
    const allObjIds = new Set()
    slides.forEach(slide => slide.objects.forEach(obj => allObjIds.add(obj.id)))
    
    const objectsToRender = Array.from(allObjIds)
      .map(id => getSlideObjectState(id))
      .filter(Boolean)

    ctx.save()

    // Draw connections — prefer slide-level connections, fallback to animation-level
    const slideConnections = Array.isArray(currentSlide?.connections) ? currentSlide.connections : (Array.isArray(animation?.connections) ? animation.connections : [])

    if (Array.isArray(slideConnections)) {
      slideConnections.forEach((conn) => {
        const fromObj = objectsToRender.find(o => o.id === conn.fromId)
        const toObj = objectsToRender.find(o => o.id === conn.toId)
        if (!fromObj || !toObj) return
        drawArrow(
          ctx,
          { x: fromObj.x ?? 0, y: fromObj.y ?? 0 },
          { x: toObj.x ?? 0, y: toObj.y ?? 0 },
          conn.color || "#facc15",
          conn.width || 2
        )
      })
    }

    // Draw shapes
    const drawShapeSlide = (state) => {
      if (!state || (state.opacity ?? 1) <= 0) return

      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity ?? 1))
      ctx.fillStyle = state.color || "#3b82f6"

      const x = state.x ?? 0
      const y = state.y ?? 0
      const scale = state.scale ?? 1
      const size = (state.width ?? BASE_SHAPE_SIZE) * scale

      ctx.translate(x, y)
      if (state.rotation) {
        ctx.rotate((state.rotation * Math.PI) / 180)
      }

      switch (state.type) {
        case "circle":
          ctx.beginPath()
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
          ctx.fill()
          break

        case "square":
          ctx.fillRect(-size / 2, -size / 2, size, size)
          break

        case "triangle":
          ctx.beginPath()
          ctx.moveTo(0, -size / 2)
          ctx.lineTo(size / 2, size / 2)
          ctx.lineTo(-size / 2, size / 2)
          ctx.closePath()
          ctx.fill()
          break

        case "rectangle": {
          const w = (state.width ?? 100) * scale
          const h = (state.height ?? 60) * scale
          ctx.fillRect(-w / 2, -h / 2, w, h)
          break
        }

        case "text":
          ctx.fillStyle = state.color || "#000000"
          ctx.font = `${16 * scale}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(state.text || "", 0, 0)
          break
      }

      // Draw text content for all object types (not just 'text' type)
      if (state.text && state.type !== 'text') {
        ctx.fillStyle = '#ffffff'
        ctx.font = `${12 * scale}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(state.text, 0, 0)
      }

      ctx.restore()
    }

    objectsToRender.forEach(state => drawShapeSlide(state))
    ctx.restore()
  }

  const renderFrame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = isLoopMode ? "#ffffff" : "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (isSlideMode) {
      // Slide mode rendering is now handled in renderSlideFrame called from animation loop
      // Only render here when paused (not playing) for scrubbing
      if (!isPlaying) {
        const slides = animation?.slideData?.slides || []
        if (slides.length > 0) {
          renderSlideFrame(slides, currentSlideIndex, currentTime)
        }
      }
      return
    }

    // Timeline mode rendering (existing logic)
    if (!animation?.objects || animation.objects.length === 0) {
      console.log('No objects in animation')
      return
    }

    const { scale, offsetX, offsetY } = getCanvasTransform(animation, canvas)
    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    if (Array.isArray(animation.connections)) {
      animation.connections.forEach((conn) => {
        const fromObj = animation.objects.find((obj) => obj.id === conn.fromId)
        const toObj = animation.objects.find((obj) => obj.id === conn.toId)
        if (!fromObj || !toObj) return
        const fromState = getObjectStateAtTime(fromObj, currentTime)
        const toState = getObjectStateAtTime(toObj, currentTime)
        if (!fromState || !toState) return
        drawArrow(
          ctx,
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

    animation.objects.forEach((obj) => {
      if (obj.children?.length) {
        const compound = getCompoundStatesAtTime(obj, currentTime)
        if (!compound) return
        obj.children.forEach((child, index) => {
          drawShape(child.type, compound.children[index])
        })
        return
      }

      const state = getObjectStateAtTime(obj, currentTime)
      if (!state) {
        console.log('No state for object:', obj.id, 'at time:', currentTime)
        return
      }
      drawShape(obj.type, state)
    })

    ctx.restore()
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
      <div className={isLoopMode ? "overflow-hidden bg-white" : "rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50"}>
        <canvas
          ref={canvasRef}
          width={1400}
          height={600}
          className="w-full"
        />
      </div>

      {!isLoopMode && (
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
      )}
    </div>
  )
}

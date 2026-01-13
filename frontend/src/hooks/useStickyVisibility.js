// /src/hooks/useStickyVisibility.js
import { useState, useEffect, useRef, useCallback } from "react"

/**
 * Custom hook to manage sticky element visibility
 * Automatically hides sticky elements when scrolled past their content
 */
export const useStickyVisibility = () => {
  const [isVisible, setIsVisible] = useState(true)
  const stickyRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const sticky = stickyRef.current
    if (!sticky) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when its content is visible
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(sticky)

    return () => {
      observer.disconnect()
    }
  }, [])

  return {
    stickyRef,
    contentRef,
    isVisible,
    stickyClassName: `transition-all duration-200 ${
      isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`,
  }
}

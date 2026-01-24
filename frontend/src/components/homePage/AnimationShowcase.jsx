import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Sparkles, Code, Play, TrendingUp, Zap } from "lucide-react"
import axios from "axios"
import AnimationRenderer from "../coursePage/AnimationRenderer"

export default function AnimationShowcase() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState(null)
  const [animations, setAnimations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)

  // ========== CONFIGURATION: Select animations to showcase ==========
  // Add your animation IDs here to display them on the homepage
  const FEATURED_ANIMATION_IDS = [
    "69750d58d5ff4535efb7e055",  // Example: Sorting Algorithm Animation
    "693824017097b18472cbfd9a",  // Example: Binary Tree Traversal
    "693823717097b18472cbfd98",  // Example: Graph BFS/DFS
  ]
  // ================================================================

  // Fetch animations from database
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/animations")
        const allAnimations = response.data || []
        
        // Filter to only show featured animations if IDs are specified
        const featured = FEATURED_ANIMATION_IDS.length > 0
          ? allAnimations.filter(anim => FEATURED_ANIMATION_IDS.includes(anim._id))
          : allAnimations.filter(anim => anim.isPublished).slice(0, 3) // Default: show first 3 published
        
        setAnimations(featured)
        if (featured.length > 0) {
          setSelectedDemo(featured[0]._id)
        }
      } catch (err) {
        console.error("Error fetching animations:", err)
        // Fallback to demo animations if API fails
        setAnimations(demoAnimations)
        setSelectedDemo("sorting")
      } finally {
        setLoading(false)
      }
    }
    fetchAnimations()
  }, [])

  // Fallback demo animations (used if no animations in database)
  const demoAnimations = [
    {
      _id: "sorting",
      title: "Sorting Algorithms",
      description: "Watch bubble sort, quick sort, and merge sort in action",
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: "from-blue-500 to-purple-500",
      isDemo: true
    },
    {
      _id: "dataStructures",
      title: "Data Structures",
      description: "Visualize stacks, queues, trees, and graphs dynamically",
      icon: <Code className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-500",
      isDemo: true
    },
    {
      _id: "pathfinding",
      title: "Pathfinding",
      description: "See A*, Dijkstra, and BFS algorithms find optimal paths",
      icon: <Zap className="w-5 h-5" />,
      gradient: "from-pink-500 to-orange-500",
      isDemo: true
    }
  ]

  // Use demo animations if no real animations loaded
  const displayAnimations = animations.length > 0 ? animations : demoAnimations

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById("animation-showcase")
    if (element) observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  // Auto-carousel functionality
  useEffect(() => {
    if (!isVisible || !autoPlayEnabled || isPaused || loading || displayAnimations.length <= 1) return

    const interval = setInterval(() => {
      setSelectedDemo(current => {
        const currentIndex = displayAnimations.findIndex(a => a._id === current)
        const nextIndex = (currentIndex + 1) % displayAnimations.length
        return displayAnimations[nextIndex]._id
      })
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [isVisible, autoPlayEnabled, isPaused, loading, displayAnimations])

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const currentIndex = displayAnimations.findIndex(a => a._id === selectedDemo)
        let nextIndex
        
        if (e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : displayAnimations.length - 1
        } else {
          nextIndex = (currentIndex + 1) % displayAnimations.length
        }
        
        handleAnimationChange(displayAnimations[nextIndex]._id)
      } else if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        setIsPaused(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isVisible, selectedDemo, displayAnimations])

  // Helper function to get animation icon
  const getAnimationIcon = (animation) => {
    if (animation.isDemo) return animation.icon
    // You can customize icons based on animation tags or title
    const title = animation.title?.toLowerCase() || ""
    if (title.includes("sort")) return <TrendingUp className="w-5 h-5" />
    if (title.includes("tree") || title.includes("graph")) return <Code className="w-5 h-5" />
    return <Zap className="w-5 h-5" />
  }

  // Helper function to get gradient colors
  const getGradient = (animation, index) => {
    if (animation.gradient) return animation.gradient
    const gradients = [
      "from-blue-500 to-purple-500",
      "from-purple-500 to-pink-500",
      "from-pink-500 to-orange-500",
      "from-green-500 to-teal-500",
      "from-indigo-500 to-blue-500"
    ]
    return gradients[index % gradients.length]
  }

  const handleAnimationChange = (animationId) => {
    if (animationId === selectedDemo) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedDemo(animationId)
      setIsTransitioning(false)
    }, 150)
  }

  const handleTryStudio = () => {
    // Track analytics
    if (window.gtag) {
      window.gtag('event', 'try_animation_studio', {
        source: 'homepage_showcase'
      })
    }
    
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    
    if (token && user.role === "teacher") {
      navigate("/studio/animation")
    } else {
      // Redirect to sign up as teacher
      navigate("/teacher/signup")
    }
  }

  const getCurrentAnimationIndex = () => {
    return displayAnimations.findIndex(a => a._id === selectedDemo) + 1
  }

  return (
    <section id="animation-showcase" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Our Unique Feature</span>
          </div> */}
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Built-in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Animation Studio</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Create professional algorithm visualizations without external tools. 
            Our timeline-based editor lets you build step-by-step animations that make complex concepts simple.
          </p>
        </div>

        {/* Full-width Animation Preview */}
        <div 
          className="max-w-7xl mx-auto mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Browser-style header */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center px-6 gap-3 z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition cursor-pointer"></div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-700/50 rounded-lg">
                  {/* <Sparkles className="w-3.5 h-3.5 text-blue-400" /> */}
                  <span className="text-xs text-gray-300 font-medium">Animation Studio Preview</span>
                </div>
              </div>
              {!loading && displayAnimations.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{getCurrentAnimationIndex()} / {displayAnimations.length}</span>
                </div>
              )}
            </div>
            
            {/* Animation display area */}
            <div className="pt-14 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-[400px] md:min-h-[500px] lg:min-h-[600px] transition-opacity duration-150" style={{ opacity: isTransitioning ? 0.3 : 1 }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[600px] gap-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-500 text-sm">Loading animations...</p>
                </div>
              ) : isVisible && selectedDemo && !displayAnimations.find(a => a._id === selectedDemo)?.isDemo ? (
                <div className="w-full h-full min-h-[600px]">
                  <AnimationRenderer animationId={selectedDemo} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 min-h-[600px] text-gray-400">
                  <div className="p-6 rounded-full bg-white/50 shadow-lg">
                    <Play className="w-16 h-16 text-blue-500" />
                  </div>
                  <p className="text-lg font-medium">{isVisible ? "Select an animation to preview" : "Scroll to load preview"}</p>
                </div>
              )}
            </div>

            {/* Navigation arrows */}
            {!loading && displayAnimations.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const currentIndex = displayAnimations.findIndex(a => a._id === selectedDemo)
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : displayAnimations.length - 1
                    handleAnimationChange(displayAnimations[prevIndex]._id)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  aria-label="Previous animation"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const currentIndex = displayAnimations.findIndex(a => a._id === selectedDemo)
                    const nextIndex = (currentIndex + 1) % displayAnimations.length
                    handleAnimationChange(displayAnimations[nextIndex]._id)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  aria-label="Next animation"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Animation selector buttons - Below preview */}
          {/* <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Choose Animation:</h3>
              <p className="text-xs text-gray-500 hidden md:block">Use ← → arrow keys to navigate • Space to pause</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 rounded-xl border-2 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {displayAnimations.map((animation, idx) => (
                    <button
                      key={animation._id}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
                        selectedDemo === animation._id
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-blue-400 hover:shadow-md hover:scale-102 bg-white"
                      }`}
                      onClick={() => handleAnimationChange(animation._id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradient(animation, idx)} text-white flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                          {getAnimationIcon(animation)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1 text-gray-900 truncate">{animation.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {animation.description || "Interactive animation demonstration"}
                          </p>
                          {!animation.isDemo && animation.tags && animation.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {animation.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedDemo === animation._id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div> */}
        </div>

        {/* Features & CTA Section */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 lg:p-12 shadow-lg">
            <div className="grid lg:grid-cols-2 gap-8 items-center">

              <div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900">Why Our Animation Studio?</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    </div>
                    <span className="text-base">Timeline-based editor with keyframe animations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    </div>
                    <span className="text-base">Embed animations directly into your lessons</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-pink-100">
                      <Sparkles className="w-5 h-5 text-pink-600 flex-shrink-0" />
                    </div>
                    <span className="text-base">No external tools needed - everything integrated</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-start">
                <button 
                  onClick={handleTryStudio}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
                >
                  Try Animation Studio →
                </button>
                <p className="text-sm text-gray-600 mt-3">
                  Available for teachers • Sign up to get started
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}





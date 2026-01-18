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

  // ========== CONFIGURATION: Select animations to showcase ==========
  // Add your animation IDs here to display them on the homepage
  const FEATURED_ANIMATION_IDS = [
    "69641d7e6bed96066c5e9ce1",  // Example: Sorting Algorithm Animation
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

  return (
    <section id="animation-showcase" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Our Unique Feature</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Built-in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Animation Studio</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Create professional algorithm visualizations without external tools. 
            Our timeline-based editor lets you build step-by-step animations that make complex concepts simple.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Animation Preview */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gray-900 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-xs text-gray-400 font-mono">Animation Studio</span>
              </div>
              
              <div className="pt-12 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" style={{ aspectRatio: '1400 / 600' }}>
                {loading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : isVisible && selectedDemo && !displayAnimations.find(a => a._id === selectedDemo)?.isDemo ? (
                  <div className="w-full h-full">
                    <AnimationRenderer animationId={selectedDemo} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Play className="w-8 h-8" />
                    <span>{isVisible ? "Demo animation preview" : "Scroll to load preview"}</span>
                  </div>
                )}
              </div>

              {/* Demo selector */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                {displayAnimations.map((animation) => (
                  <button
                    key={animation._id}
                    onClick={() => setSelectedDemo(animation._id)}
                    className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs font-medium transition ${
                      selectedDemo === animation._id
                        ? "bg-white text-gray-900 shadow-lg"
                        : "bg-gray-800/50 text-white hover:bg-gray-800/70"
                    }`}
                  >
                    {animation.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Features & CTA */}
          <div className="order-1 lg:order-2 space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border-2 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {displayAnimations.map((animation, idx) => (
                  <div 
                    key={animation._id}
                    className="p-4 rounded-xl border-2 hover:border-blue-400 transition cursor-pointer"
                    onClick={() => setSelectedDemo(animation._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getGradient(animation, idx)} text-white`}>
                        {getAnimationIcon(animation)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{animation.title}</h3>
                        <p className="text-sm text-gray-600">
                          {animation.description || "Interactive animation demonstration"}
                        </p>
                        {!animation.isDemo && animation.tags && animation.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {animation.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6">
              <h3 className="text-xl font-bold mb-3">Why Our Animation Studio?</h3>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Timeline-based editor with keyframe animations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Embed animations directly into your lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span>No external tools needed - everything integrated</span>
                </li>
              </ul>

              <button 
                onClick={handleTryStudio}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
              >
                Try Animation Studio
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Available for teachers • Sign up to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
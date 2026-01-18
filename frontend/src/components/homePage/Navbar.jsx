import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { Brain, Menu, X, User } from "lucide-react"

export default function Navbar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  // Check if user is signed in
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (err) {
        console.error("Error parsing user data:", err)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      
      // Update active section based on scroll position
      const sections = ['features', 'animation-showcase', 'courses', 'how-it-works']
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsOpen(false)
      
      if (window.gtag) {
        window.gtag('event', 'nav_click', {
          section: sectionId
        })
      }
    }
  }

  const handleSignIn = () => {
    if (window.gtag) {
      window.gtag('event', 'sign_in_click', {
        source: 'navbar'
      })
    }
    navigate("/login")
  }

  const handleGetStarted = () => {
    if (window.gtag) {
      window.gtag('event', 'get_started_click', {
        source: 'navbar'
      })
    }
    navigate("/navigates")
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
    } border-b border-gray-200`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">MindQuest</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 'features', label: 'Features' },
              { id: 'animation-showcase', label: 'Animation Studio' },
              { id: 'courses', label: 'Courses' },
              { id: 'how-it-works', label: 'How It Works' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => {
                  // Navigate to user's profile based on role
                  const userId = user._id || user.id
                  if (user.role === "teacher") {
                    navigate(`/teacher/${userId}`)
                  } else if (user.role === "student") {
                    navigate(`/student/${userId}`)
                  } else if (user.role === "admin") {
                    navigate(`/admin`)
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                title="Go to profile"
              >
                {user.profileImage ? (
                  <img 
                    src={`http://localhost:5000${user.profileImage}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {(user.name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSignIn}
                  className="text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleGetStarted}
                  className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
            <div className="flex flex-col gap-4">
              {[
                { id: 'features', label: 'Features' },
                { id: 'animation-showcase', label: 'Animation Studio' },
                { id: 'courses', label: 'Courses' },
                { id: 'how-it-works', label: 'How It Works' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`text-left px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">
                {user ? (
                  <button
                    onClick={() => {
                      const userId = user._id || user.id
                      if (user.role === "teacher") {
                        navigate(`/teacher/${userId}`)
                      } else if (user.role === "student") {
                        navigate(`/student/${userId}`)
                      } else if (user.role === "admin") {
                        navigate(`/admin`)
                      }
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition"
                  >
                    {user.profileImage ? (
                      <img 
                        src={`http://localhost:5000${user.profileImage}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-600"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleSignIn}
                      className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={handleGetStarted}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

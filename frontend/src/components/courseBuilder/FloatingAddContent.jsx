import React, { useEffect, useState } from "react"
import {
  FileText,
  ImageIcon,
  Youtube,
  Code2,
  HelpCircle,
  Gamepad2,
  Sparkles,
  ChevronLeft,
  Plus
} from "lucide-react"
import { Button } from "./UI"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Floating Add Content Block that appears from the right side when scrolling
 * Shows all available content block types with smooth animations
 */
export default function FloatingAddContent({ addField, selectedLesson }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const contentBlocks = [
    { id: "paragraph", icon: FileText, label: "Paragraph", color: "from-blue-600 to-blue-400" },
    { id: "image", icon: ImageIcon, label: "Image", color: "from-purple-600 to-purple-400" },
    { id: "youtube", icon: Youtube, label: "YouTube", color: "from-pink-600 to-pink-400" },
    { id: "code", icon: Code2, label: "Code", color: "from-green-600 to-green-400" },
    { id: "question", icon: HelpCircle, label: "Question", color: "from-orange-600 to-orange-400" },
    { id: "minigame", icon: Gamepad2, label: "Mini-game", color: "from-indigo-600 to-indigo-400" },
    { id: "animation", icon: Sparkles, label: "Animation", color: "from-cyan-600 to-cyan-400" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      // Show the floating button when user scrolls down
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!selectedLesson) return null

  const handleAddField = (blockId) => {
    addField(blockId)
    setIsExpanded(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-20 right-8 z-50"
        >
          {/* Expanded Menu */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-3 w-72"
              >
                {/* Title */}
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-sm font-bold text-gray-900">Add Content Block</h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Content Blocks Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {contentBlocks.map((block) => {
                    const Icon = block.icon
                    return (
                      <motion.button
                        key={block.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddField(block.id)}
                        className={`group p-3 rounded-xl bg-gradient-to-br ${block.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center gap-2`}
                      >
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-center leading-tight">
                          {block.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Divider */}
                {/* <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 px-2">
                    💡 <span className="font-semibold">Quick Tip:</span> Scroll or collapse to save space
                  </p>
                </div> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 ${
              isExpanded
                ? "bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                : "bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            } text-white border-2 border-white`}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <ChevronLeft className="w-6 h-6" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </motion.div>
          </motion.button>

          {/* Floating Label */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 0.1 }}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-semibold shadow-xl pointer-events-none"
            >
              Add Content
              <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 border-l-8 border-t-4 border-b-4 border-l-gray-900 border-t-transparent border-b-transparent"></div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

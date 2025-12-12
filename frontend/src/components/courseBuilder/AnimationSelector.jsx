import React, { useState, useEffect } from "react"
import axios from "axios"
import { Sparkles, Loader } from "lucide-react"
import { Select, Button } from "./UI"

export default function AnimationSelector({ onSelect, selectedAnimationId, disabled = false }) {
  const [animations, setAnimations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnimations()
  }, [])

  const loadAnimations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setError('User not authenticated')
        return
      }

      // Fetch animations for the current teacher
      const response = await axios.get(
        `http://localhost:5000/api/animations?authorId=${userId}`
      )
      setAnimations(response.data || [])
    } catch (err) {
      console.error('Error loading animations:', err)
      setError('Failed to load animations')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <label className="block text-sm font-semibold text-gray-700">
          Select Animation
        </label>
        {isLoading && <Loader className="w-4 h-4 animate-spin text-gray-500" />}
      </div>

      {error && (
        <div className="p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {animations.length === 0 && !isLoading ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
          <p className="mb-2">No animations found. Create one in the Animation Studio first!</p>
          <p className="text-xs text-gray-600">Go to the Animation Studio page to create and save animations.</p>
        </div>
      ) : (
        <select
          value={selectedAnimationId || ''}
          onChange={(e) => onSelect(e.target.value || null)}
          disabled={disabled || isLoading}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded bg-white text-gray-900 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Select an animation --</option>
          {animations.map((animation) => (
            <option key={animation._id} value={animation._id}>
              {animation.title} ({animation.objects?.length || 0} objects)
            </option>
          ))}
        </select>
      )}

      {selectedAnimationId && animations.length > 0 && (
        <Button
          onClick={loadAnimations}
          variant="ghost"
          size="sm"
          className="w-full text-blue-600 hover:bg-blue-50"
        >
          Refresh Animations
        </Button>
      )}
    </div>
  )
}

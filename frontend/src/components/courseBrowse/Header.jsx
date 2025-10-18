import { Brain, ChevronRight } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/student" className="flex items-center gap-3 hover:opacity-80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MindQuest</h1>
            <p className="text-sm text-gray-500">Browse Courses</p>
          </div>
        </a>
        
        <a href="/student" className="flex items-center text-gray-700 border px-3 py-1 rounded-md hover:bg-gray-100">
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
          Back to Profile
        </a>
      </div>
    </header>
  )
}

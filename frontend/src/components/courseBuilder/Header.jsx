// /src/components/Header.jsx
import React from "react"
import { BookOpen, Check, Loader2, Sun, Moon, Eye, Save, Menu, X } from "lucide-react"
import { Button } from "./UI"

export default function Header({
  saveStatus,
  onPreview,
  onSave,
  isSidebarCollapsed,
  onToggleSidebar,
}) {
  return (
    <div className="mq-header">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left Section: Logo + Title + Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button */}
          <Button
            onClick={onToggleSidebar}
            variant="ghost"
            size="sm"
            className="hidden lg:inline-flex p-2 h-auto hover:bg-gray-100"
            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <X className="w-5 h-5 text-gray-600" />
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl mq-header-logo flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold mq-header-title">MindQuest</h1>
              <p className="text-sm mq-header-subtitle">Course Builder</p>
            </div>
          </div>
        </div>

        {/* Right Section: Status + Buttons */}
        <div className="flex items-center gap-3">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border-gray-300">
            {saveStatus === "saved" && (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-600">
                  Saved
                </span>
              </>
            )}
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs font-medium text-gray-600">
                  Saving...
                </span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-medium text-gray-600">
                  Unsaved
                </span>
              </>
            )}
          </div>

          {/* Preview Button */}
          <Button
            onClick={onPreview}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>

          {/* Save Button */}
          <Button
            onClick={onSave}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Save className="w-4 h-4" />
            Save Course
          </Button>
        </div>
      </div>
    </div>
  )
}

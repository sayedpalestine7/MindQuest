// /src/components/courseBuilder/LeftPanel.jsx
import React, { useState } from "react"
import { BookMarked, HelpCircle, Sparkles, Code2 } from "lucide-react"
import TabNavigation from "./TabNavigation"
import Sidebar from "./Sidebar"

/**
 * Left panel with tabbed interface for Lessons, Quiz, and AI Tools
 */
export default function LeftPanel({
    // Lessons props
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    addLesson,
    deleteLesson,
    updateLessonTitle,
    updateLessonPreview,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggedLessonId,
    // Quiz props
    course,
    setCourse,
    isQuizSectionOpen,
    setIsQuizSectionOpen,
    addQuizQuestion,
    updateQuizQuestion,
    updateQuizOption,
    deleteQuizQuestion,
    updateQuizSettings,
    // AI Tools props
    onOpenAIGenerate,
    onOpenAIHtmlGenerate,
    isGenerating,
    // Tab control
    activeTab = "lessons",
    onTabChange,
}) {


    const tabs = [
        {
            id: "lessons",
            label: "Lessons",
            icon: <BookMarked className="w-4 h-4" />,
            badge: lessons.length,
        },
        {
            id: "quiz",
            label: "Quiz",
            icon: <HelpCircle className="w-4 h-4" />,
            badge: course.finalQuiz?.questions?.length || 0,
        },
        {
            id: "ai",
            label: "AI Tools",
            icon: <Sparkles className="w-4 h-4" />,
        },
    ]

    return (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden flex flex-col sticky top-24">
            {/* Tab Navigation */}
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "lessons" && (
                    <div className="p-4">
                        <Sidebar
                            lessons={lessons}
                            selectedLessonId={selectedLessonId}
                            setSelectedLessonId={setSelectedLessonId}
                            addLesson={addLesson}
                            deleteLesson={deleteLesson}
                            updateLessonTitle={updateLessonTitle}
                            updateLessonPreview={updateLessonPreview}
                            handleDragStart={handleDragStart}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            handleDragEnd={handleDragEnd}
                            draggedLessonId={draggedLessonId}
                        />
                    </div>
                )}

                {activeTab === "quiz" && (
                    <div className="h-full overflow-y-auto p-4">
                        <div className="space-y-4">
                            {/* Info Card */}
                            <div className="p-4 rounded-lg border-2 border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                                        <HelpCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Quiz Builder
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Questions:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {course.finalQuiz?.questions?.length || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Course Points:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {course.finalQuiz?.points || 100}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Passing Score:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {course.finalQuiz?.passingScore || 70}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="space-y-4">
                            {/* AI Generation Info */}
                            <div className="p-4 rounded-lg border-2 border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            AI Quiz Generation
                                        </h3>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Automatically generate quiz questions from your course content using AI.
                                            Choose the number of questions, types, and topic.
                                        </p>
                                        <button
                                            onClick={onOpenAIGenerate}
                                            disabled={isGenerating}
                                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                        >
                                            {isGenerating ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    Generate Questions
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* AI Features List */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Features:</h4>
                                <div className="space-y-2">
                                    {[
                                        "Multiple question types (MCQ, True/False, Short Answer)",
                                        "Customizable difficulty levels",
                                        "Topic-based generation",
                                        "Instant preview and editing",
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg
                                                    className="w-3 h-3 text-green-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tips */}
                            {/* <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    <span className="font-semibold">💡 Tip:</span> For best results, make
                                    sure your course has detailed lesson content before generating questions.
                                </p>
                            </div> */}
                        </div>
                        </div>
                    </div>
                )}

                {activeTab === "ai" && (
                    <div className="h-full overflow-y-auto p-4">
                        <div className="space-y-4">
                            {/* AI Quiz Generation */}
                            <div className="p-4 rounded-lg border-2 border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            AI Quiz Generation
                                        </h3>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Automatically generate quiz questions from your course content using AI.
                                        </p>
                                        <button
                                            onClick={onOpenAIGenerate}
                                            disabled={isGenerating}
                                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                        >
                                            {isGenerating ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    Generate Questions
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* AI HTML Generation */}
                            <div className="p-4 rounded-lg border-2 border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Code2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            AI HTML Animation
                                        </h3>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Generate interactive HTML visualizations and animations for your lessons.
                                        </p>
                                        <button
                                            onClick={onOpenAIHtmlGenerate}
                                            disabled={isGenerating}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                        >
                                            {isGenerating ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Code2 className="w-4 h-4" />
                                                    Generate HTML
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* AI Features List */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">AI Features:</h4>
                                <div className="space-y-2">
                                    {[
                                        "Quiz questions with multiple types",
                                        "Interactive HTML animations",
                                        "Topic-based generation",
                                        "Instant preview and editing",
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg
                                                    className="w-3 h-3 text-green-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

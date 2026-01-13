// /src/components/courseBuilder/TabNavigation.jsx
import React from "react"
import { motion } from "framer-motion"

/**
 * Reusable tab navigation component
 * @param {Array} tabs - Array of tab objects: [{ id, label, icon, badge }]
 * @param {string} activeTab - Currently active tab id
 * @param {function} onTabChange - Callback when tab is clicked
 */
export default function TabNavigation({ tabs, activeTab, onTabChange }) {
    return (
        <div className="flex border-b border-gray-200 bg-white">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex-1 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none ${isActive
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && tab.badge !== null && (
                                <span
                                    className={`ml-1 px-2 py-0.5 text-xs rounded-full ${isActive
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}

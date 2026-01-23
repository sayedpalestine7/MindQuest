import React from "react";

/**
 * DashboardLayout - Root wrapper for the teacher dashboard
 * Manages the full-width header and two-column layout: left (user dashboard) + right (interaction panel)
 */
export default function DashboardLayout({ header, leftPanel, rightPanel }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Full-width header */}
      {header && (
        <div className="flex-shrink-0">
          {header}
        </div>
      )}
      
      {/* Two-column layout with spacing */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden gap-4 px-60 py-4">
        {/* Left Panel - User Dashboard (Profile, Performance, Stats) */}
        <div className="flex-1 lg:max-w-[55%] min-h-0 overflow-hidden mq-card">
          {leftPanel}
        </div>

        {/* Right Panel - Tabbed Interaction (Courses/Chat) */}
        <div className="lg:w-[45%] min-h-0 overflow-hidden mq-card">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}

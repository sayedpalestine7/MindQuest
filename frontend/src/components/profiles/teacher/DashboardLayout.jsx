import React from "react";

/**
 * DashboardLayout - Root wrapper for the teacher dashboard
 * Manages the full-width header and two-column layout: left (user dashboard) + right (interaction panel)
 */
export default function DashboardLayout({ header, leftPanel, rightPanel }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Full-width header */}
      {header && (
        <div className="flex-shrink-0">
          {header}
        </div>
      )}
      
      {/* Two-column layout with spacing */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden gap-4 p-4">
        {/* Left Panel - User Dashboard (Profile, Performance, Stats) */}
        <div className="flex-1 lg:max-w-[60%] min-h-0 overflow-hidden rounded-xl shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
          {leftPanel}
        </div>

        {/* Right Panel - Tabbed Interaction (Courses/Chat) */}
        <div className="lg:w-[40%] min-h-0 overflow-hidden rounded-xl shadow-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: '1px', borderStyle: 'solid' }}>
          {rightPanel}
        </div>
      </div>
    </div>
  );
}

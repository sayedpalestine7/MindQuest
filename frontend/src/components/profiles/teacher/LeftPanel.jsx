import React from "react";

/**
 * LeftPanel - User dashboard container
 * Contains user summary, performance, and analytics
 */
export default function LeftPanel({ userSummary, mainContent }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* User Summary - Profile info and key stats */}
      <div className="border-b border-slate-200 ">
        {userSummary}
      </div>

      {/* Main Content - Performance, Stats, etc */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {mainContent}
      </div>
    </div>
  );
}

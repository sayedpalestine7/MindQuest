import React from "react";
import StudentStatsSection from "./StudentStatsSection";

/**
 * StudentStatsPanel - Compact stats display panel for students
 */
export default function StudentStatsPanel({ stats }) {
  return (
    <div className="mq-card p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-slate-800">Statistics</h2>
      <div className="flex-1">
        <StudentStatsSection stats={stats} />
      </div>
    </div>
  );
}

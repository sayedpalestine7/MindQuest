import React from "react";
import StudentPerformanceSection from "./StudentPerformanceSection";

/**
 * StudentPerformancePanel - Wrapper for student performance analytics
 */
export default function StudentPerformancePanel({ stats }) {
  return (
    <div className="mq-card p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-slate-800">
        Learning Overview
      </h2>
      <div className="flex-1">
        <StudentPerformanceSection stats={stats} />
      </div>
    </div>
  );
}

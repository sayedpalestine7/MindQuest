import React from "react";
import StudentPerformanceSection from "./StudentPerformanceSection";

/**
 * StudentPerformancePanel - Wrapper for student performance analytics
 */
export default function StudentPerformancePanel({ stats }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-slate-800">
        Learning Overview
      </h2>
      <StudentPerformanceSection stats={stats} />
    </div>
  );
}

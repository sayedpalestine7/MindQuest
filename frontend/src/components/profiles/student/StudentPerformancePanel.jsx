import React from "react";
import StudentPerformanceSection from "./StudentPerformanceSection";

/**
 * StudentPerformancePanel - Wrapper for student performance analytics
 */
export default function StudentPerformancePanel({ stats }) {
  return (
    <div className="rounded-lg shadow-sm p-4 h-full flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: '1px', borderStyle: 'solid' }}>
      <h2 className="text-lg font-bold mb-3" style={{ color: '#263238' }}>
        Learning Overview
      </h2>
      <div className="flex-1">
        <StudentPerformanceSection stats={stats} />
      </div>
    </div>
  );
}

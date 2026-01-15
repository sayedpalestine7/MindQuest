import React from "react";
import StatsSection from "./StatsSection";

/**
 * StatsPanel - Compact stats display panel
 * Wraps StatsSection for consistent panel styling
 */
export default function StatsPanel({ stats }) {
  return (
    <div className="rounded-lg shadow-sm p-4 h-full flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: '1px', borderStyle: 'solid' }}>
      <h2 className="text-lg font-bold mb-3" style={{ color: '#263238' }}>Statistics</h2>
      <div className="flex-1">
        <StatsSection stats={stats} />
      </div>
    </div>
  );
}

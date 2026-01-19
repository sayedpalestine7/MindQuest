import React from "react";
import StatsSection from "./StatsSection";

/**
 * StatsPanel - Compact stats display panel
 * Wraps StatsSection for consistent panel styling
 */
export default function StatsPanel({ stats }) {
  return (
    <div className="mq-card p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-slate-800">Statistics</h2>
      <div className="flex-1">
        <StatsSection stats={stats} />
      </div>
    </div>
  );
}

import React from "react";
import StatsSection from "./StatsSection";

/**
 * StatsPanel - Compact stats display panel
 * Wraps StatsSection for consistent panel styling
 */
export default function StatsPanel({ stats, layout = "stack", title = "Statistics" }) {
  const isGrid = layout === "grid";

  return (
    <div className={`p-4 flex flex-col ${isGrid ? "" : "h-full"}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <div className={isGrid ? "" : "flex-1"}>
        <StatsSection stats={stats} layout={layout} />
      </div>
    </div>
  );
}

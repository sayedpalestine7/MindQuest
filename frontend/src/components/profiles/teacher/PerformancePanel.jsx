import React from "react";
import PerformanceSection from "./PerformanceSection";

/**
 * PerformancePanel - Wrapper for performance analytics
 * Exposes layout-specific controls and wraps PerformanceSection
 */
export default function PerformancePanel({ stats }) {
  return (
    <div className="mq-card p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-slate-800">
        Performance Overview
      </h2>
      <div className="flex-1">
        <PerformanceSection stats={stats} />
      </div>
    </div>
  );
}

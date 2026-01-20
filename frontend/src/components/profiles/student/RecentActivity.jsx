import React from "react";
import { Clock } from "lucide-react";

function getRelativeTime(date) {
  if (!date) return "";
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function RecentActivity({ activities }) {
  return (
    <div className="mq-card p-4 h-full flex flex-col">
      <h3 className="text-lg font-bold mb-3 text-slate-800 flex items-center gap-2">
        <Clock className="w-5 h-5 text-slate-500" />
        Recent Activity
      </h3>
      <ul className="space-y-3">
        {activities.map((a) => {
          const Icon = a.icon || Clock;
          return (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 p-3 border border-slate-200 rounded-md bg-white/60"
            >
              <div className="flex items-start gap-2 min-w-0">
                <Icon className="w-4 h-4 mt-0.5 text-slate-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {a.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.detail}
                  </p>
                  <p className="text-xs text-slate-400">
                    {getRelativeTime(a.timestamp)}
                  </p>
                </div>
              </div>
              {a.points ? (
                <p className="text-xs font-semibold text-emerald-600 whitespace-nowrap">
                  +{a.points}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

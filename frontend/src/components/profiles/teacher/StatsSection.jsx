"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Star, Award } from "lucide-react";

export default function StatsSection({ stats, layout = "stack" }) {
  if (!stats) return null;

  const statsArray = [
    { 
      title: "Courses", 
      value: stats.totalCourses || 0, 
      icon: BookOpen,
      iconColor: "#546E7A", // blue in hex is 
      iconBg: "#E8EAF6"
    },
    { 
      title: "Students", 
      value: stats.totalEnrolledStudents || 0, 
      icon: Users,
      iconColor: "#546E7A", // Blue-gray (neutral)
      iconBg: "#E8EAF6"
    },
    { 
      title: "Rating", 
      value: (stats.rating || 0).toFixed(1), 
      icon: Star,
      iconColor: "#546E7A", // Gold
      iconBg: "#E8EAF6"
    },
    { 
      title: "Points", 
      value: stats.totalPoints || 0, 
      icon: Award,
      iconColor: "#546E7A", // Teal
      iconBg: "#E8EAF6"
    },
  ];

  const containerClassName =
    layout === "grid"
      ? "grid grid-cols-2 lg:grid-cols-4 gap-3"
      : "space-y-3";

  return (
    <motion.div
      className={containerClassName}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {statsArray.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.1 }}
          className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: stat.iconBg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              {stat.subtitle && <p className="text-xs text-slate-400">{stat.subtitle}</p>}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Award, TrendingUp } from "lucide-react";

export default function StudentStatsSection({ stats }) {
  if (!stats) return null;

  const statsArray = [
    { 
      title: "Total Courses", 
      value: stats.totalCourses || 0, 
      icon: BookOpen,
      iconColor: "#3F51B5", // Indigo
      iconBg: "#E8EAF6"
    },
    { 
      title: "Completed", 
      value: stats.completedCourses || 0, 
      icon: CheckCircle,
      iconColor: "#26A69A", // Teal
      iconBg: "#E0F2F1"
    },
    { 
      title: "Total Points", 
      value: stats.totalPoints || 0, 
      icon: Award,
      iconColor: "#F9A825", // Gold
      iconBg: "#FFF9C4"
    },
    { 
      title: "Progress", 
      value: `${stats.overallProgress || 0}%`, 
      icon: TrendingUp,
      iconColor: "#607D8B", // Blue-gray
      iconBg: "#ECEFF1"
    },
  ];

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {statsArray.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i }}
          whileHover={{ scale: 1.02 }}
          className="mq-card p-4 relative"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: stat.iconBg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

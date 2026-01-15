"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Star, Award } from "lucide-react";

export default function StatsSection({ stats }) {
  if (!stats) return null;

  const statsArray = [
    { 
      title: "Courses", 
      value: stats.totalCourses || 0, 
      icon: BookOpen,
      iconColor: "#3F51B5", // Indigo
      iconBg: "#E8EAF6"
    },
    { 
      title: "Students", 
      value: stats.totalEnrolledStudents || 0, 
      icon: Users,
      iconColor: "#607D8B", // Blue-gray (neutral)
      iconBg: "#ECEFF1"
    },
    { 
      title: "Rating", 
      value: (stats.rating || 0).toFixed(1), 
      icon: Star,
      iconColor: "#F9A825", // Gold
      iconBg: "#FFF9C4"
    },
    { 
      title: "Points", 
      value: stats.totalPoints || 0, 
      icon: Award,
      iconColor: "#26A69A", // Teal
      iconBg: "#E0F2F1"
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
          className="rounded-lg shadow-sm p-4 relative"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: '1px', borderStyle: 'solid' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: stat.iconBg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium" style={{ color: '#607D8B' }}>{stat.title}</p>
              <p className="text-2xl font-bold" style={{ color: '#263238' }}>{stat.value}</p>
              {stat.subtitle && <p className="text-xs" style={{ color: '#9E9E9E' }}>{stat.subtitle}</p>}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

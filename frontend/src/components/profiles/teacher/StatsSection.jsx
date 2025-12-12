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
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    { 
      title: "Students", 
      value: stats.totalStudents || 0, 
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    { 
      title: "Rating", 
      value: (stats.rating || 0).toFixed(1), 
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    { 
      title: "Points", 
      value: stats.totalPoints || 0, 
      icon: Award,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
  ];

  return (
    <motion.div
      className="space-y-4"
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
          whileHover={{ scale: 1.05, translateY: -4 }}
          className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-md p-4 text-white overflow-hidden relative group`}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white/80">{stat.title}</p>
              <stat.icon className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

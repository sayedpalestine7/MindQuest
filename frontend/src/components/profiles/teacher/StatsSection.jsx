"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Star, Award } from "lucide-react";

// Optional: define icons for each stat
const iconsMap = {
  totalCourses: BookOpen,
  totalStudents: Users,
  averageRating: Star,
  totalPoints: Award,
};

export default function StatsSection({ stats }) {
  if (!stats) return null;

  // Convert object into an array of { title, value, icon }
  const statsArray = [
    { title: "Courses", value: stats.totalCourses || 0, icon: BookOpen },
    { title: "Students", value: stats.totalStudents || 0, icon: Users },
    { title: "Rating", value: stats.averageRating || 0, icon: Star },
    { title: "Achievements", value: stats.totalPoints || 0, icon: Award },
  ];

  return (
    <motion.div
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {statsArray.map((stat, i) => (
        <motion.div
          key={i}
          className="bg-white rounded-2xl shadow p-4 flex items-center space-x-4"
          whileHover={{ scale: 1.05 }}
        >
          <stat.icon className="w-10 h-10 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

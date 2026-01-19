"use client"

import { motion } from "framer-motion"
import { Users, BookOpen, Star } from "lucide-react"

export default function PerformanceSection({ stats = {} }) {
  // Calculate metrics
  const totalStudents = stats.totalStudents || 0;
  const totalCourses = stats.totalCourses || 0;
  const rating = stats.rating || 0;

  // Simplified chart data with cold colors
  const chartData = [
    { label: 'Courses', value: totalCourses, max: 20, color: '#546E7A', icon: BookOpen },
    { label: 'Students', value: totalStudents, max: 500, color: '#78909C', icon: Users },
    { label: 'Rating', value: rating, max: 5, color: '#90A4AE', icon: Star, isDecimal: true },
  ];

  return (
    <motion.div
      className="mq-card p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-base font-semibold mb-4 text-slate-600">Performance Overview</h3>

      {/* Simplified Chart */}
      <div className="space-y-4">
        {chartData.map((item, index) => {
          const Icon = item.icon;
          const percentage = Math.min((item.value / item.max) * 100, 100);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-sm text-slate-500">
                    {item.label}
                  </span>
                </div>
                <span className="text-base font-semibold text-slate-800">
                  {item.isDecimal ? item.value.toFixed(1) : item.value}
                </span>
              </div>

              {/* Simple Progress Bar */}
              <div className="relative h-2 rounded-full overflow-hidden bg-slate-200">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  )
}

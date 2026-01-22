"use client"

import { motion } from "framer-motion"
import { Award, BookOpen, TrendingUp } from "lucide-react"

export default function StudentPerformanceSection({ stats = {} }) {
  // Calculate metrics
  const totalCourses = stats.totalCourses || 0;
  const completedCourses = stats.completedCourses || 0;
  const overallProgress = stats.overallProgress || 0;
  const totalPoints = stats.totalPoints || 0;
  const numberOfClasses = totalCourses || 1; // Avoid division by zero
  if (totalCourses === 0 && completedCourses === 0 && overallProgress === 0 && totalPoints === 0) {
    return <p className="text-slate-500">No performance data available.</p>;
  }

  // Simplified chart data with cold colors
  const chartData = [
    { label: 'Total Courses', value: totalCourses, max: 20, color: '#e8eaf6', icon: BookOpen },
    { label: 'Completed', value: completedCourses, max: 20, color: '#e8eaf6', icon: Award },
    { label: 'Progress', value: overallProgress, max: 100, color: '#e8eaf6', icon: TrendingUp, suffix: '%' },
    { label: 'Total Points', value: totalPoints, max: (numberOfClasses*10), color: '#e8eaf6', icon: Award },
  ];

  return (
    <motion.div
      className="py-3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Horizontal Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {chartData.map((item, index) => {
          const Icon = item.icon;
          const percentage = Math.min((item.value / item.max) * 100, 100);
          
          return (
            <motion.div
              key={index}
              className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#546E7A" }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {item.value}{item.suffix || ''}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 rounded-full overflow-hidden bg-slate-200">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: "#2563EB" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  )
}

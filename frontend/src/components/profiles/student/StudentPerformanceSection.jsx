"use client"

import { motion } from "framer-motion"
import { Award, BookOpen, TrendingUp } from "lucide-react"

export default function StudentPerformanceSection({ stats = {} }) {
  // Calculate metrics
  const totalCourses = stats.totalCourses || 0;
  const completedCourses = stats.completedCourses || 0;
  const overallProgress = stats.overallProgress || 0;

  // Simplified chart data with cold colors
  const chartData = [
    { label: 'Total Courses', value: totalCourses, max: 20, color: '#546E7A', icon: BookOpen },
    { label: 'Completed', value: completedCourses, max: 20, color: '#78909C', icon: Award },
    { label: 'Progress', value: overallProgress, max: 100, color: '#90A4AE', icon: TrendingUp, suffix: '%' },
  ];

  return (
    <motion.div
      className="rounded-lg p-4"
      style={{ backgroundColor: '#FFFFFF' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-base font-semibold mb-4" style={{ color: '#607D8B' }}>Learning Progress</h3>

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
                  <span className="text-sm" style={{ color: '#607D8B' }}>
                    {item.label}
                  </span>
                </div>
                <span className="text-base font-semibold" style={{ color: '#263238' }}>
                  {item.value}{item.suffix || ''}
                </span>
              </div>

              {/* Simple Progress Bar */}
              <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#ECEFF1' }}>
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

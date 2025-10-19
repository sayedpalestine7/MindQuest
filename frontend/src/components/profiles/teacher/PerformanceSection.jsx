"use client"

import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

export default function PerformanceSection() {
  return (
    <motion.div
      className="bg-white shadow rounded-2xl p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <TrendingUp className="text-green-600" /> Performance Overview
      </h3>
      <p className="text-gray-600 mb-3">
        Excellent progress this semester! You’ve increased student engagement by <b>18%</b>.
      </p>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <motion.div
          className="bg-green-500 h-4 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "82%" }}
          transition={{ duration: 1.2 }}
        />
      </div>

      <p className="text-right text-sm text-gray-500 mt-2">82% performance goal reached</p>
    </motion.div>
  )
}

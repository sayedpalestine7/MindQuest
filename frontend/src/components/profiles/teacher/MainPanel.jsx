import React from "react";
import { motion } from "framer-motion";

/**
 * MainPanel - Primary content region for performance and analytics
 * Contains PerformancePanel and StatsPanel arranged responsively
 */
export default function MainPanel({ children }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

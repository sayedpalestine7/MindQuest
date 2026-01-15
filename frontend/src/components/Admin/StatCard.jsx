import { motion } from "framer-motion";

function StatCard({ title, value, Icon, index, trend }) {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 },
      }}
    >
      {/* Header */}
      <div className="relative overflow-hidden bg-gray-900 border border-gray-700 rounded-xl shadow-md">
        <div className="flex flex-row items-center justify-between px-4 pt-4 pb-2 ">
          <h3 className="text-sm text-white font-medium text-base-content/70">{title}</h3>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Value & Trend */}  
        <div className="px-5 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1 + 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-3xl font-extrabold text-base-300"
        >
            {value.toLocaleString()}
          </motion.div>

        {trend && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1 + 0.35,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className={`mt-2 text-xs font-medium ${
              trend.isPositive ? "text-success" : "text-error"
            }`}
          >
          </motion.p>
        )}
        </div>

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 rounded-xl"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
export default StatCard;
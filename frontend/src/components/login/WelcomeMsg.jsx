import React from 'react'
import { motion } from "framer-motion"

function WelcomeMsg({ title, subtitle }) {
return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-6"
    >
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      <p className="text-base-content/70 mt-1">{subtitle}</p>
    </motion.div>
  );
}

export default WelcomeMsg
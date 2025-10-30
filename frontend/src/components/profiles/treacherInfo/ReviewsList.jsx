import React from "react";
import ReviewCard from "./ReviewCard";
import { motion } from "framer-motion";

export default function ReviewsList({ reviews }) {
  return (
    <div className="space-y-4">
      {reviews.map((review, i) => (
        <motion.div
          key={review.id || i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <ReviewCard key={review.id} review={review} />
        </motion.div>
      ))}
    </div>
  );
}

import React from "react";
import CourseCard from "./CourseCard";
import { motion } from "framer-motion";

export default function CoursesList({ courses, enrolledCourses }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {courses && courses.length > 0 ? (
        courses.map((course, i) => (
          <motion.div
            key={course.id || i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5, ease: "easeOut" }}
          >
            <CourseCard
              key={course.id}
              course={course}
              enrolledCourses={enrolledCourses}
            />
          </motion.div>
        ))
      ) : (
        <p className="text-gray-500">No courses available.</p>
      )}

    </div>

  );
}

import React from "react";
import CourseCard from "./CourseCard";

export default function CoursesList({ courses, enrolledCourses, handleEnroll }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          enrolledCourses={enrolledCourses}
          handleEnroll={handleEnroll}
        />
      ))}
    </div>
  );
}

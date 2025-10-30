import React, { useState } from "react";
import { useParams } from "react-router";
import TeacherHeader from "../components/profiles/treacherInfo/TeacherHeader";
import ExpertiseTags from "../components/profiles/treacherInfo/ExpertiseTags";
import CoursesList from "../components/profiles/treacherInfo/CoursesList";
import ReviewsList from "../components/profiles/treacherInfo/ReviewsList";
import Header from "../components/profiles/treacherInfo/Header";

import { motion } from "framer-motion";
const teachersData = {
  "Sarah Mitchell": {
    name: "Sarah Mitchell",
    totalStudents: 12450, // ✅ Add this
    expertise: ["HTML", "CSS", "JavaScript"],
    courses: [
      { id: 1, title: "Introduction to Web Development" },
      { id: 3, title: "React Fundamentals" },
    ],
    reviews: [
      { id: 1, author: "Student A", text: "Amazing teacher!" },
      { id: 2, author: "Student B", text: "Very clear explanations." },
    ],
  },
  "Michael Chen": {
    name: "Michael Chen",
    totalStudents: 8920,
    expertise: ["JavaScript", "ES6", "Async"],
    courses: [
      { id: 2, title: "Advanced JavaScript Concepts" },
    ],
    reviews: [
      { id: 1, author: "Student C", text: "Loved this class!" },
    ],
  },
};


export default function TeacherPage() {

  const { instructor } = useParams(); // Get the route param properly
  const teacherName = decodeURIComponent(instructor);
  const teacher = teachersData[teacherName];
  const [enrolledCourses, setEnrolledCourses] = useState([1, 2, 3, 4]);

  if (!teacher) return <div>Teacher Not Found</div>;

  const handleEnroll = (id) => {
    if (!enrolledCourses.includes(id)) {
      setEnrolledCourses([...enrolledCourses, id]);
      alert("Enrolled successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className=""
      > 
      <Header onLogout={() => alert("Logged out")} />

        <div className="container mx-auto p-6 space-y-8 max-w-7xl bg-white rounded-lg shadow">
                  <TeacherHeader teacher={teacher} />
        <div className="mt-6 pt-6 border-t border-border">
          <ExpertiseTags skills={teacher.expertise} />
        </div>

        </div>

      </motion.div>
    </div>




    // <div className="min-h-screen bg-gray-50 p-6">
    //   <div className="container mx-auto p-6 space-y-8 max-w-7xl bg-white rounded-lg shadow">
    //     <TeacherHeader teacher={teacher} />
    //     <ExpertiseTags skills={teacher.expertise} />
    //   </div>
    //   <div className="mb-6">
    //     <h2 className="text-xl font-bold mb-4">Courses</h2>
    //     <CoursesList
    //       courses={teacher.courses}
    //       enrolledCourses={enrolledCourses}
    //       handleEnroll={handleEnroll}
    //     />
    //   </div>

    //   <div>
    //     <h2 className="text-xl font-bold mb-4">Reviews</h2>
    //     <ReviewsList reviews={teacher.reviews} />
    //   </div>
    // </div>
  );
}

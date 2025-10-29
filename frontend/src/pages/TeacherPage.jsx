import React, { useState } from "react";
import TeacherHeader from "../components/profiles/treacherInfo/TeacherHeader";
import ExpertiseTags from "../components/profiles/treacherInfo/ExpertiseTags";
import CoursesList from "../components/profiles/treacherInfo/CoursesList";
import ReviewsList from "../components/profiles/treacherInfo/ReviewsList";
import { teachersData } from "../fakeData/data.js";

export default function TeacherPage({ params }) {
  const teacherName = decodeURIComponent(params.name);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <TeacherHeader teacher={teacher} />
      <ExpertiseTags skills={teacher.expertise} />

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Courses</h2>
        <CoursesList
          courses={teacher.courses}
          enrolledCourses={enrolledCourses}
          handleEnroll={handleEnroll}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        <ReviewsList reviews={teacher.reviews} />
      </div>
    </div>
  );
}

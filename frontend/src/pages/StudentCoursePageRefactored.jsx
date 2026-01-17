// /src/pages/StudentCoursePageRefactored.jsx
/**
 * StudentCoursePageRefactored - Thin wrapper around StudentCoursePageWrapper
 * 
 * This page component is responsible for:
 * - Extracting route params (courseId)
 * - Passing them to the reusable StudentCoursePageWrapper
 * - Using 'student' mode for real student experience
 */
import React from "react"
import { useParams } from "react-router"
import StudentCoursePageWrapper from "../components/coursePage/StudentCoursePageWrapper"

export default function StudentCoursePageRefactored() {
  const { courseId } = useParams()

  return (
    <StudentCoursePageWrapper
      mode="student"
      courseIdProp={courseId}
    />
  )
}

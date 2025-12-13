import express from "express";
import { getStudentByID, putStudentByID, enrollCourse, getEnrolledCourses } from "../controllers/studentController.js";

const router = express.Router();

// Get student by MongoDB _id
router.get("/id/:id", getStudentByID);

// Update student by _id
router.put("/id/:id", putStudentByID);

// Enroll in a course
router.post("/:studentId/enroll/:courseId", enrollCourse);

// Get enrolled courses
router.get("/:studentId/courses", getEnrolledCourses);

export default router;

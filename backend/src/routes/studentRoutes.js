import express from "express";
import { getStudentByID, putStudentByID } from "../controllers/studentController.js";

const router = express.Router();

// Get student by MongoDB _id
router.get("/id/:id", getStudentByID);

// Update student by _id
router.put("/id/:id", putStudentByID);

// for enrolled course later
// router.post("/id/:id/enroll", enrollCourse);
// router.get("/id/:id/courses", getEnrolledCourses);

export default router;

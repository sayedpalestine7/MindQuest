import express from "express";
import { getTeacherByID, putTeacherByID, getTeacherByUserId } from "../controllers/teacherController.js";

const router = express.Router();

// Get teacher by MongoDB _id
router.get("/id/:id", getTeacherByID);

// Get teacher by userId
router.get("/user/:userId", getTeacherByUserId);

// Update teacher by _id
router.put("/id/:id", putTeacherByID);

export default router;

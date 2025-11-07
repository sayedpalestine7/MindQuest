import express from "express";
import { getStudentByID, putStudentByID } from "../controllers/studentController.js";

const router = express.Router();

// Get teacher by MongoDB _id
router.get("/id/:id", getStudentByID);

// Update teacher by _id
router.put("/id/:id", putStudentByID);

export default router;

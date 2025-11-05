import express from "express";
import { getTeacherByID , putTeacherByID } from "../controllers/teacherController.js";


const router = express.Router();

router.get("/:id", getTeacherByID);
router.put("/:id", putTeacherByID);

export default router
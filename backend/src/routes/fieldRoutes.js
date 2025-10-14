import express from "express";
import {
  createField,
  getFieldsByLesson,
  updateField,
  deleteField,
} from "../controllers/fieldController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole(["teacher", "admin"]), createField);
router.get("/lesson/:lessonId", getFieldsByLesson);
router.put("/:id", protect, requireRole(["teacher", "admin"]), updateField);
router.delete("/:id", protect, requireRole(["teacher", "admin"]), deleteField);

export default router;

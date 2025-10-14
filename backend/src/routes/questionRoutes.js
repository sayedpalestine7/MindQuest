import express from "express";
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole(["teacher", "admin"]), createQuestion);
router.get("/", getQuestions);
router.put("/:id", protect, requireRole(["teacher", "admin"]), updateQuestion);
router.delete("/:id", protect, requireRole(["teacher", "admin"]), deleteQuestion);

export default router;

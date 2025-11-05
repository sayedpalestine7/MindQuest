// // routes/animationRoutes.js
// import express from 'express';
// import {
//   saveAnimation,
//   downloadAnimation,
//   getAnimationById,
//   getTeacherAnimations,
//   patchAnimation,
//   deleteAnimation
// } from '../controllers/animationController.js';
// import { protect } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // router.post('/', protect, saveAnimation);
// router.post('/' , saveAnimation);
// router.get('/', protect, getTeacherAnimations);
// router.get('/:id', protect, getAnimationById);
// router.put('/:id', protect, saveAnimation); // full update
// router.patch('/:id', protect, patchAnimation);
// router.delete('/:id', protect, deleteAnimation);
// // router.post('/download', protect, downloadAnimation);
// router.post('/download', downloadAnimation);

// export default router;

import express from "express";
import Animation from "../models/mongo/animation.js";

const router = express.Router();

// 📥 Save animation
router.post("/", async (req, res) => {
  try {
    const { title, description, authorId, animationData, htmlExport } = req.body;

    const newAnimation = new Animation({
      title,
      description,
      authorId,
      animationData,
      htmlExport,
    });

    const saved = await newAnimation.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving animation:", err);
    res.status(500).json({ message: "Failed to save animation" });
  }
});

// 📤 Get all animations (optional filter by user)
router.get("/", async (req, res) => {
  try {
    const { authorId } = req.query;
    const query = authorId ? { authorId } : {};
    const animations = await Animation.find(query).sort({ createdAt: -1 });
    res.json(animations);
  } catch (err) {
    console.error("Error fetching animations:", err);
    res.status(500).json({ message: "Failed to fetch animations" });
  }
});

// 📄 Get one animation
router.get("/:id", async (req, res) => {
  try {
    const animation = await Animation.findById(req.params.id);
    if (!animation) return res.status(404).json({ message: "Animation not found" });
    res.json(animation);
  } catch (err) {
    console.error("Error fetching animation:", err);
    res.status(500).json({ message: "Failed to fetch animation" });
  }
});

// 🗑 Delete animation
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Animation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Animation not found" });
    res.json({ message: "Animation deleted successfully" });
  } catch (err) {
    console.error("Error deleting animation:", err);
    res.status(500).json({ message: "Failed to delete animation" });
  }
});

export default router;

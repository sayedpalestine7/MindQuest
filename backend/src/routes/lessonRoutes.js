import express from "express";
import Lesson from "../models/mongo/lesson.js";
import { Course } from "../models/mongo/course.js";

const router = express.Router();

// Create a lesson
router.post("/", async (req, res) => {
  try {
    const { title, description, videoUrl, duration, courseId } = req.body;

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      duration,
      course: courseId,
    });

    // Link the lesson to its course
    await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all lessons of a course
router.get("/course/:courseId", async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a lesson by ID
router.get("/:id", async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);    
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
});

// Update a lesson
router.put("/:id", async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate
        (req.params.id, req.body, { new: true });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a lesson
router.delete("/:id", async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);  
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        res.json({ message: "Lesson deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;

import Course from "../models/mongo/courseModel.js";
import User from "../models/mongo/userModel.js";
import Lesson from "../models/mongo/lessonModel.js";
import Quiz from "../models/mongo/quizModel.js";

// 🧠 CREATE a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, difficulty, thumbnail, teacherId, scoreOnFinish } = req.body;

    // Validate teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher ID or user is not a teacher" });
    }

    const course = await Course.create({
      title,
      description,
      difficulty,
      thumbnail,
      teacherId,
      scoreOnFinish: scoreOnFinish || 0,
    });

    res.status(201).json({ message: "✅ Course created successfully", course });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating course", error: err.message });
  }
};

// 📚 GET all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacherId", "name email profileImage")
      .select("-__v");
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching courses", error: err.message });
  }
};

// 🎯 GET single course by ID (with lessons + quiz)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacherId", "name email profileImage")
      .populate({
        path: "lessonIds",
        model: "Lesson",
        select: "title fieldIds",
      })
      .populate({
        path: "quizId",
        model: "Quiz",
        populate: {
          path: "questionIds",
          model: "Question",
        },
      });

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching course", error: err.message });
  }
};

// 🧱 UPDATE course
export const updateCourse = async (req, res) => {
  try {
    const { title, description, difficulty, thumbnail, scoreOnFinish, quizId } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, difficulty, thumbnail, scoreOnFinish, quizId },
      { new: true }
    );

    if (!updatedCourse) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ message: "✅ Course updated successfully", course: updatedCourse });
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating course", error: err.message });
  }
};

// 🗑️ DELETE course (and its lessons + quiz)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Delete related lessons
    await Lesson.deleteMany({ _id: { $in: course.lessonIds } });

    // Delete related quiz
    if (course.quizId) {
      await Quiz.findByIdAndDelete(course.quizId);
    }

    // Delete the course itself
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "✅ Course and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting course", error: err.message });
  }
};

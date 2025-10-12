import Quiz from "../models/mongo/quizModel.js";
import Course from "../models/mongo/courseModel.js";

// ➕ Create quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, courseId, questionIds } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const quiz = await Quiz.create({ title, courseId, questionIds });
    course.quizId = quiz._id;
    await course.save();

    res.status(201).json({ message: "✅ Quiz created successfully", quiz });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating quiz", error: err.message });
  }
};

// 📄 Get all quizzes for a course
export const getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId }).populate("questionIds");
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching quizzes", error: err.message });
  }
};

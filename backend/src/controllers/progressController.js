import Progress from "../models/mongo/progressModel.js";

// ➕ Create or update progress
export const saveProgress = async (req, res) => {
  try {
    const { studentId, courseId, completedLessons, quizScore, totalScore, status } = req.body;

    const progress = await Progress.findOneAndUpdate(
      { studentId, courseId },
      { completedLessons, quizScore, totalScore, status },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "✅ Progress saved", progress });
  } catch (err) {
    res.status(500).json({ message: "❌ Error saving progress", error: err.message });
  }
};

// 📈 Get progress for a student
export const getProgressByStudent = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId })
      .populate("courseId", "title thumbnail difficulty")
      .sort({ updatedAt: -1 });

    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching progress", error: err.message });
  }
};

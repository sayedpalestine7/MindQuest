import Progress from "../models/mongo/progressModel.js";

// 🧠 Create or update progress record
export const saveProgress = async (req, res) => {
  try {
    const { studentId, courseId, completedLessons, quizScore, totalScore, status } = req.body;

    // Validate required fields
    if (!studentId || !courseId)
      return res.status(400).json({ message: "studentId and courseId are required" });

    // Try finding an existing progress record
    let progress = await Progress.findOne({ studentId, courseId });

    if (progress) {
      // Update the existing record
      progress.completedLessons = completedLessons || progress.completedLessons;
      progress.quizScore = quizScore ?? progress.quizScore;
      progress.totalScore = totalScore ?? progress.totalScore;
      progress.status = status || progress.status;
      await progress.save();
      return res.status(200).json({ message: "✅ Progress updated", progress });
    }

    // Create new progress if none found
    progress = await Progress.create({
      studentId,
      courseId,
      completedLessons: completedLessons || [],
      quizScore: quizScore || 0,
      totalScore: totalScore || 0,
      status: status || "in-progress",
    });

    res.status(201).json({ message: "✅ Progress created", progress });
  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ message: "❌ Error saving progress", error: err.message });
  }
};

// 📈 Get all progress entries for a student
export const getProgressByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ message: "Missing studentId parameter" });

    const progress = await Progress.find({ studentId })
      .populate("courseId", "title thumbnail difficulty")
      .populate("completedLessons", "title")
      .sort({ updatedAt: -1 });

    res.status(200).json(progress);
  } catch (err) {
    console.error("Progress fetch error:", err);
    res.status(500).json({ message: "❌ Error fetching progress", error: err.message });
  }
};

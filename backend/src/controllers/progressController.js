import Progress from "../models/mongo/progressModel.js";
import Course from "../models/mongo/courseModel.js";
import Lesson from "../models/mongo/lessonModel.js";
import User from "../models/mongo/userModel.js";

// 🧠 Create or update full progress manually
export const saveProgress = async (req, res) => {
  try {
    const { studentId, courseId, completedLessons, quizScore, totalScore, status } = req.body;
    if (!studentId || !courseId)
      return res.status(400).json({ message: "studentId and courseId are required" });

    let progress = await Progress.findOne({ studentId, courseId });

    if (progress) {
      progress.completedLessons = completedLessons || progress.completedLessons;
      progress.quizScore = quizScore ?? progress.quizScore;
      progress.totalScore = totalScore ?? progress.totalScore;
      progress.status = status || progress.status;
      await progress.save();
      return res.status(200).json({ message: "✅ Progress updated", progress });
    }

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

// 📈 Get progress by student
export const getProgressByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
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

// 🧩 Auto-update when a lesson is completed
export const markLessonCompleted = async (req, res) => {
  try {
    const { studentId, courseId, lessonId } = req.body;
    if (!studentId || !courseId || !lessonId)
      return res.status(400).json({ message: "Missing required fields" });

    // Check course and lesson validity
    const course = await Course.findById(courseId);
    const lesson = await Lesson.findById(lessonId);
    if (!course || !lesson)
      return res.status(404).json({ message: "Course or lesson not found" });

    // Find or create progress record
    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      progress = new Progress({ studentId, courseId, completedLessons: [] });
    }

    // Add lesson if not already completed (compare by string to avoid duplicates)
    const completedSet = new Set((progress.completedLessons || []).map((id) => id.toString()));
    if (!completedSet.has(lessonId.toString())) {
      progress.completedLessons.push(lessonId);
      completedSet.add(lessonId.toString());
    }

    // Check if all lessons in the course are completed
    const totalLessons = course.lessonIds.length;
    const completedCount = Math.min(completedSet.size, totalLessons);

    let courseJustCompleted = false;
    if (totalLessons > 0 && completedCount >= totalLessons && progress.status !== "completed") {
      progress.status = "completed";
      courseJustCompleted = true;
      
      // Award 10 points for completing the course
      const student = await User.findById(studentId);
      if (student && student.role === "student") {
        if (!student.studentData) {
          student.studentData = { score: 0, finishedCourses: 0, enrolledCourses: [], courseProgress: [] };
        }
        student.studentData.score = (student.studentData.score || 0) + 10;
        student.studentData.finishedCourses = (student.studentData.finishedCourses || 0) + 1;
        await student.save();
      }
    }

    await progress.save();

    res.status(200).json({
      message: courseJustCompleted 
        ? "✅ Course completed! +10 points awarded" 
        : "✅ Lesson marked as completed",
      progress,
      lessonsCompleted: `${completedCount}/${totalLessons}`,
      courseCompleted: courseJustCompleted,
      pointsAwarded: courseJustCompleted ? 10 : 0,
    });
  } catch (err) {
    console.error("Lesson completion error:", err);
    res.status(500).json({ message: "❌ Error marking lesson complete", error: err.message });
  }
};

// 🧾 Auto-update when a quiz is completed
export const markQuizCompleted = async (req, res) => {
  try {
    const { studentId, courseId, quizScore, totalScore } = req.body;
    if (!studentId || !courseId)
      return res.status(400).json({ message: "Missing required fields" });

    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) {
      progress = new Progress({ studentId, courseId, completedLessons: [] });
    }

    progress.quizScore = quizScore || progress.quizScore;
    progress.totalScore = totalScore || progress.totalScore;

    // If quiz is passed (e.g., >= 70%)
    const passed = totalScore ? (quizScore / totalScore) >= 0.7 : false;
    if (passed) progress.status = "completed";

    await progress.save();

    res.status(200).json({
      message: "✅ Quiz progress updated",
      progress,
      passed,
    });
  } catch (err) {
    console.error("Quiz completion error:", err);
    res.status(500).json({ message: "❌ Error marking quiz complete", error: err.message });
  }
};

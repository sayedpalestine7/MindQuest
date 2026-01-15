// models/courseModel.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },

    // 🔹 Extra fields for frontend display
    category: { type: String, default: "General" },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    duration: { type: String, default: "4 weeks" },
    lessonsCount: { type: Number, default: 0 },
    price: { type: String, default: "Free" },
    tags: [{ type: String }],
    scoreOnFinish: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);

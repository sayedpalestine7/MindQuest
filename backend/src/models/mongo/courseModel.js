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
    // 📊 Real engagement metrics
    enrollmentCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    // Legacy fields (deprecated, use enrollmentCount/averageRating instead)
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    duration: { type: String, default: "4 weeks" },
    lessonsCount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    tags: [{ type: String }],
    scoreOnFinish: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    
    // 📢 Course approval workflow
    approvalStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);

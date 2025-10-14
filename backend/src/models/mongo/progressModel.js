import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
        quizScore: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    },
    { timestamps: true }
);

progressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model("Progress", progressSchema);

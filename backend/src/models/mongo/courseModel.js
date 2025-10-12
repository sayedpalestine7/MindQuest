import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: String,
        thumbnail: String,
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        lessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
        scoreOnFinish: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);

import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, default: "Final Quiz" },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    },
    { timestamps: true }
);

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

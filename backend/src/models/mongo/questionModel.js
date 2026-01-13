import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        type: { type: String, enum: ["mcq", "tf", "short"], default: "mcq" },
        options: [String],
        correctAnswer: { type: String, required: true },
        correctAnswerIndex: { type: Number }, // For MCQ questions
        points: { type: Number, default: 1 },
        explanation: String,
    },
    { timestamps: true }
);

export default mongoose.models.Question || mongoose.model("Question", questionSchema);

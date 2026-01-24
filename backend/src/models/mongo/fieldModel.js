import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
    {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
        type: {
            type: String,
            enum: ["paragraph", "image", "youtube", "html", "minigame", "question", "code", "animation", "table"],
            required: true,
        },
        content: mongoose.Schema.Types.Mixed, // can be string, object, or URL
        // Legacy reference to a Question doc (kept for compatibility during migration)
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        // Inline question properties for lesson-level questions (preferred)
        questionType: { type: String, enum: ["mcq", "tf", "short"], default: null },
        options: [{ type: String }],
        correctAnswer: { type: String, default: null },
        correctAnswerIndex: { type: Number, default: null },
        points: { type: Number, default: 1 },
        explanation: { type: String, default: "" },
        // If migrated from a Question doc, keep reference for audit/rollback
        migratedFromQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", default: null },
        animationId: { type: mongoose.Schema.Types.ObjectId, ref: "Animation" }, // Reference to saved animation
        animationPreviewMode: { type: String, enum: ["start-stop", "loop"], default: "start-stop" },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Field || mongoose.model("Field", fieldSchema);

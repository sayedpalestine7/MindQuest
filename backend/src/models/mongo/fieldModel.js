import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
    {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
        type: {
            type: String,
            enum: ["paragraph", "image", "youtube", "html", "minigame", "question"],
            required: true,
        },
        content: mongoose.Schema.Types.Mixed, // can be string, object, or URL
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Field || mongoose.model("Field", fieldSchema);

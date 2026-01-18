import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        fieldIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Field" }],
        isPreview: { type: Boolean, default: false }, // Allow non-enrolled users to view this lesson
    },
    { timestamps: true }
);

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

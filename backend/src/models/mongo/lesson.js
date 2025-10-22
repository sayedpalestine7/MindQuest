import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String },
    duration: { type: Number }, // in minutes or seconds
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    animationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animation', default: null },
  },
  { timestamps: true }
);

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
export default Lesson;

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { type: String, enum: ["teacher", "student"], required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for efficient cursor-based pagination
// Supports queries filtering by teacher+student and sorting by createdAt descending
messageSchema.index({ teacher: 1, student: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);

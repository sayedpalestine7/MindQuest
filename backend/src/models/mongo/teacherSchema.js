import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to user
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    specialization: { type: String },
    experience: { type: Number },
    bio: { type: String },
    phone: { type: String },
    link: { type: String },
    totalPoints: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);

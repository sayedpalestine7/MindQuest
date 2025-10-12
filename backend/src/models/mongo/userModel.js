import mongoose from "mongoose";

const teacherDataSchema = new mongoose.Schema({
    specialization: String,
    institution: String,
    certification: String, // URL
    score: { type: Number, default: 0 },
});

const studentDataSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    finishedCourses: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profileImage: String,
        role: { type: String, enum: ["admin", "teacher", "student"], required: true },
        teacherData: teacherDataSchema,
        studentData: studentDataSchema,
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

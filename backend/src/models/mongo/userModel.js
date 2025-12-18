import mongoose from "mongoose";

const teacherDataSchema = new mongoose.Schema({
    specialization: String,
    institution: String,
    certification: String, // URL or base64
    score: { type: Number, default: 0 },
    rejectionReason: String,
});

const studentDataSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    finishedCourses: { type: Number, default: 0 },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { 
            type: String, 
            required: [
                function() { 
                    return !this.googleAuth; 
                }, 
                'Password is required for non-Google sign-in' 
            ] 
        },
        googleAuth: { type: Boolean, default: false },
        profileImage: String,
        role: { type: String, enum: ["admin", "teacher", "student"], required: true },
        // NEW FIELD
        status: {
            type: String,
            enum: ["pending", "active", "rejected", "banned"],
            default: function () {
                return this.role === "teacher" ? "pending" : "active";
            }
        },

        teacherData: teacherDataSchema,
        studentData: studentDataSchema,
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

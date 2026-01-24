import mongoose from "mongoose";

const teacherDataSchema = new mongoose.Schema({
    specialization: String,
    institution: String,
    certification: String, // URL or base64
    score: { type: Number, default: 0 },
    rejectionReason: String,
});

const courseProgressSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    currentLessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    lastAccessed: { type: Date, default: Date.now },
    quizCompleted: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
}, { timestamps: true });

const studentDataSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    finishedCourses: { type: Number, default: 0 },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    courseProgress: [courseProgressSchema],
}, { _id: false });

const savedTransitionSchema = new mongoose.Schema(
    {
        startTime: { type: Number, required: true },
        duration: { type: Number, required: true },
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number },
        scale: { type: Number, default: 1 },
        rotation: { type: Number, default: 0 },
        color: { type: String },
        fillColor: { type: String },
        strokeColor: { type: String },
        borderWidth: { type: Number, default: 2 },
        openTop: { type: Boolean, default: false },
        text: { type: String },
        opacity: { type: Number, default: 1 },
        easing: { type: String, default: "linear" }
    },
    { _id: false }
);

const savedObjectSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["circle", "square", "triangle", "rectangle", "text", "group"],
            required: true
        },
        transitions: [savedTransitionSchema],
        children: []
    },
    { _id: false }
);

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
        banReason: { type: String, default: "" },

        teacherData: teacherDataSchema,
        studentData: studentDataSchema,
        savedObjects: { type: [savedObjectSchema], default: [] },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

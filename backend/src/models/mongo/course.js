import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Course description is required"],
        },
        difficulty: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        thumbnail: {
            type: String, // optional URL to an image
            default: "",
        },
        lessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lesson"
            }
        ],

    },
    { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);

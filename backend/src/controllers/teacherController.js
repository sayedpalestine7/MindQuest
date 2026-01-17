import { Teacher } from "../models/mongo/teacherSchema.js"
import User from "../models/mongo/userModel.js";
import Course from "../models/mongo/courseModel.js";

import bcrypt from "bcryptjs"

// get teacher by id
export const getTeacherByID = async (req, res) => {
  try {
    let teacher = await Teacher.findById(req.params.id).lean();

    // If not found, try userId
    if (!teacher) {
      teacher = await Teacher.findOne({ userId: req.params.id }).lean();
    }

    if (!teacher) return res.status(404).json({ message: "Teacher Not Found" });

    // Fetch courses for this teacher
    const courses = await Course.find({ teacherId: teacher.userId || teacher._id }).lean();

    // Calculate average rating from all courses
    let averageRating = 0;
    if (courses && courses.length > 0) {
      const coursesWithRatings = courses.filter(c => c.rating && c.rating > 0);
      if (coursesWithRatings.length > 0) {
        const totalRating = coursesWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0);
        averageRating = Math.round((totalRating / coursesWithRatings.length) * 10) / 10;
      }
    }

    // Return teacher with courses and calculated rating
    res.json({
      ...teacher,
      courses: courses || [],
      rating: averageRating,
    });
  } catch (err) {
    console.error("Error getting teacher:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// get teacher by userId
export const getTeacherByUserId  = async (req,res)=>{
  const { userId } = req.params;
  try {
    const teacher = await Teacher.findOne({ userId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update teacher by id
export const putTeacherByID = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "bio",
      "phone",
      "link",
      "avatar",
      "specialization",
      "experience",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // 1️⃣ Update Teacher collection
    const updated = await Teacher.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated)
      return res.status(404).json({ message: "Teacher not found" });

    // 2️⃣ Update User collection so admin sees the changes
    await User.findByIdAndUpdate(updated.userId, {
      name: updates.name,
      email: updates.email,
      profileImage: updates.avatar,
    });

    delete updated.__v;

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating teacher:", err);
    res.status(500).json({ message: "Server error" });
  }
};
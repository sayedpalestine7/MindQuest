import { Teacher } from "../models/mongo/teacherSchema.js"
import bcrypt from "bcryptjs"

// get teacher by id
export const getTeacherByID = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).lean();
        if (!teacher) return res.status(404).json({ message: "Teacher Not Found" })
        res.json(teacher)
    } catch (err) {
        console.error("Error Gettng teacher:", err);
        res.status(500).json({ message: "Server error" });
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

    // Filter allowed fields only
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Update teacher and return new version
    const updated = await Teacher.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true, // ensures schema validation still applies
    }).lean();

    if (!updated)
      return res.status(404).json({ message: "Teacher not found" });

    // Clean response
    delete updated.__v;

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating teacher:", err);
    res.status(500).json({ message: "Server error" });
  }
};
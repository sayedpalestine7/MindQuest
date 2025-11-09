import User from "../models/mongo/userModel.js";
//http://localhost:5000/api/student/id/690e68ad573b0a98730c2dcd

export const getStudentByID = async (req, res) => {
  try {
    let student = await User.findById(req.params.id).lean();

    // Optional: ensure only students are fetched
    if (student.role !== "student") {
      return res.status(400).json({ message: "User is not a student" });
    }

    if (!student) return res.status(404).json({ message: "Student Not Found" });


    res.json(student);

  } catch (err) {
    console.error("Error getting student:", err);
    res.status(500).json({ message: "Server error" });

  }
};

// Update Student Profile
export const putStudentByID = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, studentData, profileImage } = req.body;

    // Build the update object dynamically
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (studentData) updateData.studentData = studentData;
    if (profileImage) updateData.profileImage = profileImage; 

    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Ensure role is still student
    updateData.role = "student";

    const updatedStudent = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedStudent)
      return res.status(404).json({ message: "Student not found" });

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Server error" });
  }
};
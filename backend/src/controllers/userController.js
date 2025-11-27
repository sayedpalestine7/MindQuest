import User from "../models/mongo/userModel.js";
import { Teacher } from "../models/mongo/teacherSchema.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");

    const formatted = await Promise.all(
      users.map(async (u) => {
        let teacherData = null;
        if (u.role === "teacher") {
          teacherData = await Teacher.findOne({ userId: u._id });
        }

        return {
          id: u._id,
          name: teacherData?.name || u.name,
          email: teacherData?.email || u.email,
          userType: u.role,
          avatar: teacherData?.avatar || u.profileImage,
          points: u.role === "teacher" ? teacherData?.totalPoints || 0 : u.studentData?.score || 0,
          status: "active",
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

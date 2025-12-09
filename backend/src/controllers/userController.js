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
          status: u.status,
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const approveTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const user = await User.findByIdAndUpdate(
      teacherId,
      { status: "active" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Teacher approved successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const user = await User.findByIdAndUpdate(
      teacherId,
      { status: "rejected" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Teacher rejected successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await User.find({ role: "teacher", status: "pending" })
      .select("-password");

    const result = pendingTeachers.map((t) => ({
      id: t._id,
      name: t.name,
      email: t.email,
      specialization: t.teacherData?.specialization || "",
      institution: t.teacherData?.institution || "",
      certificates: [t.teacherData?.certification], // or array
    }));

    res.json(result);

  } catch (error) {
    console.error("Error fetching pending teachers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Ban or unban a user
export const toggleBanUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "banned" ? "active" : "banned";
    await user.save();

    res.json({ message: `User ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

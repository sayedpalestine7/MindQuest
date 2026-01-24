import User from "../models/mongo/userModel.js";
import { sendTeacherApprovalEmail, sendTeacherRejectionEmail, sendUserBannedEmail, sendUserUnbannedEmail } from "../services/emailService.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = (req.query.search || "").trim();
    const userType = req.query.userType || "all";
    const status = req.query.status || "all";
    const sortField = req.query.sortField || "name";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const match = {};
    if (userType !== "all") match.role = userType;
    if (status !== "all") match.status = status;

    const searchRegex = search ? new RegExp(escapeRegex(search), "i") : null;

    const sortMap = {
      name: "displayName",
      email: "displayEmail",
      points: "points",
      status: "status",
      userType: "role",
    };
    const sortKey = sortMap[sortField] || "displayName";

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "teachers",
          localField: "_id",
          foreignField: "userId",
          as: "teacherData",
        },
      },
      { $unwind: { path: "$teacherData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          displayName: { $ifNull: ["$teacherData.name", "$name"] },
          displayEmail: { $ifNull: ["$teacherData.email", "$email"] },
          displayAvatar: { $ifNull: ["$teacherData.avatar", "$profileImage"] },
          points: {
            $cond: [
              { $eq: ["$role", "teacher"] },
              { $ifNull: ["$teacherData.totalPoints", 0] },
              { $ifNull: ["$studentData.score", 0] },
            ],
          },
        },
      },
    ];

    if (searchRegex) {
      pipeline.push({
        $match: {
          $or: [{ displayName: searchRegex }, { displayEmail: searchRegex }],
        },
      });
    }

    pipeline.push({ $sort: { [sortKey]: sortOrder, _id: 1 } });
    pipeline.push({
      $facet: {
        items: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              id: "$_id",
              name: "$displayName",
              email: "$displayEmail",
              userType: "$role",
              avatar: "$displayAvatar",
              points: 1,
              status: 1,
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    });

    const [result] = await User.aggregate(pipeline);
    const total = result?.total?.[0]?.count || 0;

    res.json({
      items: result?.items || [],
      total,
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUsersSummary = async (req, res) => {
  try {
    const [totalUsers, activeStudents] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
    ]);

    res.json({ totalUsers, activeStudents });
  } catch (err) {
    console.error("Error fetching user summary:", err);
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

    // Send approval email
    await sendTeacherApprovalEmail(user.email, user.name);

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
    const { reason } = req.body;

    const user = await User.findById(teacherId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "rejected";

    if (user.role === "teacher") {
      if (!user.teacherData) user.teacherData = {};
      user.teacherData.rejectionReason = reason || "";
    }

    await user.save();

    // Send rejection email with reason
    await sendTeacherRejectionEmail(user.email, user.name, reason);

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
      avatar: t.profileImage,
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
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isBanning = user.status !== "banned";
    user.status = isBanning ? "banned" : "active";
    user.banReason = isBanning ? (reason || "") : "";
    await user.save();

    if (isBanning) {
      await sendUserBannedEmail(user.email, user.name, user.role, reason);
    } else {
      await sendUserUnbannedEmail(user.email, user.name, user.role);
    }

    res.json({ message: `User ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSavedObjects = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("savedObjects");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.savedObjects || []);
  } catch (err) {
    console.error("Error fetching saved objects:", err);
    res.status(500).json({ message: "Failed to fetch saved objects" });
  }
};

export const addSavedObject = async (req, res) => {
  try {
    const { name, type, transitions, children } = req.body || {};
    if (!name || !type || !Array.isArray(transitions) || transitions.length === 0) {
      return res.status(400).json({ message: "Invalid saved object payload" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedObject = {
      id: `saved_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      type,
      transitions,
      children: Array.isArray(children) ? children : []
    };

    user.savedObjects = [...(user.savedObjects || []), savedObject];
    await user.save();

    res.status(201).json(savedObject);
  } catch (err) {
    console.error("Error saving object:", err);
    res.status(500).json({ message: "Failed to save object" });
  }
};

export const deleteSavedObject = async (req, res) => {
  try {
    const userId = req.params.id;
    const savedId = req.params.savedId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const before = (user.savedObjects || []).length;
    user.savedObjects = (user.savedObjects || []).filter(s => s.id !== savedId);
    const after = (user.savedObjects || []).length;

    if (before === after) {
      return res.status(404).json({ message: 'Saved object not found' });
    }

    await user.save();
    res.json({ message: 'Saved object deleted', id: savedId });
  } catch (err) {
    console.error('Error deleting saved object:', err);
    res.status(500).json({ message: 'Failed to delete saved object' });
  }
};

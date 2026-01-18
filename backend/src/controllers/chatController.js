import mongoose from "mongoose";
import Message from "../models/mongo/message.js";
import User from "../models/mongo/userModel.js";
import Course from "../models/mongo/courseModel.js";


// -------------------- SEND MESSAGE --------------------
export const sendMessage = async (req, res) => {
  try {
    const { content, sender, teacher, student } = req.body;

    if (!content || !sender || !teacher || !student) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const msg = await Message.create({ content, sender, teacher, student });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- GET CONVERSATION (CURSOR-BASED PAGINATION) --------------------
/**
 * Fetch messages for a conversation with cursor-based pagination
 * Query params:
 *   - limit: Number of messages to return (default 50)
 *   - before: Cursor (ISO timestamp) to fetch messages older than this
 * Returns:
 *   - messages: Array of messages in descending order (newest first)
 *   - hasMore: Boolean indicating if more messages exist
 *   - oldestCursor: Cursor for next page (createdAt of oldest message)
 */
export const getConversation = async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;
    const { limit = 50, before } = req.query;

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 100); // Max 100 messages per request

    // Build query
    const query = {
      teacher: teacherId,
      student: studentId
    };

    // If 'before' cursor provided, fetch messages older than that timestamp
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch messages in descending order (newest first)
    // Fetch limit + 1 to determine if more messages exist
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit + 1)
      .lean();

    // Determine if more messages exist
    const hasMore = messages.length > parsedLimit;
    
    // Remove the extra message used for hasMore check
    const resultMessages = hasMore ? messages.slice(0, parsedLimit) : messages;

    // Get oldest cursor for next pagination request
    const oldestCursor = resultMessages.length > 0 
      ? resultMessages[resultMessages.length - 1].createdAt.toISOString()
      : null;

    res.json({
      messages: resultMessages,
      hasMore,
      oldestCursor
    });
  } catch (err) {
    console.error('getConversation error:', err);
    res.status(500).json({ error: err.message });
  }
};


// -------------------- TEACHER CHAT LIST --------------------
// Get all students for a teacher, marking those with messages
export const getTeacherChats = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const chats = await Message.aggregate([
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId) } },

      {
        $group: {
          _id: "$student",
          lastMessage: { $last: "$content" },
          lastMessageTime: { $last: "$createdAt" },
          unreadCount: {
            $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] }
          }
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },

      { $unwind: "$student" },

      { $sort: { lastMessageTime: -1 } }
    ]);

    res.json(chats);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to load teacher chats" });
  }
};


// -------------------- STUDENT CHAT LIST --------------------
export const getStudentChats = async (req, res) => {
  try {
    const { studentId } = req.params;

    const chats = await Message.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },

      {
        $group: {
          _id: "$teacher",
          lastMessage: { $last: "$content" },
          lastMessageTime: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$read", false] }, { $eq: ["$sender", "teacher"] }] },
                1,
                0
              ]
            }
          }
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "teacher"
        }
      },

      { $unwind: "$teacher" },

      { $sort: { lastMessageTime: -1 } }
    ]);

    res.json(chats);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to load student chats" });
  }
};

// -------------------- MARK AS READ --------------------
export const markAsRead = async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;
    const { reader } = req.body;

    if (!["teacher", "student"].includes(reader)) {
      return res.status(400).json({ error: "Invalid reader role" });
    }

    const senderToMark = reader === "teacher" ? "student" : "teacher";

    await Message.updateMany(
      {
        teacher: teacherId,
        student: studentId,
        sender: senderToMark,
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeacherUnread = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const unread = await Message.aggregate([
      {
        $match: {
          teacher: new mongoose.Types.ObjectId(teacherId),
          sender: "student",
          read: false
        }
      },
      {
        $group: {
          _id: "$student",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(unread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentUnread = async (req, res) => {
  try {
    const { studentId } = req.params;

    const unread = await Message.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          sender: "teacher",
          read: false
        }
      },
      {
        $group: {
          _id: "$teacher",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(unread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- TEACHER ENROLLED STUDENTS (CHAT SIDEBAR) --------------------
// Returns only students who are enrolled in at least one course owned by the authenticated teacher.
// NOTE: Kept separate from /api/admin/users because that endpoint intentionally returns a formatted summary.
export const getTeacherEnrolledStudents = async (req, res) => {
  try {
    const teacherUserId = req.user?._id;
    if (!teacherUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const teacherCourses = await Course.find({ teacherId: teacherUserId })
      .select("_id title category")
      .lean();

    const teacherCourseIds = teacherCourses.map((c) => c._id);
    if (teacherCourseIds.length === 0) {
      return res.json([]);
    }

    const courseIdToMeta = new Map(
      teacherCourses.map((c) => [c._id.toString(), { title: c.title, category: c.category }])
    );
    const teacherCourseIdSet = new Set(teacherCourseIds.map((id) => id.toString()));

    const students = await User.find({
      role: "student",
      "studentData.enrolledCourses": { $in: teacherCourseIds },
    })
      .select("name email profileImage studentData.enrolledCourses")
      .lean();

    const result = (students || []).map((s) => {
      const enrolledIds = (s.studentData?.enrolledCourses || [])
        .map((id) => (typeof id === "string" ? id : id?.toString()))
        .filter(Boolean);

      const firstMatchId = enrolledIds.find((id) => teacherCourseIdSet.has(id));
      const meta = firstMatchId ? courseIdToMeta.get(firstMatchId) : null;

      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        avatar: s.profileImage,
        subject: meta?.category || meta?.title || "Student",
        matchedCourseId: firstMatchId || null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching teacher enrolled students:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};
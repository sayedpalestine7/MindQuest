import mongoose from "mongoose";
import Message from "../models/mongo/message.js";
import User from "../models//mongo/userModel.js";


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

// -------------------- GET CONVERSATION --------------------
export const getConversation = async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;

    const messages = await Message.find({
      teacher: teacherId,
      student: studentId
    })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
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

    await Message.updateMany(
      {
        teacher: teacherId,
        student: studentId,
        sender: "student",
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

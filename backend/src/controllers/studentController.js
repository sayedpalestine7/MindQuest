import User from "../models/mongo/userModel.js";
import Progress from "../models/mongo/progressModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
//http://localhost:5000/api/student/id/690e68ad573b0a98730c2dcd

export const getStudentByID = async (req, res) => {
  try {

    let student = await User.findById(req.params.id).lean();

    // Optional: ensure only students are fetched
    if (student.role !== "student") {
      return res.status(400).json({ message: "User is not a student" });
    }

    if (!student) return res.status(404).json({ message: "Student Not Found" });

    // profileImage is already stored as a string data URL (or undefined)
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

    // IMPORTANT: Handle profileImage even if it's empty string (to delete it)
    if (profileImage !== undefined) {
      if (profileImage === "") {
        // Explicitly clear image in DB
        updateData.profileImage = null;
      } else {
        // Store the provided data URL string as-is
        updateData.profileImage = profileImage;
      }
    }

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

    // profileImage is already a string data URL or undefined
    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });

  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📚 Enroll student in a course
export const enrollCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Find the student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure studentData exists
    if (!student.studentData) {
      student.studentData = {};
    }

    // Ensure enrolledCourses is an array
    if (!Array.isArray(student.studentData.enrolledCourses)) {
      student.studentData.enrolledCourses = [];
    }

    // Check if already enrolled
    if (student.studentData.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Add course to enrolled courses
    student.studentData.enrolledCourses.push(courseId);
    await student.save();

    res.status(200).json({
      message: "Successfully enrolled in course",
      student,
    });
  } catch (err) {
    console.error("Error enrolling in course:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get enrolled courses for student
export const getEnrolledCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId)
      .populate({
        path: "studentData.enrolledCourses",
        model: "Course",
        populate: [
          {
            path: "teacherId",
            select: "name email profileImage",
          },
          {
            path: "lessonIds",
            select: "title fieldIds",
            populate: {
              path: "fieldIds",
            },
          },
          {
            path: "quizId",
            populate: {
              path: "questionIds",
            },
          },
        ],
      });

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure studentData exists
    if (!student.studentData) {
      student.studentData = {
        enrolledCourses: [],
        score: 0,
        finishedCourses: 0,
        courseProgress: []
      };
    }

    res.status(200).json({
      enrolledCourses: student.studentData.enrolledCourses || [],
    });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student's progress in a specific course
// Get student's progress in a specific course
export const getCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Find the student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure studentData exists
    if (!student.studentData) {
      student.studentData = {};
    }

    // Find progress for this specific course
    const courseProgress = student.studentData.courseProgress?.find(
      (cp) => cp.courseId?.toString() === courseId || cp.courseId === courseId
    );

    res.status(200).json({
      success: true,
      data: courseProgress || {
        completedLessons: [],
        currentLessonId: null,
        lastAccessed: null,
        quizCompleted: false,
        quizScore: 0,
      }
    });

  } catch (err) {
    console.error("Error fetching course progress:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// Update student's progress in a course
export const updateCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { completedLessons, currentLessonId } = req.body;

    // Find the student to check if they exist and get current progress
    const student = await User.findById(studentId);
    
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure studentData exists
    if (!student.studentData) {
      student.studentData = { courseProgress: [] };
      await student.save();
    }

    // Initialize courseProgress array if it doesn't exist
    if (!student.studentData.courseProgress) {
      student.studentData.courseProgress = [];
    }

    // Find existing progress for this course
    let courseProgressIndex = student.studentData.courseProgress.findIndex(
      (cp) => cp.courseId?.toString() === courseId || cp.courseId === courseId
    );

    // Build the update object
    let updateQuery;
    
    if (courseProgressIndex === -1) {
      // Create new entry
      updateQuery = {
        $push: {
          "studentData.courseProgress": {
            courseId: courseId,
            completedLessons: completedLessons || [],
            currentLessonId: currentLessonId || null,
            lastAccessed: new Date(),
            quizCompleted: false,
            quizScore: 0,
          }
        }
      };
    } else {
      // Update existing entry
      // Merge completed lessons
      const existingLessons = student.studentData.courseProgress[courseProgressIndex].completedLessons || [];
      const newLessons = completedLessons || [];
      const mergedLessons = Array.from(new Set([
        ...existingLessons.map(id => id.toString()),
        ...newLessons.map(id => id.toString())
      ])).map(id => new mongoose.Types.ObjectId(id));
      
      updateQuery = {
        $set: {
          "studentData.courseProgress": student.studentData.courseProgress.map((cp, idx) => {
            if (idx === courseProgressIndex) {
              return {
                ...cp.toObject ? cp.toObject() : cp,
                completedLessons: mergedLessons,
                currentLessonId: currentLessonId || cp.currentLessonId,
                lastAccessed: new Date()
              };
            }
            return cp.toObject ? cp.toObject() : cp;
          })
        }
      };
    }
    
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      updateQuery,
      { new: true, runValidators: true }
    );

    // Find the updated progress entry
    const updatedProgress = updatedStudent.studentData.courseProgress.find(
      cp => cp.courseId?.toString() === courseId
    );

    // 🔄 ALSO update/create the Progress collection document for consistency
    try {
      let progressDoc = await Progress.findOne({ studentId, courseId });
      
      if (!progressDoc) {
        progressDoc = await Progress.create({
          studentId,
          courseId,
          completedLessons: updatedProgress?.completedLessons || [],
          quizScore: updatedProgress?.quizScore || 0,
          totalScore: 0,
          status: "in-progress"
        });
      } else {
        progressDoc.completedLessons = updatedProgress?.completedLessons || [];
        progressDoc.quizScore = updatedProgress?.quizScore || 0;
        progressDoc.totalScore = updatedProgress?.quizScore || 0;
        if (updatedProgress?.quizCompleted) {
          progressDoc.status = "completed";
        }
        await progressDoc.save();
      }
    } catch (syncErr) {
      console.error("❌ Error syncing Progress collection:", syncErr.message);
    }

    res.status(200).json({
      success: true,
      data: updatedProgress
    });
  } catch (err) {
    console.error("❌ Error updating course progress:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// Reset student's progress in a course (clear all progress and set to initial state)
export const resetCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { firstLessonId } = req.body;

    // Find the student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure studentData exists
    if (!student.studentData) {
      student.studentData = { courseProgress: [] };
      await student.save();
    }

    // Initialize courseProgress array if it doesn't exist
    if (!student.studentData.courseProgress) {
      student.studentData.courseProgress = [];
    }

    // Find existing progress for this course
    const courseProgressIndex = student.studentData.courseProgress.findIndex(
      (cp) => cp.courseId?.toString() === courseId || cp.courseId === courseId
    );

    let updateQuery;
    
    if (courseProgressIndex === -1) {
      // Create new entry with reset state
      updateQuery = {
        $push: {
          "studentData.courseProgress": {
            courseId: courseId,
            completedLessons: [],
            currentLessonId: firstLessonId || null,
            lastAccessed: new Date(),
            quizCompleted: false,
            quizScore: 0,
          }
        }
      };
    } else {
      // Reset existing entry
      updateQuery = {
        $set: {
          "studentData.courseProgress": student.studentData.courseProgress.map((cp, idx) => {
            if (idx === courseProgressIndex) {
              return {
                ...cp.toObject ? cp.toObject() : cp,
                completedLessons: [],
                currentLessonId: firstLessonId || null,
                lastAccessed: new Date(),
                quizCompleted: false,
                quizScore: 0,
              };
            }
            return cp.toObject ? cp.toObject() : cp;
          })
        }
      };
    }
    
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      updateQuery,
      { new: true, runValidators: true }
    );

    // Find the updated progress entry
    const updatedProgress = updatedStudent.studentData.courseProgress.find(
      cp => cp.courseId?.toString() === courseId
    );

    // 🔄 ALSO reset the Progress collection document for consistency
    try {
      let progressDoc = await Progress.findOne({ studentId, courseId });
      
      if (!progressDoc) {
        progressDoc = await Progress.create({
          studentId,
          courseId,
          completedLessons: [],
          quizScore: 0,
          totalScore: 0,
          status: "in-progress"
        });
      } else {
        progressDoc.completedLessons = [];
        progressDoc.quizScore = 0;
        progressDoc.totalScore = 0;
        progressDoc.status = "in-progress";
        await progressDoc.save();
      }
    } catch (syncErr) {
      console.error("❌ Error syncing Progress collection:", syncErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Course progress reset successfully",
      data: updatedProgress
    });
  } catch (err) {
    console.error("❌ Error resetting course progress:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};
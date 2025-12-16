import User from "../models/mongo/userModel.js";
import bcrypt from "bcryptjs";
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

    res.status(200).json({
      enrolledCourses: student.studentData.enrolledCourses || [],
    });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update student's progress in a course
export const updateCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { completedLessons, currentLessonId } = req.body;

    // Find the student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure studentData exists
    if (!student.studentData) {
      student.studentData = {};
    }

    // Initialize progress tracking if it doesn't exist
    if (!student.studentData.courseProgress) {
      student.studentData.courseProgress = {};
    }

    // Initialize progress for this course if it doesn't exist
    if (!student.studentData.courseProgress[courseId]) {
      student.studentData.courseProgress[courseId] = {
        completedLessons: [],
        currentLessonId: null,
        lastAccessed: new Date()
      };
    }

    // Update completed lessons if provided
    if (completedLessons && Array.isArray(completedLessons)) {
      // Merge and deduplicate completed lessons
      const uniqueLessons = new Set([
        ...(student.studentData.courseProgress[courseId].completedLessons || []),
        ...completedLessons
      ]);
      student.studentData.courseProgress[courseId].completedLessons = Array.from(uniqueLessons);
    }

    // Update current lesson if provided
    if (currentLessonId) {
      student.studentData.courseProgress[courseId].currentLessonId = currentLessonId;
      student.studentData.courseProgress[courseId].lastAccessed = new Date();
    }

    // Save the updated student document
    await student.save();

    res.status(200).json({
      success: true,
      data: student.studentData.courseProgress[courseId]
    });

  } catch (err) {
    console.error("Error updating course progress:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};
import User from "../models/mongo/userModel.js";
import Progress from "../models/mongo/progressModel.js";
import Course from "../models/mongo/courseModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { createNotification } from "../services/notificationService.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//http://localhost:5000/api/student/id/690e68ad573b0a98730c2dcd

export const getStudentByID = async (req, res) => {
  try {

    let student = await User.findById(req.params.id).lean();

    // Optional: ensure only students are fetched
    if (student.role !== "student") {
      return res.status(400).json({ message: "User is not a student" });
    }

    if (!student) return res.status(404).json({ message: "Student Not Found" });

    // Ensure studentData exists
    if (!student.studentData) {
      student.studentData = {
        enrolledCourses: [],
        score: 0,
        finishedCourses: 0,
        courseProgress: [],
      };
    }

    // Recalculate points based on completed courses (10 points per completed course)
    // Use completedLessons vs total lessons to avoid relying on stale status
    const progressList = await Progress.find({ studentId: student._id }).select(
      "courseId completedLessons status"
    );

    const completionChecks = await Promise.all(
      progressList.map(async (p) => {
        if (!p.courseId) return false;
        const course = await Course.findById(p.courseId).select("lessonIds");
        const totalLessons = course?.lessonIds?.length || 0;
        const completedLessonsCount = p.completedLessons?.length || 0;
        return totalLessons > 0 && completedLessonsCount >= totalLessons;
      })
    );

    const completedCount = completionChecks.filter(Boolean).length;
    const calculatedScore = completedCount * 10;

    await User.updateOne(
      { _id: student._id },
      {
        $set: {
          "studentData.score": calculatedScore,
          "studentData.finishedCourses": completedCount,
        },
      }
    );

    // reflect in response
    student.studentData.score = calculatedScore;
    student.studentData.finishedCourses = completedCount;

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

    // Find the course and increment student count
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Add course to enrolled courses
    student.studentData.enrolledCourses.push(courseId);
    
    // Increment enrollment count (new field) and legacy students field
    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    course.students = (course.students || 0) + 1;
    
    await Promise.all([student.save(), course.save()]);
    
    // Send notification to student
    await createNotification({
      recipientId: studentId,
      type: "enrollment",
      title: "Enrollment Successful!",
      message: `You have successfully enrolled in "${course.title}".`,
      entityId: courseId,
      metadata: { courseName: course.title }
    });

    // Send notification to teacher
    if (course.teacherId) {
      const studentName = student.name || student.email || "A student";
      await createNotification({
        recipientId: course.teacherId,
        type: "enrollment",
        title: "New Enrollment!",
        message: `${studentName} enrolled in your course "${course.title}".`,
        entityId: courseId,
        metadata: { courseName: course.title, studentName }
      });
    }

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

    // Fetch progress data from Progress collection
    const progressData = await Progress.find({ studentId });
    
    // Create a map of courseId -> progress
    const progressMap = {};
    progressData.forEach(p => {
      const uniqueCompleted = new Set((p.completedLessons || []).map((id) => id.toString()));
      progressMap[p.courseId.toString()] = {
        completedLessons: Array.from(uniqueCompleted),
        completedLessonsCount: uniqueCompleted.size,
        quizScore: p.quizScore || 0,
        status: p.status || 'in-progress'
      };
    });

    // Enrich enrolled courses with progress data
    const enrichedCourses = (student.studentData.enrolledCourses || []).map(course => {
      const courseObj = course.toObject ? course.toObject() : course;
      const courseId = courseObj._id.toString();
      const progress = progressMap[courseId];
      
      const totalLessons = courseObj.lessonIds?.length || 0;
      const completedLessonsCount = Math.min(progress?.completedLessonsCount || 0, totalLessons);
      const progressPercent = totalLessons > 0 
        ? Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100)) 
        : 0;
      const status = completedLessonsCount >= totalLessons && totalLessons > 0
        ? 'completed'
        : (progress?.status || 'not-started');

      return {
        ...courseObj,
        completedLessons: completedLessonsCount,
        totalLessons: totalLessons,
        progress: progressPercent,
        status
      };
    });

    res.status(200).json({
      enrolledCourses: enrichedCourses,
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
      
      const course = await Course.findById(courseId).select("lessonIds");
      const totalLessons = course?.lessonIds?.length || 0;
      const uniqueCompleted = new Set((updatedProgress?.completedLessons || []).map((id) => id.toString()));
      const completedCount = Math.min(uniqueCompleted.size, totalLessons);
      const isCompleted = totalLessons > 0 && completedCount >= totalLessons;

      if (!progressDoc) {
        progressDoc = await Progress.create({
          studentId,
          courseId,
          completedLessons: Array.from(uniqueCompleted),
          quizScore: updatedProgress?.quizScore || 0,
          totalScore: 0,
          status: isCompleted ? "completed" : "in-progress"
        });
      } else {
        progressDoc.completedLessons = Array.from(uniqueCompleted);
        progressDoc.quizScore = updatedProgress?.quizScore || 0;
        progressDoc.totalScore = updatedProgress?.quizScore || 0;
        progressDoc.status = isCompleted ? "completed" : (updatedProgress?.quizCompleted ? "completed" : progressDoc.status);
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

// 📜 Generate Certificate for Completed Course
export const generateCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Find student and course
    const [student, course] = await Promise.all([
      User.findById(studentId),
      Course.findById(courseId).populate('teacherId', 'name')
    ]);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course is completed
    const progress = await Progress.findOne({ studentId, courseId });
    const totalLessons = course.lessonIds?.length || 0;
    const completedLessons = progress?.completedLessons?.length || 0;

    if (completedLessons < totalLessons || !progress?.quizScore) {
      return res.status(400).json({ 
        message: "Course not completed. Finish all lessons and pass the quiz first." 
      });
    }

    // Create PDF certificate
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${courseId}-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Certificate design
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Border
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
       .lineWidth(3)
       .strokeColor('#6366f1')
       .stroke();

    // Inner border
    doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
       .lineWidth(1)
       .strokeColor('#6366f1')
       .stroke();

    // Title
    doc.fontSize(48)
       .fillColor('#6366f1')
       .font('Helvetica-Bold')
       .text('Certificate of Completion', 0, 100, {
         align: 'center',
         width: pageWidth
       });

    // Subtitle
    doc.fontSize(16)
       .fillColor('#64748b')
       .font('Helvetica')
       .text('This certifies that', 0, 180, {
         align: 'center',
         width: pageWidth
       });

    // Student name
    doc.fontSize(36)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text(student.name || student.email, 0, 220, {
         align: 'center',
         width: pageWidth
       });

    // Course info
    doc.fontSize(16)
       .fillColor('#64748b')
       .font('Helvetica')
       .text('has successfully completed the course', 0, 280, {
         align: 'center',
         width: pageWidth
       });

    // Course title
    doc.fontSize(28)
       .fillColor('#6366f1')
       .font('Helvetica-Bold')
       .text(course.title, 0, 320, {
         align: 'center',
         width: pageWidth
       });

    // Score
    const scorePercentage = Math.round((progress.quizScore / (course.quizId?.questionIds?.length || 1)) * 100);
    doc.fontSize(18)
       .fillColor('#64748b')
       .font('Helvetica')
       .text(`Final Score: ${scorePercentage}%`, 0, 380, {
         align: 'center',
         width: pageWidth
       });

    // Date
    const completionDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.fontSize(14)
       .fillColor('#94a3b8')
       .text(`Completed on ${completionDate}`, 0, 420, {
         align: 'center',
         width: pageWidth
       });

    // Teacher signature section
    if (course.teacherId?.name) {
      doc.fontSize(14)
         .fillColor('#64748b')
         .font('Helvetica-Bold')
         .text(course.teacherId.name, 100, pageHeight - 120, {
           align: 'left'
         });
      
      doc.fontSize(12)
         .fillColor('#94a3b8')
         .font('Helvetica')
         .text('Instructor', 100, pageHeight - 100, {
           align: 'left'
         });

      // Signature line
      doc.moveTo(100, pageHeight - 130)
         .lineTo(250, pageHeight - 130)
         .strokeColor('#cbd5e1')
         .stroke();
    }

    // MindQuest logo/text
    doc.fontSize(14)
       .fillColor('#6366f1')
       .font('Helvetica-Bold')
       .text('MindQuest', pageWidth - 200, pageHeight - 120, {
         align: 'right',
         width: 150
       });

    doc.fontSize(12)
       .fillColor('#94a3b8')
       .font('Helvetica')
       .text('Interactive Learning Platform', pageWidth - 250, pageHeight - 100, {
         align: 'right',
         width: 200
       });

    // Certificate ID at bottom
    doc.fontSize(10)
       .fillColor('#cbd5e1')
       .text(`Certificate ID: ${courseId}-${studentId}-${Date.now()}`, 0, pageHeight - 50, {
         align: 'center',
         width: pageWidth
       });

    // Finalize PDF
    doc.end();

    // Log certificate generation
    console.log(`✅ Certificate generated for student ${studentId} - course ${courseId}`);

  } catch (err) {
    console.error("❌ Error generating certificate:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};

// 🏆 Get Student Achievements
export const getAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get student stats
    const enrolledCourses = student.studentData?.enrolledCourses || [];
    const progressData = await Progress.find({ studentId });
    
    // Calculate stats
    const completedCourses = progressData.filter(p => {
      const course = enrolledCourses.find(c => c.toString() === p.courseId.toString());
      return course && p.status === 'completed';
    }).length;

    const totalLessonsCompleted = progressData.reduce((sum, p) => 
      sum + (p.completedLessons?.length || 0), 0
    );

    const averageQuizScore = progressData.length > 0 
      ? progressData.reduce((sum, p) => sum + (p.quizScore || 0), 0) / progressData.length 
      : 0;

    const totalScore = student.studentData?.score || 0;

    // Define achievement criteria
    const achievements = [
      {
        id: 'first_course',
        title: 'First Steps',
        description: 'Complete your first course',
        icon: '🎓',
        unlocked: completedCourses >= 1,
        progress: Math.min(completedCourses, 1),
        total: 1
      },
      {
        id: 'course_master',
        title: 'Course Master',
        description: 'Complete 5 courses',
        icon: '📚',
        unlocked: completedCourses >= 5,
        progress: Math.min(completedCourses, 5),
        total: 5
      },
      {
        id: 'course_legend',
        title: 'Course Legend',
        description: 'Complete 10 courses',
        icon: '👑',
        unlocked: completedCourses >= 10,
        progress: Math.min(completedCourses, 10),
        total: 10
      },
      {
        id: 'lesson_learner',
        title: 'Lesson Learner',
        description: 'Complete 50 lessons',
        icon: '📖',
        unlocked: totalLessonsCompleted >= 50,
        progress: Math.min(totalLessonsCompleted, 50),
        total: 50
      },
      {
        id: 'lesson_expert',
        title: 'Lesson Expert',
        description: 'Complete 100 lessons',
        icon: '🎯',
        unlocked: totalLessonsCompleted >= 100,
        progress: Math.min(totalLessonsCompleted, 100),
        total: 100
      },
      {
        id: 'quiz_ace',
        title: 'Quiz Ace',
        description: 'Achieve 90%+ average on quizzes',
        icon: '⭐',
        unlocked: averageQuizScore >= 0.9,
        progress: averageQuizScore,
        total: 1
      },
      {
        id: 'perfect_score',
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '💯',
        unlocked: progressData.some(p => {
          const course = enrolledCourses.find(c => c.toString() === p.courseId.toString());
          return course && p.quizScore === 100;
        }),
        progress: progressData.some(p => p.quizScore === 100) ? 1 : 0,
        total: 1
      },
      {
        id: 'point_collector',
        title: 'Point Collector',
        description: 'Earn 100 points',
        icon: '💎',
        unlocked: totalScore >= 100,
        progress: Math.min(totalScore, 100),
        total: 100
      },
      {
        id: 'dedicated_learner',
        title: 'Dedicated Learner',
        description: 'Enroll in 5 courses',
        icon: '🚀',
        unlocked: enrolledCourses.length >= 5,
        progress: Math.min(enrolledCourses.length, 5),
        total: 5
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Join MindQuest',
        icon: '🐦',
        unlocked: true,
        progress: 1,
        total: 1
      }
    ];

    // Separate unlocked and locked achievements
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    res.status(200).json({
      success: true,
      data: {
        achievements: {
          unlocked,
          locked,
          all: achievements
        },
        stats: {
          totalAchievements: achievements.length,
          unlockedCount: unlocked.length,
          completionPercentage: Math.round((unlocked.length / achievements.length) * 100)
        }
      }
    });

  } catch (err) {
    console.error("❌ Error fetching achievements:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};

// 📊 Get Recent Activity for Student
export const getRecentActivity = async (req, res) => {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all progress records with course details
    const progressData = await Progress.find({ studentId })
      .populate('courseId', 'title thumbnail')
      .sort({ updatedAt: -1 })
      .limit(limit);

    // Build activity timeline
    const activities = [];

    for (const progress of progressData) {
      if (!progress.courseId) continue;

      // Course enrollment activity
      activities.push({
        id: `enroll-${progress._id}`,
        type: 'enrollment',
        title: 'Enrolled in Course',
        description: progress.courseId.title,
        courseId: progress.courseId._id,
        courseName: progress.courseId.title,
        thumbnail: progress.courseId.thumbnail,
        timestamp: progress.createdAt,
        icon: '📚'
      });

      // Lesson completion activities
      if (progress.completedLessons && progress.completedLessons.length > 0) {
        activities.push({
          id: `lessons-${progress._id}`,
          type: 'lesson_complete',
          title: 'Completed Lessons',
          description: `${progress.completedLessons.length} lessons in ${progress.courseId.title}`,
          courseId: progress.courseId._id,
          courseName: progress.courseId.title,
          thumbnail: progress.courseId.thumbnail,
          count: progress.completedLessons.length,
          timestamp: progress.updatedAt,
          icon: '✅'
        });
      }

      // Quiz completion activity
      if (progress.quizScore > 0) {
        activities.push({
          id: `quiz-${progress._id}`,
          type: 'quiz_complete',
          title: 'Completed Quiz',
          description: `Scored ${progress.quizScore}% on ${progress.courseId.title}`,
          courseId: progress.courseId._id,
          courseName: progress.courseId.title,
          thumbnail: progress.courseId.thumbnail,
          score: progress.quizScore,
          timestamp: progress.updatedAt,
          icon: progress.quizScore >= 80 ? '🏆' : '📝'
        });
      }

      // Course completion activity
      if (progress.status === 'completed') {
        activities.push({
          id: `complete-${progress._id}`,
          type: 'course_complete',
          title: 'Course Completed!',
          description: progress.courseId.title,
          courseId: progress.courseId._id,
          courseName: progress.courseId.title,
          thumbnail: progress.courseId.thumbnail,
          timestamp: progress.updatedAt,
          icon: '🎓',
          points: 10
        });
      }
    }

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        activities: recentActivities,
        total: activities.length
      }
    });

  } catch (err) {
    console.error("❌ Error fetching recent activity:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};
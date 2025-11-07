import User from "../models/mongo/userModel.js";
//http://localhost:5000/api/student/id/690e68ad573b0a98730c2dcd

export const getStudentByID = async (req, res) => { 
  try {
    const userId = req.user.id;

    // Find user and check if student
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Student role required." });
    }

    // Get all enrollments for this student
    // const enrollments = await Enrollment.find({ studentId: userId })
    //   .populate({
    //     path: 'courseId',
    //     select: 'title description thumbnail totalLessons'
    //   })
    //   .sort({ lastAccessedAt: -1 });

    // // Transform enrollments into course data
    // const enrolledCourses = enrollments.map(enrollment => ({
    //   id: enrollment.courseId._id,
    //   title: enrollment.courseId.title,
    //   thumbnail: enrollment.courseId.thumbnail || "/placeholder-course.png",
    //   progress: enrollment.progress,
    //   totalLessons: enrollment.courseId.totalLessons,
    //   completedLessons: enrollment.completedLessons.length,
    //   enrolledAt: enrollment.enrolledAt,
    //   lastAccessed: enrollment.lastAccessedAt
    // }));

    // Calculate stats
    // const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const totalPoints = user.studentData?.totalPoints || 0;
    // const overallProgress = enrollments.length > 0
    //   ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    //   : 0;

    // -----------------------------------------------
    // Prepare response
    const profileData = {
      name: user.name,
      email: user.email,
      avatar: user.profileImage || "/default-avatar.png",
      role: user.role,
      stats: {
        // totalCourses: enrollments.length,
        // completedCourses,
        totalPoints,
        // overallProgress,
      },
    //   enrolledCourses,
    //   achievements: user.studentData?.achievements || [],
    //   recentActivity: user.studentData?.recentActivity || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching student profile", 
      error: error.message 
    });
  }
};

// 🔹 Update Student Profile
export const putStudentByID = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, profileImage } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Student role required." });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating profile", 
      error: error.message 
    });
  }
};
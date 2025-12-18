import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/mongo/userModel.js";
import { Teacher } from "../models/mongo/teacherSchema.js";
import { OAuth2Client } from "google-auth-library";

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔹 Register
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "teacher",
      specialization,
      institution
    } = req.body;

    // TEMP: inspect uploaded files from Multer
    console.log("[registerUser] req.file:", req.file);
    console.log("[registerUser] req.files:", req.files);

    // Normalize any uploaded image into a base64 data URL string
    let profileImageDataUrl;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      profileImageDataUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.files?.profileImage && req.files.profileImage[0]) {
      const f = req.files.profileImage[0];
      const base64 = f.buffer.toString("base64");
      profileImageDataUrl = `data:${f.mimetype};base64,${base64}`;
    }

    // Normalize uploaded teacher certification into base64 data URL (for teacher signup)
    let certificationDataUrl;
    if (req.files?.certification && req.files.certification[0]) {
      const c = req.files.certification[0];
      const base64 = c.buffer.toString("base64");
      certificationDataUrl = `data:${c.mimetype};base64,${base64}`;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    // If a teacher with this email was previously rejected, allow re-signup by updating
    if (existingUser && existingUser.role === "teacher" && existingUser.status === "rejected") {
      const hashedPassword = await bcrypt.hash(password, 10);

      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.profileImage = profileImageDataUrl || existingUser.profileImage;
      existingUser.status = "pending";

      if (!existingUser.teacherData) {
        existingUser.teacherData = {};
      }

      existingUser.teacherData.specialization = specialization;
      existingUser.teacherData.institution = institution;
      existingUser.teacherData.certification = certificationDataUrl || existingUser.teacherData.certification;
      // Clear old rejection reason on new application
      existingUser.teacherData.rejectionReason = undefined;

      const user = await existingUser.save();

      // Also update Teacher profile if it exists
      let teacher = await Teacher.findOne({ userId: user._id });
      if (teacher) {
        teacher.name = name;
        teacher.email = email;
        teacher.specialization = specialization;
        teacher.avatar = profileImageDataUrl || teacher.avatar;
        await teacher.save();
      } else if (role === "teacher") {
        teacher = await Teacher.create({
          userId: user._id,
          name,
          email,
          specialization,
          avatar: profileImageDataUrl,
        });
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        message: "Application resubmitted. Awaiting admin approval.",
        user: userResponse,
        teacher,
      });
    }

    // If any other user with this email exists, block registration
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User + pending status for teachers
    const userPayload = {
      name,
      email,
      password: hashedPassword,
      profileImage: profileImageDataUrl,
      role,
      status: role === "teacher" ? "pending" : "active",
    };

    // For teachers, also populate teacherData on the User
    if (role === "teacher") {
      userPayload.teacherData = {
        specialization,
        institution,
        certification: certificationDataUrl,
      };
    }

    const user = await User.create(userPayload);

    // Create teacher profile if needed
    let teacher = null;
    if (role === "teacher") {
      teacher = await Teacher.create({
        userId: user._id,
        name,
        email,
        specialization,
        avatar: profileImageDataUrl,
      });
    }

    // Remove password before sending
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Account created successfully. Awaiting admin approval.",
      user: userResponse,
      teacher,
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering teacher", error: error.message });
  }
};


// 🔹 Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // ❌ Block non-active accounts
    if (user.role === "teacher" && user.status === "pending") {
      return res.status(403).json({
        message: "Your account is pending approval from the admin.",
      });
    }

    if (user.role === "teacher" && user.status === "rejected") {
      const reason = user.teacherData?.rejectionReason;
      return res.status(403).json({
        message: reason
          ? `Your application was rejected by the admin. Reason: ${reason}`
          : "Your application was rejected by the admin.",
      });
    }

    if (user.status === "banned") {
      return res.status(403).json({
        message: "Your account is banned by the admin.",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 Get profile (for dashboard)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};            


export const googleAuth = async (req, res) => {
  try {
    const { token: googleToken, mode } = req.body;

    if (!googleToken || !mode) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: token and mode are required' 
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, email_verified } = ticket.getPayload();

    if (!email_verified) {
      return res.status(400).json({ 
        success: false,
        message: 'Email not verified by Google' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // Handle signup
    if (mode === 'signup') {
      if (user) {
        return res.status(409).json({ 
          success: false,
          message: 'An account with this email already exists' 
        });
      }

      // Create new user with studentData
      user = new User({
        name,
        email,
        googleAuth: true,
        profileImage: picture,
        role: 'student',
        status: 'active',
        studentData: {
          score: 0,
          finishedCourses: 0,
          enrolledCourses: []
        }
      });

      await user.save();
      console.log('New user created via Google:', user.email);
    } 
    // Handle signin
    else if (mode === 'signin') {
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'No account found with this email. Please sign up first.' 
        });
      }
      
      // Update user's profile image if it's not set
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.status(200).json({
      success: true,
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        googleAuth: user.googleAuth || false
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error authenticating with Google',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
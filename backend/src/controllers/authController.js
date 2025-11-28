import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/mongo/userModel.js";
import { Teacher } from "../models/mongo/teacherSchema.js";

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

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User + pending status for teachers
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: role === "teacher" ? "pending" : "active",
    });

    // Create teacher profile if needed
    let teacher = null;
    if (role === "teacher") {
      teacher = await Teacher.create({
        userId: user._id,
        name,
        email,
        specialization,
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

    // ❌ Block pending teacher
    if (user.role === "teacher" && user.status === "pending") {
      return res.status(403).json({
        message: "Your account is pending approval from the admin.",
      });
    }
    if (user.role === "teacher" && user.status === "banned") {
      return res.status(403).json({
        message: "Your account is banned approval from the admin.",
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

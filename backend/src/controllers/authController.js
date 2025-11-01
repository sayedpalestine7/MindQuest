import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/mongo/userModel.js";

// 🔹 Register
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "teacher", // default for teacher signup
      teacherData,
      studentData,
      institution,
      specialization,
    } = req.body;

    // Handle uploaded files
    const profileImage = req.files?.profileImage?.[0]?.filename;
    const certification = req.files?.certification?.[0]?.filename;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImage,
      role,
      teacherData: {
        institution,
        specialization,
        certification: certification
          ? `/uploads/${certification}`
          : undefined,
      },
      studentData,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Teacher registered successfully",
      user,
      token,
    });
  } catch (error) {
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

    const token = jwt.sign(
      { id: user._id, email: user.email },
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

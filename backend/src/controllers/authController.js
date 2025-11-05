import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/mongo/userModel.js";
import {Teacher} from "../models/mongo/teacherSchema.js";

// 🔹 Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "teacher", specialization, institution } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // If teacher, create Teacher document linked to user
    let teacher = null;
    if (role === "teacher") {
      teacher = await Teacher.create({
        userId: user._id,      // link to the user
        name,
        email,
        specialization,
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Teacher registered successfully",
      user: userResponse,
      teacher,
      token,
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

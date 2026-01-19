import jwt from "jsonwebtoken";
import User from "../models/mongo/userModel.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  console.log(`[requireRole] User role: ${req.user?.role}, Required roles: ${roles.join(', ')}`);
  
  // Bypass role check for admin users
  if (req.user.role === "admin") {
    console.log('[requireRole] Admin user detected - bypassing role check');
    return next();
  }
  
  if (!roles.includes(req.user.role)) {
    console.log('[requireRole] Access denied - role not in allowed list');
    return res.status(403).json({ message: "Access denied" });
  }
  
  console.log('[requireRole] Role check passed');
  next();
};

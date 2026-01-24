import express from "express";
import { uploadFile, getImage } from "../controllers/uploadController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Create a flexible multer instance that handles any field name
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif", ".pdf", ".html", ".htm"].includes(ext)) {
      return cb(new Error("Only image, PDF, or HTML files are allowed"));
    }
    cb(null, true);
  },
});

// Middleware to convert req.files to req.file for compatibility
const handleMulterAny = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    req.file = req.files[0];
  }
  next();
};

// Upload a file - accepts file in any field name
const uploadAny = uploadMiddleware.any();
router.post("/", (req, res, next) => {
  uploadAny(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    handleMulterAny(req, res, () => uploadFile(req, res, next));
  });
});

// Get image by ID from database
router.get("/:imageId", getImage);

export default router;

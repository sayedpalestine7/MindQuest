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
    if (![".jpg", ".jpeg", ".png", ".gif", ".pdf"].includes(ext)) {
      return cb(new Error("Only image or PDF files are allowed"));
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
router.post("/", uploadMiddleware.any(), handleMulterAny, uploadFile);

// Get image by ID from database
router.get("/:imageId", getImage);

export default router;

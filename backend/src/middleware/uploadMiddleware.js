import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const upload = multer({
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

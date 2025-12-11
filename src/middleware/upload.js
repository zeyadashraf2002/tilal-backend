// backend/src/middleware/upload.js - Fixed Cloudinary
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dms7inqwd",
  api_key: process.env.CLOUDINARY_API_KEY || "337142537941378",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "PR3IR1wd6uc0lVh_jU_t8GVVmKY",
});

// ✅ Memory storage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// ✅ Upload to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = "garden-ms") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1280, crop: "limit" },
          { quality: "auto:low" },
          { fetch_format: "webp" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ✅ Single file upload
export const uploadSingle = (fieldName, folder = "general") => [
  upload.single(fieldName),
  async (req, res, next) => {
    try {
      if (!req.file) return next();

      console.log("📤 Uploading to Cloudinary...");
      const result = await uploadToCloudinary(req.file.buffer, folder);

      req.file.cloudinaryUrl = result.secure_url;
      req.file.cloudinaryId = result.public_id;

      console.log("✅ Upload successful:", result.secure_url);
      next();
    } catch (error) {
      console.error("❌ Upload failed:", error);
      next(error);
    }
  },
];

// ✅ Multiple files upload
export const uploadMultiple = (fieldName, maxCount = 50, folder = "tasks") => [
  upload.array(fieldName, maxCount),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) return next();

      console.log(`📤 Uploading ${req.files.length} files to Cloudinary...`);

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, folder)
      );

      const results = await Promise.all(uploadPromises);

      req.files = results.map((result) => ({
        url: result.secure_url,
        cloudinaryId: result.public_id,
        width: result.width,
        height: result.height,
      }));

      console.log("✅ All files uploaded successfully");
      next();
    } catch (error) {
      console.error("❌ Upload failed:", error);
      next(error);
    }
  },
];

// ✅ Error handler
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 50 files",
      });
    }
  }

  if (err) {
    console.error("Upload error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

export default upload;

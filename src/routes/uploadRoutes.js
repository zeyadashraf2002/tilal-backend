import express from "express";
import { uploadSingle, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

/**
 * @route   POST /api/v1/uploads/single
 * @desc    Upload a single image (Cloudinary in production)
 * @access  Public
 */
router.post(
  "/single",
  uploadSingle("image", "uploads"), // "image" هو اسم الحقل في FormData
  (req, res) => {
    try {
      let imageUrl, publicId;

      // ✅ Cloudinary (Production)
      if (req.file?.cloudinaryUrl) {
        imageUrl = req.file.cloudinaryUrl;
        publicId = req.file.cloudinaryId; // ← أضفنا الـ public_id هنا
      }

      // ✅ Local (Development)
      else if (req.file?.filename) {
        imageUrl = `${req.protocol}://${req.get("host")}/uploads/temp/${req.file.filename}`;
      }

      // ❌ No file uploaded
      else {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      // ✅ Successful response
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        url: imageUrl,
        publicId: publicId || null, // ← دايمًا نرجّع المفتاح حتى لو فاضي
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading image",
      });
    }
  },
  handleUploadError
);

export default router;

// backend/src/routes/deleteImageRoutes.js
import express from "express";
import { deleteImage } from "../controllers/deleteImageController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// ✅ Protected route - Admin/Worker only
router.use(protect);

/**
 * @route   DELETE /api/v1/delete-image
 * @desc    Universal image deletion from Cloudinary and database
 * @access  Private (Admin/Worker)
 * @body    {
 *   cloudinaryId: string (required),
 *   resourceType: 'image' | 'video' (optional, default: 'image'),
 *   entityType: 'site' | 'section' | 'task' | 'feedback' (required),
 *   entityId: string (required),
 *   sectionId: string (optional, required if entityType='section'),
 *   imageId: string (required),
 *   imageType: 'before' | 'after' | 'reference' | 'cover' | 'feedback' (required)
 * }
 */
router.delete("/", deleteImage);

export default router;

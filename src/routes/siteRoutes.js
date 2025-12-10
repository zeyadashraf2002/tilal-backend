// backend/src/routes/siteRoutes.js
import express from 'express';
import {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  addSection,
  updateSection,
  deleteSection,
  deleteReferenceImage
} from '../controllers/siteController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// ✅ جميع الـ Routes محمية ومخصصة للـ Admin فقط
router.use(protect);
router.use(authorize('admin'));

// ========================================
// 🏢 Site Routes
// ========================================

/**
 * @route   GET /api/v1/sites
 * @desc    Get all sites (with filters: client, search, pagination)
 * @access  Private (Admin only)
 */
router.get('/', getAllSites);

/**
 * @route   GET /api/v1/sites/:id
 * @desc    Get single site by ID
 * @access  Private (Admin only)
 */
router.get('/:id', getSiteById);

/**
 * @route   POST /api/v1/sites
 * @desc    Create new site (with optional cover image upload)
 * @access  Private (Admin only)
 */
router.post(
  '/',
  uploadSingle('coverImage', 'sites'), // ✅ رفع صورة الغلاف على Cloudinary
  handleUploadError,
  createSite
);

/**
 * @route   PUT /api/v1/sites/:id
 * @desc    Update site (with optional cover image replacement)
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  uploadSingle('coverImage', 'sites'), // ✅ استبدال صورة الغلاف
  handleUploadError,
  updateSite
);

/**
 * @route   DELETE /api/v1/sites/:id
 * @desc    Delete site (including all images from Cloudinary)
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteSite);

// ========================================
// 📦 Section Routes
// ========================================

/**
 * @route   POST /api/v1/sites/:id/sections
 * @desc    Add new section to site (with optional reference images)
 * @access  Private (Admin only)
 */
router.post(
  '/:id/sections',
  uploadMultiple('referenceImages', 20, 'sites/sections'), // ✅ رفع حتى 20 صورة مرجعية
  handleUploadError,
  addSection
);

/**
 * @route   PUT /api/v1/sites/:id/sections/:sectionId
 * @desc    Update section (can add more reference images)
 * @access  Private (Admin only)
 */
router.put(
  '/:id/sections/:sectionId',
  uploadMultiple('referenceImages', 20, 'sites/sections'), // ✅ إضافة صور مرجعية جديدة
  handleUploadError,
  updateSection
);

/**
 * @route   DELETE /api/v1/sites/:id/sections/:sectionId
 * @desc    Delete section (including all its reference images)
 * @access  Private (Admin only)
 */
router.delete('/:id/sections/:sectionId', deleteSection);

/**
 * @route   DELETE /api/v1/sites/:id/sections/:sectionId/images/:imageId
 * @desc    Delete specific reference image from section
 * @access  Private (Admin only)
 */
router.delete('/:id/sections/:sectionId/images/:imageId', deleteReferenceImage);

export default router;
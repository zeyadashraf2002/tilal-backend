// backend/src/routes/plantRoutes.js - Fixed with Cloudinary
import express from 'express';
import {
  getPlants,
  getPlant,
  createPlant,
  updatePlant,
  deletePlant,
  getPlantCategories
} from '../controllers/plantController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getPlants);
router.get('/categories', getPlantCategories);
router.get('/:id', getPlant);

// Protected routes (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingle('plantImage', 'plants'), // ✅ تأكد من اسم الحقل 'plantImage'
  handleUploadError,
  createPlant
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingle('plantImage', 'plants'), // ✅ Cloudinary folder
  handleUploadError,
  updatePlant
);

router.delete('/:id', protect, authorize('admin'), deletePlant);

export default router;
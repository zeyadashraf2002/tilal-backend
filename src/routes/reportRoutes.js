import express from 'express';
import {
  getDashboardStats,
  getWeeklyReport,
  getMonthlyReport,
  getWorkerPerformanceReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin only
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/weekly', protect, authorize('admin'), getWeeklyReport);
router.get('/monthly', protect, authorize('admin'), getMonthlyReport);
router.get('/workers', protect, authorize('admin'), getWorkerPerformanceReport);

export default router;


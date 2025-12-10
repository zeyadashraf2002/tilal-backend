import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.put('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, removeNotification);

export default router;


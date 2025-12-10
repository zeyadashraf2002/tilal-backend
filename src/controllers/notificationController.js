import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../services/notificationService.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const {
      unreadOnly = false,
      page = 1,
      limit = 20
    } = req.query;

    const result = await getUserNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      page: parseInt(page),
      limit: parseInt(limit)
    });

    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }

    res.status(200).json({
      success: true,
      count: result.notifications.length,
      total: result.count,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      data: result.notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const success = await markAsRead(req.params.id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const success = await markAllAsRead(req.user.id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read'
      });
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const removeNotification = async (req, res) => {
  try {
    const success = await deleteNotification(req.params.id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification
};


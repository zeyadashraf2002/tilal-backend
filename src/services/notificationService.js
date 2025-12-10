import Notification from '../models/Notification.js';
import {
  sendTaskAssignmentEmail,
  sendTaskCompletionEmail,
  sendLowStockAlert,
  sendInvoiceEmail,
  sendClientCredentials
} from './emailService.js';
import {
  sendTaskAssignmentWhatsApp,
  sendTaskCompletionWhatsApp,
  sendLowStockWhatsApp,
  sendInvoiceWhatsApp,
  sendClientCredentialsWhatsApp
} from './whatsappService.js';

/**
 * Create notification in database
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

/**
 * Send task assignment notification
 */
export const notifyTaskAssignment = async (worker, task, client) => {
  try {
    // Create in-app notification
    await createNotification({
      recipient: worker._id,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${task.title}`,
      relatedTask: task._id,
      priority: task.priority
    });

    // Send email
    await sendTaskAssignmentEmail(worker, task, client);

    // Send WhatsApp
    await sendTaskAssignmentWhatsApp(worker, task, client);

    return true;
  } catch (error) {
    console.error('Notify task assignment error:', error);
    return false;
  }
};

/**
 * Send task completion notification
 */
export const notifyTaskCompletion = async (client, task, worker) => {
  try {
    // Create in-app notification
    await createNotification({
      recipient: client._id,
      recipientModel: 'Client',
      type: 'task_completed',
      title: 'Task Completed',
      message: `Your task "${task.title}" has been completed`,
      relatedTask: task._id,
      priority: 'medium'
    });

    // Send email
    await sendTaskCompletionEmail(client, task, worker);

    // Send WhatsApp
    await sendTaskCompletionWhatsApp(client, task, worker);

    return true;
  } catch (error) {
    console.error('Notify task completion error:', error);
    return false;
  }
};

/**
 * Send low stock alert
 */
export const notifyLowStock = async (adminUser, item) => {
  try {
    // Create in-app notification
    await createNotification({
      recipient: adminUser._id,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${item.name} is running low (${item.quantity.current} ${item.unit} remaining)`,
      priority: 'high'
    });

    // Send email
    await sendLowStockAlert(adminUser.email, item);

    // Send WhatsApp
    if (adminUser.phone) {
      await sendLowStockWhatsApp(adminUser.phone, item);
    }

    return true;
  } catch (error) {
    console.error('Notify low stock error:', error);
    return false;
  }
};

/**
 * Send invoice notification
 */
export const notifyInvoice = async (client, invoice, pdfPath) => {
  try {
    // Create in-app notification
    await createNotification({
      recipient: client._id,
      recipientModel: 'Client',
      type: 'invoice_generated',
      title: 'Invoice Generated',
      message: `Invoice ${invoice.invoiceNumber} has been generated`,
      relatedInvoice: invoice._id,
      priority: 'medium'
    });

    // Send email with PDF
    await sendInvoiceEmail(client, invoice, pdfPath);

    // Send WhatsApp
    await sendInvoiceWhatsApp(client, invoice);

    return true;
  } catch (error) {
    console.error('Notify invoice error:', error);
    return false;
  }
};

/**
 * Send client credentials
 */
export const notifyClientCredentials = async (client, username, temporaryPassword) => {
  try {
    // Send email
    await sendClientCredentials(client, username, temporaryPassword);

    // Send WhatsApp
    await sendClientCredentialsWhatsApp(client, username, temporaryPassword);

    return true;
  } catch (error) {
    console.error('Notify client credentials error:', error);
    return false;
  }
};

/**
 * Send payment reminder
 */
export const notifyPaymentReminder = async (client, invoice) => {
  try {
    // Create in-app notification
    await createNotification({
      recipient: client._id,
      recipientModel: 'Client',
      type: 'payment_reminder',
      title: 'Payment Reminder',
      message: `Payment for invoice ${invoice.invoiceNumber} is due`,
      relatedInvoice: invoice._id,
      priority: 'high'
    });

    return true;
  } catch (error) {
    console.error('Notify payment reminder error:', error);
    return false;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    const {
      unreadOnly = false,
      limit = 20,
      page = 1
    } = options;

    const query = { recipient: userId };
    
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const count = await Notification.countDocuments(query);

    return {
      notifications,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    return null;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    await Notification.findByIdAndUpdate(notificationId, {
      isRead: true,
      readAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Mark as read error:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return true;
  } catch (error) {
    console.error('Mark all as read error:', error);
    return false;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    await Notification.findByIdAndDelete(notificationId);
    return true;
  } catch (error) {
    console.error('Delete notification error:', error);
    return false;
  }
};

export default {
  notifyTaskAssignment,
  notifyTaskCompletion,
  notifyLowStock,
  notifyInvoice,
  notifyClientCredentials,
  notifyPaymentReminder,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};


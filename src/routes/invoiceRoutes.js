import express from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/', protect, authorize('admin'), getInvoices);
router.get('/:id', protect, getInvoice);

// Admin only routes
router.post('/', protect, authorize('admin'), createInvoice);
router.put('/:id', protect, authorize('admin'), updateInvoice);
router.delete('/:id', protect, authorize('admin'), deleteInvoice);
router.put('/:id/payment-status', protect, authorize('admin'), updatePaymentStatus);

export default router;


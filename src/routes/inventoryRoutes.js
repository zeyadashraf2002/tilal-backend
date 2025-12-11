import express from 'express';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  withdrawInventory,
  restockInventory,
  getInventoryTransactions,
  getLowStockItems
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/', protect, getInventoryItems);
router.get('/:id', protect, getInventoryItem);
router.get('/:id/transactions', protect, getInventoryTransactions);

// Worker and Admin routes
router.post('/:id/withdraw', protect, authorize('admin', 'worker'), withdrawInventory);

// Admin only routes
router.post('/', protect, authorize('admin'), createInventoryItem);
router.put('/:id', protect, authorize('admin'), updateInventoryItem);
router.delete('/:id', protect, authorize('admin'), deleteInventoryItem);
router.post('/:id/restock', protect, authorize('admin'), restockInventory);
router.get('/low-stock', protect, authorize('admin'), getLowStockItems);

export default router;


import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getWorkers
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { createUserValidation, mongoIdValidation } from '../middleware/validator.js';

const router = express.Router();

router.use(protect);

router.get('/workers', getWorkers);

router
  .route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUserValidation, createUser);

router
  .route('/:id')
  .get(authorize('admin'), mongoIdValidation, getUser)
  .put(authorize('admin'), mongoIdValidation, updateUser)
  .delete(authorize('admin'), mongoIdValidation, deleteUser);

export default router;


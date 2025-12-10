import express from 'express';
import { login, getMe, logout, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { loginValidation } from '../middleware/validator.js';

const router = express.Router();

router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-password', protect, updatePassword);

export default router;


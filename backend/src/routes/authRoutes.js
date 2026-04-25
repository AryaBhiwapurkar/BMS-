import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/authMiddleware.js';
import { signup, login, refreshToken, logout } from '../controllers/authController.js';

router.post('/signup', signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;   
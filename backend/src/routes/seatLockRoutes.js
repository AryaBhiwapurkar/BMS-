import express from "express";
import * as seatLockController from "../controllers/seatLockController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /seats/lock - Lock seats with authentication
router.post("/lock", authMiddleware, seatLockController.lockSeats);

// POST /seats/unlock - Unlock seats with authentication
router.post("/unlock", authMiddleware, seatLockController.unlockSeats);

export default router;

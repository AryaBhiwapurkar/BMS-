import express from "express";
import * as paymentController from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/v1/payments/mock - Mock payment processing
router.post("/mock", authMiddleware, paymentController.mockPayment);

export default router;

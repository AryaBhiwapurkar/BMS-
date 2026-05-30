import express from "express";
import { bulkCreateSeats} from "../controllers/seatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/bulk", authMiddleware, adminMiddleware, bulkCreateSeats);

export default router;
import express from "express";
import { createShow, getShows } from "../controllers/showController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { getSeats } from "../controllers/seatController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createShow);
router.get("/", getShows);
router.get("/:id/seats", getSeats);


export default router;
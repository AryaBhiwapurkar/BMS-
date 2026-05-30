import express from 'express';
import { getMovies, getMovieById, createMovie } from '../controllers/movieController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getMovies );
router.get("/:id", getMovieById);
router.post("/", authMiddleware, adminMiddleware,  createMovie);

export default router;


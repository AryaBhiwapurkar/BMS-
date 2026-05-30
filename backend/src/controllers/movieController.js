import * as movieService from "../services/movieService.js";
import { validate as isUUID } from "uuid";


export const getMovies = async (req, res, next) => {
    try {
        const { page, limit } = req.query;

        const pageNum = Number(page);
        const limitNum = Number(limit);

        if (page !== undefined && (isNaN(pageNum) || pageNum < 1)) {
            return res.status(400).json({
                success: false,
                message: "Invalid page number",
            });
        }

        if (limit !== undefined && (isNaN(limitNum) || limitNum < 1)) {
            return res.status(400).json({
                success: false,
                message: "Invalid limit",
            });
        }

        const finalPage = page === undefined ? 1 : pageNum;
        const finalLimit = limit === undefined ? 10 : limitNum;

        const result = await movieService.getMovies({
            page: finalPage,
            limit: finalLimit,
        });

        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

export const getMovieById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie id",
            });
        }

        const movie = await movieService.getMovieById(id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: movie,
        });
    } catch (err) {
        next(err);
    }
};

export const createMovie = async (req, res, next) => {
    try {
        const {
            title,
            duration,
            language,
            genre,
            release_date,
            certification,
            description,
            poster_url,
        } = req.body;

        const errors = [];

        // 1. Title
        if (!title || title.trim().length === 0) {
            errors.push("Title is required");
        }

        // 2. Duration
        if (
            duration === undefined ||
            typeof duration !== "number" ||
            duration <= 0
        ) {
            errors.push("Duration must be a positive number");
        }

        // 3. Language
        if (!language || language.trim().length === 0) {
            errors.push("Language is required");
        }

        // 4. Release Date
        if (!release_date || isNaN(Date.parse(release_date))) {
            errors.push("Release date must be a valid date");
        }

        // 5. Certification
        const allowedCertifications = ["U", "U/A", "A"];
        if (
            certification &&
            !allowedCertifications.includes(certification)
        ) {
            errors.push("Certification must be one of U, U/A, A");
        }

        //  Return validation errors
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors,
            });
        }

        // Call service
        const movie = await movieService.createMovie({
            title: title.trim(),
            duration,
            language: language.trim(),
            genre,
            release_date,
            certification,
            description,
            poster_url,
        });

        return res.status(201).json({
            success: true,
            message: "Movie created successfully",
            data: movie,
        });

    } catch (err) {
        next(err);
    }
};
import { validate as isUUID } from "uuid";
import * as showService from "../services/showService.js";

export const createShow = async (req, res, next) => {
  try {
    const { movie_id, screen_id, show_time, pricing } = req.body;

    const errors = [];

    if (!movie_id || !isUUID(movie_id)) {
      errors.push("Valid movie_id required");
    }

    if (!screen_id || !isUUID(screen_id)) {
      errors.push("Valid screen_id required");
    }

    if (!show_time || isNaN(Date.parse(show_time))) {
      errors.push("Valid show_time required");
    }

    if (!pricing || typeof pricing !== "object") {
      errors.push("Valid pricing object required");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors,
      });
    }

    const show = await showService.createShow({
      movie_id,
      screen_id,
      show_time,
      pricing,
    });

    return res.status(201).json({
      success: true,
      message: "Show created successfully",
      data: show,
    });
  } catch (err) {
    next(err);
  }
};

export const getShows = async (req, res, next) => {
  try {
    const { movie_id, city } = req.query;

    const errors = [];

    if (!movie_id || !isUUID(movie_id)) {
      errors.push("Valid movie_id required");
    }

    if (!city || city.trim().length === 0) {
      errors.push("City is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors,
      });
    }

    const data = await showService.getShows({ movie_id, city });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
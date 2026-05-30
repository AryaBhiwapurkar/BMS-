import { validate as isUUID } from "uuid";
import * as seatService from "../services/seatService.js";
import * as showService from "../services/showService.js";

export const getSeats = async (req, res, next) => {
  try {
    const { id: show_id } = req.params;

    if (!show_id || !isUUID(show_id)) {
      return res.status(400).json({
        success: false,
        message: "Valid show_id is required",
      });
    }

    const data = await showService.getSeats(show_id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const bulkCreateSeats = async (req, res, next) => {
    try {
        const { screen_id, rows, seats_per_row } = req.body;

        const errors = [];

        if (!screen_id || !isUUID(screen_id)) {
            errors.push("Valid screen_id is required");
        }

        if (!Number.isInteger(rows) || rows <= 0) {
            errors.push("rows must be a positive integer");
        }

        if (!Number.isInteger(seats_per_row) || seats_per_row <= 0) {
            errors.push("seats_per_row must be a positive integer");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors,
            });
        }

        const result = await seatService.bulkCreateSeats({
            screen_id,
            rows,
            seats_per_row,
        });

        return res.status(201).json({
            success: true,
            message: "Seats created successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};
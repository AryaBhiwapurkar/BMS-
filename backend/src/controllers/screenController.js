import * as screenService from "../services/screenService.js";
import { validate as isUUID } from "uuid";
export const createScreen = async (req, res, next) => {
  try {
    const { theatre_id, name, capacity } = req.body;

    const errors = [];

    if (!theatre_id || !isUUID(theatre_id)) {
      errors.push("Theatre ID is required");
    }

    if (!name || name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (
      capacity === undefined ||
      typeof capacity !== "number" ||
      capacity <= 0
    ) {
      errors.push("Capacity must be a positive number");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors,
      });
    }

    const screen = await screenService.createScreen({
      theatre_id,
      name: name.trim(),
      capacity,
    });

    return res.status(201).json({
      success: true,
      message: "Screen created successfully",
      data: screen,
    });
  } catch (err) {
    next(err);
  }
};
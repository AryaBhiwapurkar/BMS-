import * as theatreService from "../services/theatreService.js";

export const createTheatre = async (req, res, next) => {
  try {
    const { name, city, address } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push("Name is required");
    }
    if (!city || city.trim().length === 0) {
      errors.push("City is required");
    }
    if (!address || address.trim().length === 0) {
      errors.push("Address is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors,
      });
    }

    const theatre = await theatreService.createTheatre({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Theatre created successfully",
      data: theatre,
    });
  } catch (err) {
    next(err);
  }
};
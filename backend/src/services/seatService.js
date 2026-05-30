import * as screenRepository from "../repositories/screenRepository.js";
import * as seatRepository from "../repositories/seatRepository.js";

export const bulkCreateSeats = async ({
  screen_id,
  rows,
  seats_per_row,
}) => {
  const screen = await screenRepository.getScreenById(screen_id);

  if (!screen) {
    throw new Error("Screen not found");
  }

  if (rows * seats_per_row !== screen.capacity) {
    throw new Error("Rows * seats_per_row must equal screen capacity");
  }

  const seats = [];

  for (let i = 0; i < rows; i++) {
    const rowLetter = String.fromCharCode(65 + i);

    for (let j = 1; j <= seats_per_row; j++) {
      const seatNumber = rowLetter + j;

      seats.push([
        screen_id,
        seatNumber,
        rowLetter,
        j,
        "silver",
      ]);
    }
  }

  return await seatRepository.bulkInsertSeats(seats);
};
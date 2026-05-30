import { pool } from "../config/database.js";


export const bulkInsertSeats = async (seats) => {
  const placeholders = seats
    .map((_, i) => {
      const base = i * 5;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    })
    .join(",");

  const values = seats.flat();

  const result = await pool.query(
    `
    INSERT INTO seats (screen_id, seat_number, row, seat_column, category)
    VALUES ${placeholders}
    RETURNING *
    `,
    values
  );

  return result.rows;
};

export const getSeatsByScreen = async (screen_id) => {
  const result = await pool.query(
    `
    SELECT * FROM seats
    WHERE screen_id = $1
    ORDER BY row, seat_column
    `,
    [screen_id]
  );
  return result.rows;
};
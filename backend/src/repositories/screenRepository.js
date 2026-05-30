import { pool } from "../config/database.js";

export const createScreen = async ({ theatre_id, name, capacity }) => {
  const result = await pool.query(
    `
    INSERT INTO screens (theatre_id, name, capacity)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [theatre_id, name, capacity]
  );

  return result.rows[0];
};

export const getScreenById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM screens WHERE id = $1",
    [id]
  );
  return result.rows[0];
};
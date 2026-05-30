import { pool } from "../config/database.js";

export const createTheatre = async ({ name, city, address }) => {
  const result = await pool.query(
    `
    INSERT INTO theatres (name, city, address)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [name, city, address]
  );

  return result.rows[0];
};

export const getTheatreById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM theatres WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const getTheatresByCity = async (city) => {
  const result = await pool.query(
    "SELECT * FROM theatres WHERE city = $1 ORDER BY name",
    [city]
  );
  return result.rows;
};
import { pool } from "../config/database.js";

export const getMovies = async (limit, offset) => {
  const result = await pool.query(
    `SELECT 
        id, title, duration, language, genre,
        release_date, certification, poster_url
     FROM movies
     ORDER BY release_date DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
};

export const getMoviesCount = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM movies`
  );

  return Number(result.rows[0].count);
};

export const getMovieById = async (id) => {
  const result = await pool.query(
    `SELECT 
        id, title, duration, language, genre,
        release_date, certification, description, poster_url
     FROM movies
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

export const createMovie = async ({
  title,
  duration,
  language,
  genre,
  release_date,
  certification,
  description,
  poster_url,
}) => {
  const result = await pool.query(
    `
    INSERT INTO movies 
    (title, duration, language, genre, release_date, certification, description, poster_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [
      title,
      duration,
      language,
      genre,
      release_date,
      certification,
      description,
      poster_url,
    ]
  );

  return result.rows[0];
};
import { pool } from "../config/database.js";

export const checkOverlap = async ({
  screen_id,
  startTime,
  endTime,
}) => {
  const result = await pool.query(
    `
    SELECT 1 FROM shows
    WHERE screen_id = $1
    AND (
      show_time < $2
      AND end_time > $3
    )
    LIMIT 1
    `,
    [screen_id, endTime, startTime]
  );

  return result.rows.length > 0;
};

export const createShow = async ({
  movie_id,
  screen_id,
  show_time,
  end_time,
  pricing,
}) => {
  const result = await pool.query(
    `
    INSERT INTO shows (movie_id, screen_id, show_time, end_time, pricing)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [movie_id, screen_id, show_time, end_time, pricing]
  );

  return result.rows[0];
};

export const getShowsByMovieAndCity = async (movie_id, city) => {
  const result = await pool.query(
    `
    SELECT 
      s.id AS show_id,
      s.show_time,
      s.pricing,
      t.id AS theatre_id,
      t.name AS theatre_name
    FROM shows s
    JOIN movies m ON s.movie_id = m.id
    JOIN screens sc ON s.screen_id = sc.id
    JOIN theatres t ON sc.theatre_id = t.id
    WHERE s.movie_id = $1
    AND t.city = $2
    ORDER BY t.name, s.show_time
    `,
    [movie_id, city]
  );

  return result.rows;
};

export const getShowById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM shows WHERE id = $1",
    [id]
  );
  return result.rows[0];
};
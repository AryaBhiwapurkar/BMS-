import { pool } from "../config/database.js";

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",[email]
    );
    return result.rows[0];
};

export const createUser = async (email, password, role = "user") => {
    await pool.query(
        "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", [email, password, role]
    );
};

export const storeRefreshToken = async (userId, token) => {
    await pool.query(
        "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
        [userId, token]
    );
};

export const findRefreshToken = async (token) => {
    const result = await pool.query(
        "SELECT * FROM refresh_tokens WHERE token = $1",
        [token]
    );

    return result.rows[0];
};

export const deleteRefreshToken = async (token) => {
    await pool.query(
        "DELETE FROM refresh_tokens WHERE token = $1",
        [token]
    );
};
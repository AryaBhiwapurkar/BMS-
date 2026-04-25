import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movie_booking_db',
    password: 'postgres',
    port: 5432,
});
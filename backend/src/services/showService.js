import * as showRepository from "../repositories/showRepository.js";
import * as movieRepository from "../repositories/movieRepository.js";
import * as screenRepository from "../repositories/screenRepository.js";
import * as seatRepository from "../repositories/seatRepository.js";
import * as bookingRepository from "../repositories/bookingRepository.js";
import * as cacheService from "./cacheService.js";

const SHOW_SEATS_CACHE_TTL = 30; // 30 seconds

export const createShow = async ({
    movie_id,
    screen_id,
    show_time,
    pricing,
}) => {
    // 1. fetch movie
    const movie = await movieRepository.getMovieById(movie_id);
    if (!movie) throw new Error("Movie not found");

    // 2. fetch screen
    const screen = await screenRepository.getScreenById(screen_id);
    if (!screen) throw new Error("Screen not found");

    const startTime = new Date(show_time);

    // 3. compute end_time
    const endTime = new Date(
        startTime.getTime() + movie.duration * 60000
    );

    // 4. check overlap
    const overlap = await showRepository.checkOverlap({
        screen_id,
        startTime,
        endTime,
    });

    if (overlap) {
        const error = new Error("Show time overlaps with existing show");
        error.statusCode = 400;
        throw error;
    }

    // 5. insert
    return await showRepository.createShow({
        movie_id,
        screen_id,
        show_time: startTime,
        end_time: endTime,
        pricing,
    });
};

export const getShows = async ({ movie_id, city }) => {
    // 1. check movie exists
    const movie = await movieRepository.getMovieById(movie_id);
    if (!movie) {
        const err = new Error("Movie not found");
        err.statusCode = 404;
        throw err;
    }

    // 2. fetch flat rows
    const rows = await showRepository.getShowsByMovieAndCity(
        movie_id,
        city
    );

    // 3. group by theatre
    const grouped = {};

    rows.forEach((row) => {
        if (!grouped[row.theatre_id]) {
            grouped[row.theatre_id] = {
                theatre_id: row.theatre_id,
                theatre_name: row.theatre_name,
                shows: [],
            };
        }

        grouped[row.theatre_id].shows.push({
            show_id: row.show_id,
            show_time: row.show_time,
            pricing: row.pricing,
        });
    });

    return Object.values(grouped);
};

export const getSeats = async (show_id) => {
    const cacheKey = `show_seats:${show_id}`;

    // Try to get from cache
    const cachedSeats = await cacheService.getCache(cacheKey);
    if (cachedSeats) {
        return cachedSeats;
    }

    // 1. fetch show
    const show = await showRepository.getShowById(show_id);
    if (!show) {
        const err = new Error("Show not found");
        err.statusCode = 404;
        throw err;
    }

    const screen_id = show.screen_id;

    // 2. fetch all seats of screen
    const seats = await seatRepository.getSeatsByScreen(screen_id);

    // 3. fetch booked seats
    const booked = await bookingRepository.getBookedSeatIds(show_id);

    const bookedSet = new Set(booked.map((b) => b.seat_id));

    // 4. group by row
    const grouped = {};

    seats.forEach((seat) => {
        if (!grouped[seat.row]) {
            grouped[seat.row] = {
                row: seat.row,
                seats: [],
            };
        }

        grouped[seat.row].seats.push({
            seat_id: seat.id,
            seat_number: seat.seat_number,
            column: seat.seat_column,
            status: bookedSet.has(seat.id) ? "booked" : "available",
        });
    });

    const result = {
        rows: Object.values(grouped),
    };

    // Set cache
    await cacheService.setCache(cacheKey, result, SHOW_SEATS_CACHE_TTL);

    return result;
};


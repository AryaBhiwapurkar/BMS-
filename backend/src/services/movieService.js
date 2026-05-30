import * as movieRepository from "../repositories/movieRepository.js";
import * as cacheService from "./cacheService.js";

const MAX_LIMIT = 50;
const MOVIES_CACHE_TTL = 600; // 10 minutes

export const getMovies = async ({ page, limit }) => {
  const finalLimit = Math.min(limit, MAX_LIMIT);
  const cacheKey = `movies:page:${page}:${finalLimit}`;

  // Try to get from cache
  const cachedData = await cacheService.getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const offset = (page - 1) * finalLimit;

  const movies = await movieRepository.getMovies(finalLimit, offset);

  const total = await movieRepository.getMoviesCount();

  const totalPages = Math.ceil(total / finalLimit);

  const result = {
    data: movies,
    meta: {
      page,
      limit: finalLimit,
      total,
      totalPages,
    },
  };

  // Set cache
  await cacheService.setCache(cacheKey, result, MOVIES_CACHE_TTL);

  return result;
};

export const getMovieById = async (id) => {
  const cacheKey = `movies:${id}`;

  // Try to get from cache
  const cachedMovie = await cacheService.getCache(cacheKey);
  if (cachedMovie) {
    return cachedMovie;
  }

  const movie = await movieRepository.getMovieById(id);

  // Set cache
  if (movie) {
    await cacheService.setCache(cacheKey, movie, MOVIES_CACHE_TTL);
  }

  return movie;
};

export const createMovie = async (movieData) => {
  const movie = await movieRepository.createMovie(movieData);

  // Invalidate all movies list cache
  await cacheService.deleteCacheByPattern("movies:page:*");

  return movie;
}

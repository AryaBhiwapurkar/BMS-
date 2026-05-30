import * as theatreRepository from "../repositories/theatreRepository.js";
import * as cacheService from "./cacheService.js";

const THEATRES_CACHE_TTL = 1800; // 30 minutes

export const createTheatre = async (data) => {
  const theatre = await theatreRepository.createTheatre(data);
  
  // Invalidate theatre cache for this city
  if (data.city) {
    await cacheService.deleteCache(`theatres:city:${data.city}`);
  }
  
  return theatre;
};

export const getTheatresByCity = async (city) => {
  const cacheKey = `theatres:city:${city}`;

  // Try to get from cache
  const cachedTheatres = await cacheService.getCache(cacheKey);
  if (cachedTheatres) {
    return cachedTheatres;
  }

  const theatres = await theatreRepository.getTheatresByCity(city);

  // Set cache
  await cacheService.setCache(cacheKey, theatres, THEATRES_CACHE_TTL);

  return theatres;
};
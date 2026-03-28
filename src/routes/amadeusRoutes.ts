import express from 'express';
import { getAirportCitySearch, getFlightAvailabilities, getHotelRatings, getAirportCityById } from '../controllers/amadeusController';

const router = express.Router();

// Route for Airport & City Search
router.get('/airport-city-search', getAirportCitySearch);

// Route for Flight Availabilities Search
router.post('/flight-availabilities', getFlightAvailabilities);

// Route for Hotel Ratings
router.get('/hotel-ratings', getHotelRatings);

// Route for getting Airport or City by ID
router.get('/airport-city/:locationId', getAirportCityById);

export default router;
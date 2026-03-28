// ============================================
// RUTAS AMADEUS EXTENDIDAS
// ============================================

import { Router, Request, Response } from 'express';
import {
  searchFlightDestinations,
  searchFlightDates,
  searchAirportsAndCities,
  searchPointsOfInterest,
  searchActivities,
  getActivityDetails,
  searchHotelsByCity,
  searchHotelsByGeocode,
  searchHotelNameAutocomplete,
  searchHotelsByIds,
  getHotelRatings,
  getHotelOfferDetails,
  getFlightStatus,
  predictTripPurpose,
  searchCities,
  priceFlightOffer,
  getAirlineDestinations,
  getAirlines,
  getCheckinLinks,
  getAirportRoutes,
  searchHotelOffersByIds,
  getRecommendedDestinations,
  getNearestAirports
} from '../services/amadeus-extended.js';

const router = Router();

// ============================================
// FLIGHT DESTINATIONS
// ============================================

// GET /api/v1/airports/routes?departureAirportCode=ORY&max=10&arrivalCountryCode=FR
router.get('/airports/routes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { departureAirportCode, max, arrivalCountryCode } = req.query;

    if (!departureAirportCode) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: departureAirportCode' }
      });
      return;
    }

    const result = await getAirportRoutes({
      departureAirportCode: departureAirportCode as string,
      maxResults: max ? parseInt(max as string) : undefined,
      arrivalCountryCode: arrivalCountryCode as string
    });

    res.json({
      success: result.success,
      data: result.data || [],
      error: result.error
    });
  } catch (error) {
    console.error('Error en rutas de aeropuerto:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/flights/checkin?airlineCode=BA&language=es
router.get('/flights/checkin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { airlineCode, language } = req.query;

    if (!airlineCode) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: airlineCode' }
      });
      return;
    }

    const result = await getCheckinLinks({
      airlineCode: airlineCode as string,
      language: language as string
    });

    res.json({
      success: result.success,
      data: result.data || [],
      error: result.error
    });
  } catch (error) {
    console.error('Error en check-in links:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/airlines?codes=BA,AF
router.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  try {
    const { codes } = req.query;

    if (!codes) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: codes' }
      });
      return;
    }

    const result = await getAirlines(codes as string);

    res.json({
      success: result.success,
      data: result.data || [],
      error: result.error
    });
  } catch (error) {
    console.error('Error buscando aerolineas:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/airlines/destinations?airlineCode=BA&maxResults=10&arrivalCountryCode=FR
router.get('/airlines/destinations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { airlineCode, max, arrivalCountryCode } = req.query;

    if (!airlineCode) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: airlineCode' }
      });
      return;
    }

    const result = await getAirlineDestinations({
      airlineCode: airlineCode as string,
      maxResults: max ? parseInt(max as string) : undefined,
      arrivalCountryCode: arrivalCountryCode as string
    });

    res.json({
      success: result.success,
      data: result.data || [],
      error: result.error
    });
  } catch (error) {
    console.error('Error en destinos de aerolinea:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/flights/destinations?origin=MAD&maxPrice=500
router.get('/flights/destinations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, maxPrice, maxResults } = req.query;

    if (!origin) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: origin' }
      });
      return;
    }

    const result = await searchFlightDestinations({
      origin: origin as string,
      maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
      maxResults: maxResults ? parseInt(maxResults as string) : undefined
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en destinos:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/flights/dates?origin=MAD&destination=BCN
router.get('/flights/dates', async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetros requeridos: origin, destination' }
      });
      return;
    }

    const result = await searchFlightDates({
      origin: origin as string,
      destination: destination as string
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en fechas:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// POST /api/v1/flights/price - Confirmar precio de vuelo
router.post('/flights/price', async (req: Request, res: Response): Promise<void> => {
  try {
    const { flightOffers, travelers, include, forceClass } = req.body;

    if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_DATA', message: 'Se requiere flightOffers array' }
      });
      return;
    }

    const result = await priceFlightOffer(
      {
        type: 'flight-offers-pricing',
        flightOffers,
        travelers
      },
      {
        include,
        forceClass
      }
    );

    res.json({
      success: result.success,
      data: result.data || null,
      error: result.error
    });
  } catch (error) {
    console.error('Error priceando vuelo:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/flights/status?carrierCode=IB&flightNumber=319&date=2026-03-20
router.get('/flights/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { carrierCode, flightNumber, date } = req.query;

    if (!carrierCode || !flightNumber || !date) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetros requeridos: carrierCode, flightNumber, date' }
      });
      return;
    }

    const result = await getFlightStatus({
      carrierCode: carrierCode as string,
      flightNumber: flightNumber as string,
      scheduledDepartureDate: date as string
    });

    res.json({
      success: result.success,
      data: result.data || null,
      error: result.error
    });
  } catch (error) {
    console.error('Error en estado de vuelo:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// ============================================
// LOCATIONS & AIRPORTS
// ============================================

// GET /api/v1/cities?keyword=PAR&countryCode=FR&includeAirports=true
router.get('/cities', async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, countryCode, max, includeAirports } = req.query;

    if (!keyword) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: keyword' }
      });
      return;
    }

    const result = await searchCities({
      keyword: keyword as string,
      countryCode: countryCode as string,
      maxResults: max ? parseInt(max as string) : undefined,
      includeAirports: includeAirports === 'true'
    });

    res.json({
      success: true,
      data: result.data || null,
      error: result.error
    });
  } catch (error) {
    console.error('Error en búsqueda de ciudades:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/locations/search?keyword=MAD&type=AIRPORT
router.get('/locations/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, type, countryCode } = req.query;

    if (!keyword) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: keyword' }
      });
      return;
    }

    const result = await searchAirportsAndCities({
      keyword: keyword as string,
      type: type as any,
      countryCode: countryCode as string
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en búsqueda de ubicaciones:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// ============================================
// POINTS OF INTEREST
// ============================================

// GET /api/v1/poi?lat=41.397&lng=2.177&radius=5
router.get('/poi', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, category } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetros requeridos: lat, lng' }
      });
      return;
    }

    const result = await searchPointsOfInterest({
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lng as string),
      radius: radius ? parseInt(radius as string) : undefined,
      category: category as string
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en POI:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// ============================================
// ACTIVITIES & TOURS
// ============================================

// GET /api/v1/activities?lat=41.397&lng=2.177&radius=10
router.get('/activities', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, language } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetros requeridos: lat, lng' }
      });
      return;
    }

    const result = await searchActivities({
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lng as string),
      radius: radius ? parseInt(radius as string) : undefined,
      language: language as string
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en actividades:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/activities/:activityId
router.get('/activities/:activityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;

    if (!activityId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: activityId' }
      });
      return;
    }

    const result = await getActivityDetails(activityId);

    res.json({
      success: result.success,
      data: result.data || null,
      error: result.error
    });
  } catch (error) {
    console.error('Error en actividad:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// ============================================
// HOTELS EXTENDED
// ============================================

// GET /api/v1/hotels/autocomplete?keyword=PARIS&subType=HOTEL_LEISURE&max=10
router.get('/hotels/autocomplete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, subType, countryCode, language, max } = req.query;

    if (!keyword) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: keyword' }
      });
      return;
    }

    if (!subType) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: subType (HOTEL_LEISURE o HOTEL_GDS)' }
      });
      return;
    }

    const result = await searchHotelNameAutocomplete({
      keyword: keyword as string,
      subType: (subType as string).split(',') as ('HOTEL_LEISURE' | 'HOTEL_GDS')[],
      countryCode: countryCode as string,
      language: language as string,
      max: max ? parseInt(max as string) : undefined
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en autocompletado de hoteles:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/hotels/ratings?hotelIds=TELONMFS,ADNYCCTB
router.get('/hotels/ratings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelIds } = req.query;

    if (!hotelIds) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: hotelIds (comma-separated)' }
      });
      return;
    }

    const ids = (hotelIds as string).split(',');
    
    if (ids.length > 3) {
      res.status(400).json({
        success: false,
        error: { code: 'MAX_HOTEL_IDS', message: 'Máximo 3 hotelIds permitidos' }
      });
      return;
    }

    const result = await getHotelRatings({
      hotelIds: ids
    });

    res.json({
      success: true,
      data: result.data || [],
      warnings: result.warnings || []
    });
  } catch (error) {
    console.error('Error en ratings de hoteles:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/hotels/by-ids?hotelIds=ACPAR419,ADPAR001
router.get('/hotels/by-ids', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelIds } = req.query;

    if (!hotelIds) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: hotelIds (comma-separated)' }
      });
      return;
    }

    const ids = (hotelIds as string).split(',');
    
    if (ids.length > 99) {
      res.status(400).json({
        success: false,
        error: { code: 'MAX_HOTEL_IDS', message: 'Máximo 99 hotelIds permitidos' }
      });
      return;
    }

    const result = await searchHotelsByIds({
      hotelIds: ids
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en hoteles por IDs:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/hotels/offers?hotelIds=ACPAR419,ADPAR001&adults=2&checkInDate=2024-12-01&checkOutDate=2024-12-05
router.get('/hotels/offers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      hotelIds, 
      adults, 
      checkInDate, 
      checkOutDate, 
      countryOfResidence,
      roomQuantity,
      priceRange,
      currency,
      paymentPolicy,
      boardType,
      includeClosed,
      bestRateOnly,
      language
    } = req.query;

    if (!hotelIds) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: hotelIds (comma-separated)' }
      });
      return;
    }

    const ids = (hotelIds as string).split(',');
    
    if (ids.length > 20) {
      res.status(400).json({
        success: false,
        error: { code: 'MAX_HOTEL_IDS', message: 'Máximo 20 hotelIds permitidos para ofertas' }
      });
      return;
    }

    const result = await searchHotelOffersByIds({
      hotelIds: ids,
      adults: adults ? parseInt(adults as string) : 2,
      checkInDate: checkInDate as string,
      checkOutDate: checkOutDate as string,
      countryOfResidence: countryOfResidence as string,
      roomQuantity: roomQuantity ? parseInt(roomQuantity as string) : undefined,
      priceRange: priceRange as string,
      currency: currency as string,
      paymentPolicy: paymentPolicy as any,
      boardType: boardType as any,
      includeClosed: includeClosed === 'true' ? true : includeClosed === 'false' ? false : undefined,
      bestRateOnly: bestRateOnly === 'true' ? true : bestRateOnly === 'false' ? false : undefined,
      language: language as string
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en ofertas de hoteles:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/hotels/by-city?cityCode=MAD&radius=10
router.get('/hotels/by-city', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cityCode, radius, radiusUnit, hotelSource } = req.query;

    if (!cityCode) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: cityCode' }
      });
      return;
    }

    const result = await searchHotelsByCity({
      cityCode: cityCode as string,
      radius: radius ? parseInt(radius as string) : undefined,
      radiusUnit: radiusUnit as any,
      hotelSource: hotelSource as any
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en hoteles por ciudad:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/hotels/by-geocode?lat=41.397&lng=2.177&radius=10
router.get('/hotels/by-geocode', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, radiusUnit } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetros requeridos: lat, lng' }
      });
      return;
    }

    const result = await searchHotelsByGeocode({
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lng as string),
      radius: radius ? parseInt(radius as string) : undefined,
      radiusUnit: radiusUnit as any
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en hoteles por geocode:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/hotels/offer/:offerId
router.get('/hotels/offer/:offerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;

    if (!offerId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: offerId' }
      });
      return;
    }

    const result = await getHotelOfferDetails(offerId);

    res.json({
      success: result.success,
      data: result.data || null,
      error: result.error
    });
  } catch (error) {
    console.error('Error en oferta de hotel:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// ============================================
// PREDICTIONS
// ============================================

// GET /api/v1/travel/prediction?origin=NYC&destination=MAD&departureDate=2026-04-01&returnDate=2026-04-08
router.get('/travel/prediction', async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, departureDate, returnDate } = req.query;

    if (!origin || !destination || !departureDate) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetros requeridos: origin, destination, departureDate' }
      });
      return;
    }

    const result = await predictTripPurpose({
      originLocationCode: origin as string,
      destinationLocationCode: destination as string,
      departureDate: departureDate as string,
      returnDate: returnDate as string
    });

    res.json({
      success: result.success,
      data: result.data || null,
      error: result.error
    });
  } catch (error) {
    console.error('Error en predicción:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/travel/recommended?cityCodes=PAR,MAD&travelerCountryCode=FR&destinationCountryCodes=ES,IT
router.get('/travel/recommended', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cityCodes, travelerCountryCode, destinationCountryCodes } = req.query;

    if (!cityCodes) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetro requerido: cityCodes (comma-separated)' }
      });
      return;
    }

    const result = await getRecommendedDestinations({
      cityCodes: cityCodes as string,
      travelerCountryCode: travelerCountryCode as string,
      destinationCountryCodes: destinationCountryCodes as string
    });

    res.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Error en destinos recomendados:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

// GET /api/v1/airports/nearest?lat=51.57&lng=-0.44&radius=100
router.get('/airports/nearest', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, sort, limit, offset } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Parámetros requeridos: lat, lng' }
      });
      return;
    }

    const result = await getNearestAirports({
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lng as string),
      radius: radius ? parseInt(radius as string) : undefined,
      sort: sort as any,
      pageLimit: limit ? parseInt(limit as string) : undefined,
      pageOffset: offset ? parseInt(offset as string) : undefined
    });

    res.json({
      success: result.success,
      data: result.data || [],
      error: result.error
    });
  } catch (error) {
    console.error('Error en aeropuertos cercanos:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: 'Error interno' }
    });
  }
});

export default router;

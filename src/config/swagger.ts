// ============================================
// CONFIGURACIÓN DE SWAGGER / OPENAPI
// ============================================

import { Request, Response, NextFunction } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import env from './env.js';

const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Travel Agency API',
      version: '1.0.0',
      description: `
## 🚀 Travel Agency Backend API

API RESTful para una agencia de viajes con las siguientes funcionalidades:

### Características Principales
- 🔍 **Búsqueda de Vuelos**: Integración con Amadeus para búsqueda de vuelos
- 🏨 **Búsqueda de Hoteles**: Búsqueda y reserva de hoteles
- 🚕 **Transferencias**: Servicio de transporte terrestre
- 📱 **Autenticación**: JWT con refresh tokens
- 💳 **Pagos**: Integración con Stripe
- 👨‍💼 **Panel de Administración**: Gestión de usuarios, reservas y estadísticas

### Autenticación
La API usa JWT (JSON Web Tokens) para autenticación.
Incluye un sistema de refresh tokens para mantener la sesión activa.

### Rate Limiting
- General: 100 solicitudes / 15 minutos
- Búsquedas: 30 solicitudes / 15 minutos
- Pagos: 10 solicitudes / 15 minutos
- Auth: 10 solicitudes / 15 minutos
      `,
      contact: {
        name: 'Soporte',
        email: 'soporte@travelagency.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint /api/v1/auth/login',
        },
        refreshToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-refresh-token',
          description: 'Token de refresco para obtener nuevos access tokens',
        },
      },
      schemas: {
        // ============================================
        // ESQUEMAS DE ERRORES
        // ============================================
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'ERROR_CODE' },
                message: { type: 'string', example: 'Mensaje de error' },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Error de validación' },
                details: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['email: Email inválido', 'password: Mínimo 8 caracteres'],
                },
              },
            },
          },
        },
        
        // ============================================
        // ESQUEMAS DE AUTH
        // ============================================
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', format: 'password', example: 'Password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' },
                expiresIn: { type: 'number', example: 3600 },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', format: 'password', example: 'Password123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            phone: { type: 'string', example: '+34612345678' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: ['user', 'admin', 'agent'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // ============================================
        // ESQUEMAS DE VUELOS
        // ============================================
        FlightSearchRequest: {
          type: 'object',
          required: ['origin', 'destination', 'departureDate', 'adults'],
          properties: {
            origin: { type: 'string', example: 'MAD', description: 'Código IATA de origen' },
            destination: { type: 'string', example: 'BCN', description: 'Código IATA de destino' },
            departureDate: { type: 'string', format: 'date', example: '2024-06-15' },
            returnDate: { type: 'string', format: 'date', example: '2024-06-20' },
            adults: { type: 'integer', minimum: 1, maximum: 9, example: 1 },
            children: { type: 'integer', minimum: 0, maximum: 9, example: 0 },
            infants: { type: 'integer', minimum: 0, maximum: 4, example: 0 },
            travelClass: { 
              type: 'string', 
              enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
              default: 'ECONOMY' 
            },
            currency: { type: 'string', default: 'EUR', example: 'EUR' },
          },
        },
        FlightOffer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            source: { type: 'string' },
            instantTicketingRequired: { type: 'boolean' },
            nonHomogeneous: { type: 'boolean' },
            oneWay: { type: 'boolean' },
            lastTicketingDate: { type: 'string', format: 'date' },
            numberOfBookableSeats: { type: 'integer' },
            itineraries: { type: 'array' },
            price: {
              type: 'object',
              properties: {
                currency: { type: 'string' },
                total: { type: 'string' },
                base: { type: 'string' },
              },
            },
          },
        },
        
        // ============================================
        // ESQUEMAS DE HOTELES
        // ============================================
        HotelSearchRequest: {
          type: 'object',
          required: ['city', 'checkIn', 'checkOut', 'rooms', 'adults'],
          properties: {
            city: { type: 'string', example: 'Barcelona' },
            checkIn: { type: 'string', format: 'date', example: '2024-06-15' },
            checkOut: { type: 'string', format: 'date', example: '2024-06-20' },
            rooms: { type: 'integer', minimum: 1, maximum: 5, example: 1 },
            adults: { type: 'integer', minimum: 1, maximum: 10, example: 2 },
            children: { type: 'integer', minimum: 0, default: 0, example: 0 },
            currency: { type: 'string', default: 'EUR' },
          },
        },
        HotelOffer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            chainCode: { type: 'string' },
            rating: { type: 'number' },
            description: { type: 'string' },
            amenities: { type: 'array', items: { type: 'string' } },
            price: {
              type: 'object',
              properties: {
                currency: { type: 'string' },
                total: { type: 'string' },
              },
            },
          },
        },
        
        // ============================================
        // ESQUEMAS DE RESERVAS
        // ============================================
        BookingRequest: {
          type: 'object',
          required: ['type', 'passengers', 'contact', 'acceptTerms'],
          properties: {
            type: { type: 'string', enum: ['flight', 'hotel', 'transfer', 'package'] },
            flightOfferId: { type: 'string' },
            hotelOfferId: { type: 'string' },
            transferOfferId: { type: 'string' },
            passengers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['adult', 'child', 'infant'] },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                  gender: { type: 'string', enum: ['M', 'F'] },
                  nationality: { type: 'string' },
                  documentType: { type: 'string', enum: ['PASSPORT', 'ID_CARD', 'VISA'] },
                  documentNumber: { type: 'string' },
                  documentExpiry: { type: 'string', format: 'date' },
                },
              },
            },
            contact: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                countryCode: { type: 'string' },
              },
            },
            emergencyContact: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                relationship: { type: 'string' },
              },
            },
            acceptTerms: { type: 'boolean' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['flight', 'hotel', 'transfer', 'package'] },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
            totalAmount: { type: 'number' },
            currency: { type: 'string' },
            passengers: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // ============================================
        // ESQUEMAS DE PAGO
        // ============================================
        CreatePaymentIntentRequest: {
          type: 'object',
          required: ['bookingId', 'amount'],
          properties: {
            bookingId: { type: 'string', format: 'uuid' },
            amount: { type: 'number', minimum: 1, maximum: 1000000 },
            currency: { type: 'string', default: 'EUR' },
            paymentMethod: { type: 'string', enum: ['card', 'bank_transfer'], default: 'card' },
            customerEmail: { type: 'string', format: 'email' },
          },
        },
        PaymentIntent: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            clientSecret: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string' },
          },
        },
        
        // ============================================
        // ESQUEMAS DE PAGINACIÓN
        // ============================================
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'No autorizado - Token inválido o expirado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' }
              }
            },
          },
        },
        Forbidden: {
          description: 'Prohibido - No tienes permisos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { code: 'FORBIDDEN', message: 'No tienes permisos para acceder a este recurso' }
              }
            },
          },
        },
        NotFound: {
          description: 'No encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { code: 'NOT_FOUND', message: 'Recurso no encontrado' }
              }
            },
          },
        },
        ValidationError: {
          description: 'Error de validación',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
              example: {
                success: false,
                error: { 
                  code: 'VALIDATION_ERROR', 
                  message: 'Error de validación',
                  details: ['email: Email inválido', 'password: Mínimo 8 caracteres']
                }
              }
            },
          },
        },
        RateLimitError: {
          description: 'Límite de solicitudes excedido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Has realizado demasiadas solicitudes. Por favor, espera un momento.' }
              }
            },
          },
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }
              }
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Endpoints de autenticación' },
      { name: 'Flights', description: 'Búsqueda y gestión de vuelos' },
      { name: 'Hotels', description: 'Búsqueda y gestión de hoteles' },
      { name: 'Transfers', description: 'Servicios de transporte' },
      { name: 'Bookings', description: 'Gestión de reservas' },
      { name: 'Payments', description: 'Procesamiento de pagos' },
      { name: 'Admin', description: 'Endpoints de administración' },
      { name: 'Airports', description: 'Información de aeropuertos' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

/**
 * Genera swagger.json dinámicamente
 */
export function getSwaggerSpec() {
  return swaggerSpec;
}

/**
 * Middleware para servir la documentación Swagger
 */
export function swaggerMiddleware(req: Request, res: Response, next: NextFunction) {
  // Servir swagger.json
  if (req.url === '/api-docs.json') {
    res.json(swaggerSpec);
    return;
  }
  next();
}

export default swaggerSpec;

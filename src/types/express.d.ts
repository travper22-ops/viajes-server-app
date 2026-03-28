// ============================================
// DECLARACIÓN DE TIPOS PARA MÓDULOS EXTRAS
// ============================================

/**
 * NODEMAILER TYPES
 */
declare module 'nodemailer' {
  interface TestAccount {
    user: string;
    pass: string;
    smtp: { host: string; port: number; secure: boolean };
    imap: { host: string; port: number; secure: boolean };
    pop3: { host: string; port: number; secure: boolean };
    web: string;
  }

  interface SendMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content?: Buffer | string;
      path?: string;
      contentType?: string;
    }>;
  }

  interface SentMessageInfo {
    messageId: string;
    accepted: string[];
    rejected: string[];
    pending: string[];
    response: string;
  }

  interface Transport {
    sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
    close(): void;
  }

  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  function createTransport(options: TransportOptions | string): Transport;
  function createTestAccount(callback: (err: Error | null, account: TestAccount) => void): void;
  function createTestAccount(): Promise<TestAccount>;
  function getTestMessageUrl(info: SentMessageInfo): string | false;

  export = {
    createTransport,
    createTestAccount,
    getTestMessageUrl
  };
}

/**
 * MORGAN TYPES
 */
declare module 'morgan' {
  import { Request, Response, NextFunction } from 'express';
  
  interface MorganOptions {
    buffer?: boolean;
    duration?: number;
    immediate?: boolean;
    skip?: (req: Request, res: Response) => boolean;
    stream?: { write: (message: string) => void };
  }

  function morgan(format: string | ((req: Request, res: Response) => string), options?: MorganOptions): (req: Request, res: Response, next: NextFunction) => void;
  
  export = morgan;
}

/**
 * HELMET TYPES
 */
declare module 'helmet' {
  import { Request, Response, NextFunction } from 'express';
  
  interface HelmetOptions {
    contentSecurityPolicy?: boolean | Record<string, unknown>;
    crossOriginEmbedderPolicy?: boolean | Record<string, unknown>;
    crossOriginOpenerPolicy?: boolean | Record<string, unknown>;
    crossOriginResourcePolicy?: boolean | Record<string, unknown>;
    dnsPrefetchControl?: boolean | Record<string, unknown>;
    expectCt?: boolean | Record<string, unknown>;
    featurePolicy?: boolean | Record<string, unknown>;
    frameguard?: boolean | Record<string, unknown>;
    hidePoweredBy?: boolean | Record<string, unknown>;
    hsts?: boolean | Record<string, unknown>;
    ieNoOpen?: boolean | Record<string, unknown>;
    noSniff?: boolean | Record<string, unknown>;
    originAgentCluster?: boolean | Record<string, unknown>;
    permittedCrossDomainPolicies?: boolean | Record<string, unknown>;
    referrerPolicy?: boolean | Record<string, unknown>;
    xssFilter?: boolean | Record<string, unknown>;
  }

  function helmet(options?: HelmetOptions): (req: Request, res: Response, next: NextFunction) => void;
  
  export = helmet;
}

/**
 * CORS TYPES
 */
declare module 'cors' {
  import { Request, Response, NextFunction } from 'express';
  
  interface CorsOptions {
    origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): (req: Request, res: Response, next: NextFunction) => void;
  
  export = cors;
}

/**
 * AMADEUS TYPES
 */
declare module 'amadeus' {
  class Amadeus {
    constructor(options: { clientId: string; clientSecret: string; hostname?: string });
    
    flightOffersSearch(params: Record<string, unknown>): Promise<unknown>;
    flightPriceAnalysis(params: Record<string, unknown>): Promise<unknown>;
    flightOrders(params: Record<string, unknown>): Promise<unknown>;
    hotelOffers(params: Record<string, unknown>): Promise<unknown>;
    airportAndCitySearch(params: Record<string, unknown>): Promise<unknown>;
    
    referenceData: {
      locations: {
        airports(params: Record<string, unknown>): Promise<unknown>;
      };
    };
    
    shopping: {
      flightOffersSearch(params: Record<string, unknown>): Promise<unknown>;
      hotelOffers(params: Record<string, unknown>): Promise<unknown>;
    };
    
    hotelBooking: {
      hotelBookings(params: Record<string, unknown>): Promise<unknown>;
    };
  }
  
  export = Amadeus;
}

/**
 * STRIPE TYPES
 */
declare module 'stripe' {
  class Stripe {
    constructor(apiKey: string, options?: Record<string, unknown>);
    
    customers: Record<string, unknown>;
    paymentIntents: Record<string, unknown>;
    charges: Record<string, unknown>;
    refunds: Record<string, unknown>;
    invoices: Record<string, unknown>;
    subscriptions: Record<string, unknown>;
    tokens: Record<string, unknown>;
    sources: Record<string, unknown>;
    accounts: Record<string, unknown>;
    webhooks: Record<string, unknown>;
  }
  
  export = Stripe;
}

/**
 * EXPRESS-RATE-LIMIT TYPES
 */
declare module 'express-rate-limit' {
  import { Request, Response, NextFunction } from 'express';
  
  interface RateLimitOptions {
    windowMs?: number;
    max?: number | ((req: Request) => number);
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    handler?: (req: Request, res: Response) => void;
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request, res: Response) => boolean;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    message?: unknown;
    statusCode?: number;
    validStatusCodes?: number[];
  }

  function rateLimit(options?: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void;
  
  export = rateLimit;
}

/**
 * JSONWEBTOKEN TYPES
 */
declare module 'jsonwebtoken' {
  interface JwtPayload {
    sub?: string;
    email?: string;
    role?: string;
    iat?: number;
    exp?: number;
  }

  function sign(payload: string | object | Buffer, secret: string, options?: object): string;
  function verify(token: string, secret: string, options?: object): JwtPayload | string;
  function decode(token: string, options?: object): JwtPayload | null;
  
  class TokenExpiredError extends Error {
    name: 'TokenExpiredError';
    message: string;
    expiredAt: Date;
  }
  
  class JsonWebTokenError extends Error {
    name: 'JsonWebTokenError';
    message: string;
  }
  
  export = {
    sign,
    verify,
    decode,
    TokenExpiredError,
    JsonWebTokenError
  };
}

/**
 * BCRYPTJS TYPES
 */
declare module 'bcryptjs' {
  function hash(s: string, salt: number | string): string;
  function hashSync(s: string, salt: number | string): string;
  function compare(s: string, hash: string): boolean;
  function compareSync(s: string, hash: string): boolean;
  function genSaltSync(rounds?: number): string;
  function genSalt(rounds?: number): Promise<string>;
  
  export = {
    hash,
    hashSync,
    compare,
    compareSync,
    genSaltSync,
    genSalt
  };
}

/**
 * DOTENV TYPES
 */
declare module 'dotenv' {
  function config(options?: { path?: string; encoding?: string }): { error?: Error };
  export default config;
}

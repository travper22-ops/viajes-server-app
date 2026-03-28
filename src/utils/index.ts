// ============================================
// UTILIDADES DEL PROYECTO
// ============================================

// ============================================
// HELPERS DE FECHA
// ============================================

/**
 * Formatea una fecha al formato YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Formatea una fecha para mostrar (DD/MM/YYYY)
 */
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES');
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-ES');
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Valida que una fecha sea futura
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

// ============================================
// HELPERS DE PRECIO
// ============================================

/**
 * Formatea un precio al formato de moneda
 */
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Convierte centavos a euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Convierte euros a centavos
 */
export function eurosToCents(euros: number): number {
  return euros * 100;
}

// ============================================
// HELPERS DE STRING
// ============================================

/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Genera un slug URL-friendly
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Trunca un string a una longitud máxima
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Genera un ID único
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

// ============================================
// HELPERS DE VALIDACIÓN
// ============================================

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida un número de teléfono
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{9,}$/;
  return phoneRegex.test(phone);
}

/**
 * Valida un código IATA (3 letras)
 */
export function isValidIATACode(code: string): boolean {
  const iataRegex = /^[A-Z]{3}$/;
  return iataRegex.test(code.toUpperCase());
}

// ============================================
// HELPERS DE ARRAY
// ============================================

/**
 * Agrupa un array por una propiedad
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Elimina duplicados de un array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// ============================================
// HELPERS DE OBJETO
// ============================================

/**
 * Omite propiedades de un objeto
 */
export function omit<T extends object, K extends keyof T>(
  obj: T, 
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 *pick properties from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T, 
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export default {
  formatDate,
  formatDateDisplay,
  formatDateTime,
  daysBetween,
  isFutureDate,
  formatPrice,
  centsToEuros,
  eurosToCents,
  capitalizeWords,
  slugify,
  truncate,
  generateId,
  isValidEmail,
  isValidPhone,
  isValidIATACode,
  groupBy,
  unique,
  omit,
  pick
};

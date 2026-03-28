// ============================================
// VALIDADORES DEL PROYECTO
// ============================================

// ============================================
// HELPERS
// ============================================

/**
 * Validador genérico
 */
type ValidatorFn = (value: unknown) => boolean;

function createValidator(fn: ValidatorFn, message: string) {
  return { valid: fn(value), message };
}

let value: unknown;

// ============================================
// VALIDADORES DE EMAIL
// ============================================

/**
 * Valida un email
 */
export function isEmail(value: unknown): { valid: boolean; message: string } {
  if (typeof value !== 'string') {
    return { valid: false, message: 'El valor debe ser un string' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(value),
    message: 'Email inválido'
  };
}

// ============================================
// VALIDADORES DE STRING
// ============================================

/**
 * Valida que no esté vacío
 */
export function isRequired(value: unknown): { valid: boolean; message: string } {
  if (value === null || value === undefined) {
    return { valid: false, message: 'Este campo es requerido' };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: 'Este campo no puede estar vacío' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Valida longitud mínima
 */
export function minLength(min: number) {
  return (value: unknown): { valid: boolean; message: string } => {
    if (typeof value !== 'string') {
      return { valid: false, message: 'El valor debe ser un string' };
    }
    
    return {
      valid: value.length >= min,
      message: `Mínimo ${min} caracteres`
    };
  };
}

/**
 * Valida longitud máxima
 */
export function maxLength(max: number) {
  return (value: unknown): { valid: boolean; message: string } => {
    if (typeof value !== 'string') {
      return { valid: false, message: 'El valor debe ser un string' };
    }
    
    return {
      valid: value.length <= max,
      message: `Máximo ${max} caracteres`
    };
  };
}

// ============================================
// VALIDADORES DE NÚMERO
// ============================================

/**
 * Valida que sea un número
 */
export function isNumber(value: unknown): { valid: boolean; message: string } {
  return {
    valid: typeof value === 'number' && !isNaN(value),
    message: 'Debe ser un número válido'
  };
}

/**
 * Valida rango numérico
 */
export function minValue(min: number) {
  return (value: unknown): { valid: boolean; message: string } => {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, message: 'Debe ser un número válido' };
    }
    
    return {
      valid: value >= min,
      message: `Mínimo valor: ${min}`
    };
  };
}

export function maxValue(max: number) {
  return (value: unknown): { valid: boolean; message: string } => {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, message: 'Debe ser un número válido' };
    }
    
    return {
      valid: value <= max,
      message: `Máximo valor: ${max}`
    };
  };
}

// ============================================
// VALIDADORES DE FECHA
// ============================================

/**
 * Valida formato de fecha (YYYY-MM-DD)
 */
export function isDate(value: unknown): { valid: boolean; message: string } {
  if (typeof value !== 'string') {
    return { valid: false, message: 'El valor debe ser un string' };
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return { valid: false, message: 'Formato de fecha inválido (YYYY-MM-DD)' };
  }
  
  const date = new Date(value);
  return {
    valid: !isNaN(date.getTime()),
    message: 'Fecha inválida'
  };
}

/**
 * Valida que la fecha sea futura
 */
export function isFutureDate(value: unknown): { valid: boolean; message: string } {
  if (typeof value !== 'string') {
    return { valid: false, message: 'El valor debe ser un string' };
  }
  
  const date = new Date(value);
  return {
    valid: date > new Date(),
    message: 'La fecha debe ser futura'
  };
}

// ============================================
// VALIDADORES ESPECIALES
// ============================================

/**
 * Valida código IATA
 */
export function isIATACode(value: unknown): { valid: boolean; message: string } {
  if (typeof value !== 'string') {
    return { valid: false, message: 'El valor debe ser un string' };
  }
  
  const iataRegex = /^[A-Z]{3}$/;
  return {
    valid: iataRegex.test(value.toUpperCase()),
    message: 'Código IATA inválido (3 letras)'
  };
}

/**
 * Valida URL
 */
export function isUrl(value: unknown): { valid: boolean; message: string } {
  if (typeof value !== 'string') {
    return { valid: false, message: 'El valor debe ser un string' };
  }
  
  try {
    new URL(value);
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: 'URL inválida' };
  }
}

/**
 * Valida UUID
 */
export function isUUID(value: unknown): { valid: boolean; message: string } {
  if (typeof value !== 'string') {
    return { valid: false, message: 'El valor debe ser un string' };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return {
    valid: uuidRegex.test(value),
    message: 'UUID inválido'
  };
}

// ============================================
// COMPOSICIÓN DE VALIDADORES
// ============================================

/**
 * Combina múltiples validadores
 */
export function validate(value: unknown, validators: Array<(v: unknown) => { valid: boolean; message: string }>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      errors.push(result.message);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  isEmail,
  isRequired,
  minLength,
  maxLength,
  isNumber,
  minValue,
  maxValue,
  isDate,
  isFutureDate,
  isIATACode,
  isUrl,
  isUUID,
  validate
};

// ============================================
// CONFIGURACIÓN DE AMADEUS
// ============================================

import Amadeus from 'amadeus';
import env, { isAmadeusConfigured } from './env.js';

// ============================================
// INTERFAZ
// ============================================

export interface AmadeusConfig {
  clientId: string;
  clientSecret: string;
  hostname: 'test' | 'production';
}

// ============================================
// INSTANCIA
// ============================================

let amadeusInstance: Amadeus | null = null;

/**
 * Inicializa la conexión con Amadeus
 */
export function initAmadeus(): Amadeus | null {
  if (!isAmadeusConfigured()) {
    console.warn('⚠️  Amadeus no está configurado. Las búsquedas de vuelos y hoteles no funcionarán.');
    console.warn('   Configure AMADEUS_CLIENT_ID y AMADEUS_CLIENT_SECRET en .env');
    return null;
  }
  
  try {
    amadeusInstance = new Amadeus({
      clientId: env.AMADEUS_CLIENT_ID,
      clientSecret: env.AMADEUS_CLIENT_SECRET,
      hostname: env.AMADEUS_ENVIRONMENT
    });
    
    console.log('✅ Amadeus conectado correctamente');
    return amadeusInstance;
  } catch (error) {
    console.error('❌ Error al conectar con Amadeus:', error);
    return null;
  }
}

/**
 * Obtiene la instancia de Amadeus
 */
export function getAmadeus(): Amadeus | null {
  if (!amadeusInstance) {
    return initAmadeus();
  }
  return amadeusInstance;
}

/**
 * Verifica la conexión con Amadeus
 */
export async function testAmadeusConnection(): Promise<{ success: boolean; message: string }> {
  const amadeus = getAmadeus();
  
  if (!amadeus) {
    return { 
      success: false, 
      message: 'Amadeus no está configurado' 
    };
  }
  
  try {
    // Intentar hacer una búsqueda simple
    const response = await (amadeus as any).referenceData.locations({
      subType: 'AIRPORT,CITY',
      keyword: 'MAD',
      page: { limit: 1 }
    });
    
    return { 
      success: true, 
      message: 'Conexión con Amadeus exitosa' 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { 
      success: false, 
      message: `Error al conectar con Amadeus: ${errorMessage}` 
    };
  }
}

/**
 * Obtiene el entorno actual de Amadeus
 */
export function getAmadeusEnvironment(): 'test' | 'production' {
  return env.AMADEUS_ENVIRONMENT;
}

/**
 * Verifica si estamos en modo prueba
 */
export function isAmadeusTestMode(): boolean {
  return env.AMADEUS_ENVIRONMENT === 'test';
}

export default {
  initAmadeus,
  getAmadeus,
  testAmadeusConnection,
  getAmadeusEnvironment,
  isAmadeusTestMode
};

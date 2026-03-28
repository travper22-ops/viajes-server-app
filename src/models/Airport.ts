// ============================================
// MODELO DE AEROPUERTOS
// Lista completa de aeropuertos para autocompletado
// ============================================

export interface IAirport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  type: 'international' | 'domestic' | 'regional';
}

export const AIRPORTS_LIST: IAirport[] = [
  // ESPAÑA
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', latitude: 40.4983, longitude: -3.5676, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', country: 'Spain', latitude: 41.2974, longitude: 2.0833, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga', country: 'Spain', latitude: 36.6752, longitude: -4.4991, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'PMI', name: 'Son Sant Joan', city: 'Palma de Mallorca', country: 'Spain', latitude: 39.5517, longitude: 2.7382, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'IBZ', name: 'Ibiza', city: 'Ibiza', country: 'Spain', latitude: 38.8729, longitude: 1.3672, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'VLC', name: 'Valencia', city: 'Valencia', country: 'Spain', latitude: 39.4899, longitude: -0.4786, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'SVQ', name: 'Sevilla', city: 'Sevilla', country: 'Spain', latitude: 37.4180, longitude: -5.8931, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'BIO', name: 'Bilbao', city: 'Bilbao', country: 'Spain', latitude: 43.3011, longitude: -2.9071, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'ALC', name: 'Alicante-Elche', city: 'Alicante', country: 'Spain', latitude: 38.2822, longitude: -0.5582, timezone: 'Europe/Madrid', type: 'international' },
  { code: 'TFS', name: 'Tenerife Sur', city: 'Tenerife', country: 'Spain', latitude: 28.0447, longitude: -16.5722, timezone: 'Atlantic/Canary', type: 'international' },
  { code: 'LPA', name: 'Gran Canaria', city: 'Gran Canaria', country: 'Spain', latitude: 27.9318, longitude: -15.3906, timezone: 'Atlantic/Canary', type: 'international' },
  { code: 'FUE', name: 'Fuerteventura', city: 'Fuerteventura', country: 'Spain', latitude: 28.4527, longitude: -13.8638, timezone: 'Atlantic/Canary', type: 'international' },
  { code: 'Lanz', name: 'Lanzarote', city: 'Lanzarote', country: 'Spain', latitude: 28.9455, longitude: -13.5952, timezone: 'Atlantic/Canary', type: 'international' },
  
  // PORTUGAL
  { code: 'LIS', name: 'Humberto Delgado', city: 'Lisbon', country: 'Portugal', latitude: 38.7742, longitude: -9.1342, timezone: 'Europe/Lisbon', type: 'international' },
  { code: 'OPO', name: 'Francisco Sá Carneiro', city: 'Porto', country: 'Portugal', latitude: 41.2482, longitude: -8.6794, timezone: 'Europe/Lisbon', type: 'international' },
  { code: 'FAO', name: 'Faro', city: 'Faro', country: 'Portugal', latitude: 37.0194, longitude: -7.9322, timezone: 'Europe/Lisbon', type: 'international' },
  
  // EUROPA
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom', latitude: 51.4700, longitude: -0.4543, timezone: 'Europe/London', type: 'international' },
  { code: 'LGW', name: 'Gatwick', city: 'London', country: 'United Kingdom', latitude: 51.1537, longitude: -0.1821, timezone: 'Europe/London', type: 'international' },
  { code: 'MAN', name: 'Manchester', city: 'Manchester', country: 'United Kingdom', latitude: 53.3537, longitude: -2.2750, timezone: 'Europe/London', type: 'international' },
  { code: 'STN', name: 'London Stansted', city: 'London', country: 'United Kingdom', latitude: 51.8860, longitude: 0.2389, timezone: 'Europe/London', type: 'international' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479, timezone: 'Europe/Paris', type: 'international' },
  { code: 'ORY', name: 'Orly', city: 'Paris', country: 'France', latitude: 48.7233, longitude: 2.3794, timezone: 'Europe/Paris', type: 'international' },
  { code: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice', country: 'France', latitude: 43.6584, longitude: 7.2159, timezone: 'Europe/Paris', type: 'international' },
  { code: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France', latitude: 45.7256, longitude: 5.0811, timezone: 'Europe/Paris', type: 'international' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', latitude: 50.0379, longitude: 8.5622, timezone: 'Europe/Berlin', type: 'international' },
  { code: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany', latitude: 48.3538, longitude: 11.7861, timezone: 'Europe/Berlin', type: 'international' },
  { code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany', latitude: 52.3667, longitude: 13.5033, timezone: 'Europe/Berlin', type: 'international' },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', latitude: 52.3105, longitude: 4.7683, timezone: 'Europe/Amsterdam', type: 'international' },
  { code: 'FCO', name: 'Leonardo da Vinci', city: 'Rome', country: 'Italy', latitude: 41.8003, longitude: 12.2389, timezone: 'Europe/Rome', type: 'international' },
  { code: 'MXP', name: 'Malpensa', city: 'Milan', country: 'Italy', latitude: 45.6306, longitude: 8.7281, timezone: 'Europe/Rome', type: 'international' },
  { code: 'VCE', name: 'Venice Marco Polo', city: 'Venice', country: 'Italy', latitude: 45.5053, longitude: 12.3519, timezone: 'Europe/Rome', type: 'international' },
  { code: 'NAP', name: 'Naples International', city: 'Naples', country: 'Italy', latitude: 40.8862, longitude: 14.2908, timezone: 'Europe/Rome', type: 'international' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', latitude: 47.4647, longitude: 8.5492, timezone: 'Europe/Zurich', type: 'international' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', latitude: 46.2381, longitude: 6.1089, timezone: 'Europe/Zurich', type: 'international' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', latitude: 48.1103, longitude: 16.5697, timezone: 'Europe/Vienna', type: 'international' },
  { code: 'PRG', name: 'Václav Havel', city: 'Prague', country: 'Czech Republic', latitude: 50.1008, longitude: 14.2600, timezone: 'Europe/Prague', type: 'international' },
  
  // AMÉRICA LATINA
  { code: 'MEX', name: 'Benito Juárez International', city: 'Mexico City', country: 'Mexico', latitude: 19.4363, longitude: -99.0721, timezone: 'America/Mexico_City', type: 'international' },
  { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico', latitude: 21.0365, longitude: -86.8773, timezone: 'America/Cancun', type: 'international' },
  { code: 'GDL', name: 'Guadalajara International', city: 'Guadalajara', country: 'Mexico', latitude: 20.5218, longitude: -103.3115, timezone: 'America/Mexico_City', type: 'international' },
  { code: 'MTY', name: 'Monterrey International', city: 'Monterrey', country: 'Mexico', latitude: 25.7785, longitude: -100.1064, timezone: 'America/Monterrey', type: 'international' },
  { code: 'Tij', name: 'Tijuana International', city: 'Tijuana', country: 'Mexico', latitude: 32.5411, longitude: -116.9725, timezone: 'America/Tijuana', type: 'international' },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', latitude: -12.0219, longitude: -77.1143, timezone: 'America/Lima', type: 'international' },
  { code: 'CUZ', name: 'Alejandro Velasco Astete', city: 'Cusco', country: 'Peru', latitude: -13.5357, longitude: -71.9675, timezone: 'America/Lima', type: 'international' },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', latitude: 4.7016, longitude: -74.1469, timezone: 'America/Bogota', type: 'international' },
  { code: 'MDE', name: 'José María Córdova', city: 'Medellín', country: 'Colombia', latitude: 6.1645, longitude: -75.4131, timezone: 'America/Bogota', type: 'international' },
  { code: 'CAL', name: 'Alfonso Bonilla Aragón', city: 'Cali', country: 'Colombia', latitude: 3.4372, longitude: -76.5225, timezone: 'America/Bogota', type: 'international' },
  { code: 'BGA', name: 'Palonegro International', city: 'Bucaramanga', country: 'Colombia', latitude: 7.1265, longitude: -73.1847, timezone: 'America/Bogota', type: 'international' },
  { code: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina', latitude: -34.8222, longitude: -58.5358, timezone: 'America/Argentina/Buenos_Aires', type: 'international' },
  { code: 'COR', name: 'Ingeniero Aeronáutico', city: 'Córdoba', country: 'Argentina', latitude: -31.3203, longitude: -64.2088, timezone: 'America/Argentina/Cordoba', type: 'international' },
  { code: 'Mendoza', name: 'Governor Francisco Gabrielli', city: 'Mendoza', country: 'Argentina', latitude: -32.8317, longitude: -68.7869, timezone: 'America/Argentina/Mendoza', type: 'international' },
  { code: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile', latitude: -33.3930, longitude: -70.7858, timezone: 'America/Santiago', type: 'international' },
  { code: 'IQQ', name: 'Diego Aracena International', city: 'Iquique', country: 'Chile', latitude: -20.5352, longitude: -70.1811, timezone: 'America/Santiago', type: 'international' },
  { code: 'GIG', name: 'Rio de Janeiro–Antônio Carlos Jobim', city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.8099, longitude: -43.2505, timezone: 'America/Sao_Paulo', type: 'international' },
  { code: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo', country: 'Brazil', latitude: -23.4356, longitude: -46.4731, timezone: 'America/Sao_Paulo', type: 'international' },
  { code: 'BSB', name: 'Presidente Juscelino Kubitschek', city: 'Brasília', country: 'Brazil', latitude: -15.8714, longitude: -47.9186, timezone: 'America/Sao_Paulo', type: 'international' },
  { code: 'SSA', name: 'Deputado Luís Eduardo Magalhães', city: 'Salvador', country: 'Brazil', latitude: -12.9111, longitude: -38.3311, timezone: 'America/Bahia', type: 'international' },
  { code: 'VVI', name: 'Viru Viru International', city: 'Santa Cruz', country: 'Bolivia', latitude: -17.6448, longitude: -63.1358, timezone: 'America/La_Paz', type: 'international' },
  { code: 'LPB', name: 'El Alto International', city: 'La Paz', country: 'Bolivia', latitude: -16.5134, longitude: -68.1923, timezone: 'America/La_Paz', type: 'international' },
  { code: 'MVD', name: 'Carrasco International', city: 'Montevideo', country: 'Uruguay', latitude: -34.8384, longitude: -56.0308, timezone: 'America/Montevideo', type: 'international' },
  { code: 'ASU', name: 'Silvio Pettirossi', city: 'Asunción', country: 'Paraguay', latitude: -25.2396, longitude: -57.4899, timezone: 'America/Asuncion', type: 'international' },
  { code: 'CCs', name: 'Simón Bolívar International', city: 'Caracas', country: 'Venezuela', latitude: 10.6032, longitude: -66.9908, timezone: 'America/Caracas', type: 'international' },
  { code: 'HAV', name: 'José Martí', city: 'Havana', country: 'Cuba', latitude: 22.9892, longitude: -82.4092, timezone: 'America/Havana', type: 'international' },
  { code: 'SDQ', name: 'Las Américas International', city: 'Santo Domingo', country: 'Dominican Republic', latitude: 18.4297, longitude: -69.6689, timezone: 'America/Santo_Domingo', type: 'international' },
  { code: 'PUJ', name: 'Punta Cana International', city: 'Punta Cana', country: 'Dominican Republic', latitude: 18.5674, longitude: -68.3635, timezone: 'America/Santo_Domingo', type: 'international' },
  { code: 'SJO', name: 'Juan Santamaría', city: 'San José', country: 'Costa Rica', latitude: 9.9939, longitude: -84.2080, timezone: 'America/Costa_Rica', type: 'international' },
  { code: 'SAL', name: 'Monumento al Sol', city: 'San Salvador', country: 'El Salvador', latitude: 13.4407, longitude: -89.0527, timezone: 'America/El_Salvador', type: 'international' },
  { code: 'GUA', name: 'La Aurora', city: 'Guatemala City', country: 'Guatemala', latitude: 14.5833, longitude: -90.5275, timezone: 'America/Guatemala', type: 'international' },
  { code: 'TGU', name: 'Toncontín International', city: 'Tegucigalpa', country: 'Honduras', latitude: 14.0609, longitude: -87.2178, timezone: 'America/Tegucigalpa', type: 'international' },
  { code: 'MNG', name: 'Augusto C. Sandino', city: 'Managua', country: 'Nicaragua', latitude: 12.1415, longitude: -86.2514, timezone: 'America/Managua', type: 'international' },
  { code: 'BZE', name: 'Philip S. W. Goldson', city: 'Belize City', country: 'Belize', latitude: 17.4987, longitude: -88.1903, timezone: 'America/Belize', type: 'international' },
  
  // ESTADOS UNIDOS
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781, timezone: 'America/New_York', type: 'international' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', latitude: 33.9416, longitude: -118.4085, timezone: 'America/Los_Angeles', type: 'international' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', latitude: 25.7959, longitude: -80.2870, timezone: 'America/New_York', type: 'international' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'United States', latitude: 41.9742, longitude: -87.9073, timezone: 'America/Chicago', type: 'international' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', latitude: 37.6213, longitude: -122.3790, timezone: 'America/Los_Angeles', type: 'international' },
  { code: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'United States', latitude: 42.3656, longitude: -71.0096, timezone: 'America/New_York', type: 'international' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States', latitude: 33.6407, longitude: -84.4277, timezone: 'America/New_York', type: 'international' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States', latitude: 32.8998, longitude: -97.0403, timezone: 'America/Chicago', type: 'international' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'United States', latitude: 39.8561, longitude: -104.6737, timezone: 'America/Denver', type: 'international' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', latitude: 47.4502, longitude: -122.3088, timezone: 'America/Los_Angeles', type: 'international' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'United States', latitude: 36.0840, longitude: -115.1537, timezone: 'America/Los_Angeles', type: 'international' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'United States', latitude: 33.4484, longitude: -112.0740, timezone: 'America/Phoenix', type: 'international' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'United States', latitude: 29.9902, longitude: -95.3368, timezone: 'America/Chicago', type: 'international' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'United States', latitude: 40.6895, longitude: -74.1745, timezone: 'America/New_York', type: 'international' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International', city: 'Fort Lauderdale', country: 'United States', latitude: 26.0742, longitude: -80.1521, timezone: 'America/New_York', type: 'international' },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit', country: 'United States', latitude: 42.2162, longitude: -83.3554, timezone: 'America/Detroit', type: 'international' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'United States', latitude: 39.8729, longitude: -75.2437, timezone: 'America/New_York', type: 'international' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', country: 'United States', latitude: 40.7769, longitude: -73.8740, timezone: 'America/New_York', type: 'international' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore', country: 'United States', latitude: 39.1774, longitude: -76.6684, timezone: 'America/New_York', type: 'international' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington D.C.', country: 'United States', latitude: 38.8512, longitude: -77.0402, timezone: 'America/New_York', type: 'international' },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington D.C.', country: 'United States', latitude: 38.9531, longitude: -77.4565, timezone: 'America/New_York', type: 'international' },
  { code: 'MSP', name: 'Minneapolis-St Paul International', city: 'Minneapolis', country: 'United States', latitude: 44.8848, longitude: -93.2223, timezone: 'America/Chicago', type: 'international' },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'United States', latitude: 40.7899, longitude: -111.9791, timezone: 'America/Denver', type: 'international' },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'United States', latitude: 32.7338, longitude: -117.1933, timezone: 'America/Los_Angeles', type: 'international' },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa', country: 'United States', latitude: 27.9755, longitude: -82.5332, timezone: 'America/New_York', type: 'international' },
  { code: 'PDX', name: 'Portland International', city: 'Portland', country: 'United States', latitude: 45.5898, longitude: -122.5951, timezone: 'America/Los_Angeles', type: 'international' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'United States', latitude: 21.3187, longitude: -157.9225, timezone: 'Pacific/Honolulu', type: 'international' },
  
  // CANADÁ
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', latitude: 43.6777, longitude: -79.6248, timezone: 'America/Toronto', type: 'international' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada', latitude: 49.1967, longitude: -123.1815, timezone: 'America/Vancouver', type: 'international' },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau', city: 'Montreal', country: 'Canada', latitude: 45.4706, longitude: -73.7407, timezone: 'America/Toronto', type: 'international' },
  { code: 'YYC', name: 'Calgary International', city: 'Calgary', country: 'Canada', latitude: 51.1215, longitude: -114.0073, timezone: 'America/Edmonton', type: 'international' },
  { code: 'YEG', name: 'Edmonton International', city: 'Edmonton', country: 'Canada', latitude: 53.3097, longitude: -113.5801, timezone: 'America/Edmonton', type: 'international' },
  { code: 'YOW', name: 'Ottawa Macdonald–Cartier International', city: 'Ottawa', country: 'Canada', latitude: 45.3225, longitude: -75.6692, timezone: 'America/Toronto', type: 'international' },
  
  // ASIA
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', latitude: 35.7720, longitude: 140.3929, timezone: 'Asia/Tokyo', type: 'international' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', latitude: 35.5494, longitude: 139.7798, timezone: 'Asia/Tokyo', type: 'international' },
  { code: 'KIX', name: 'Kansai International', city: 'Osaka', country: 'Japan', latitude: 34.4273, longitude: 135.2444, timezone: 'Asia/Tokyo', type: 'international' },
  { code: 'ITM', name: 'Osaka Itami', city: 'Osaka', country: 'Japan', latitude: 34.7853, longitude: 135.4384, timezone: 'Asia/Tokyo', type: 'international' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', latitude: 37.4602, longitude: 126.4407, timezone: 'Asia/Seoul', type: 'international' },
  { code: 'GMP', name: 'Gimpo International', city: 'Seoul', country: 'South Korea', latitude: 37.5587, longitude: 126.8035, timezone: 'Asia/Seoul', type: 'international' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', latitude: 40.0799, longitude: 116.6031, timezone: 'Asia/Shanghai', type: 'international' },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China', latitude: 31.1434, longitude: 121.8052, timezone: 'Asia/Shanghai', type: 'international' },
  { code: 'CAN', name: 'Guangzhou Baiyun International', city: 'Guangzhou', country: 'China', latitude: 23.3924, longitude: 113.2988, timezone: 'Asia/Shanghai', type: 'international' },
  { code: 'SZX', name: 'Shenzhen Bao\'an International', city: 'Shenzhen', country: 'China', latitude: 22.6393, longitude: 113.8108, timezone: 'Asia/Shanghai', type: 'international' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', latitude: 22.3080, longitude: 113.9185, timezone: 'Asia/Hong_Kong', type: 'international' },
  { code: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan', latitude: 25.0797, longitude: 121.2342, timezone: 'Asia/Taipei', type: 'international' },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', latitude: 1.3644, longitude: 103.9915, timezone: 'Asia/Singapore', type: 'international' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', latitude: 13.6900, longitude: 100.7501, timezone: 'Asia/Bangkok', type: 'international' },
  { code: 'DMK', name: 'Don Mueang International', city: 'Bangkok', country: 'Thailand', latitude: 13.9126, longitude: 100.6067, timezone: 'Asia/Bangkok', type: 'international' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India', latitude: 28.5562, longitude: 77.1000, timezone: 'Asia/Kolkata', type: 'international' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India', latitude: 19.0896, longitude: 72.8656, timezone: 'Asia/Kolkata', type: 'international' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2532, longitude: 55.3657, timezone: 'Asia/Dubai', type: 'international' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4331, longitude: 54.6511, timezone: 'Asia/Dubai', type: 'international' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', latitude: 25.2609, longitude: 51.6138, timezone: 'Asia/Qatar', type: 'international' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', latitude: 2.7456, longitude: 101.7099, timezone: 'Asia/Kuala_Lumpur', type: 'international' },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia', latitude: -6.1256, longitude: 106.6559, timezone: 'Asia/Jakarta', type: 'international' },
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines', latitude: 14.5086, longitude: 121.0194, timezone: 'Asia/Manila', type: 'international' },
  
  // OCEANÍA
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', latitude: -33.9399, longitude: 151.1753, timezone: 'Australia/Sydney', type: 'international' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', latitude: -37.6690, longitude: 144.8410, timezone: 'Australia/Melbourne', type: 'international' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', latitude: -27.3942, longitude: 153.1218, timezone: 'Australia/Brisbane', type: 'international' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', latitude: -31.9403, longitude: 115.9672, timezone: 'Australia/Perth', type: 'international' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', latitude: -37.0082, longitude: 174.7850, timezone: 'Pacific/Auckland', type: 'international' },
  { code: 'WLG', name: 'Wellington International', city: 'Wellington', country: 'New Zealand', latitude: -41.3272, longitude: 174.8050, timezone: 'Pacific/Auckland', type: 'international' },
  
  // ÁFRICA
  { code: 'JNB', name: 'O.R. Tambo', city: 'Johannesburg', country: 'South Africa', latitude: -26.1367, longitude: 28.2411, timezone: 'Africa/Johannesburg', type: 'international' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', latitude: -33.9715, longitude: 18.6021, timezone: 'Africa/Johannesburg', type: 'international' },
  { code: 'DUR', name: 'King Shaka International', city: 'Durban', country: 'South Africa', latitude: -29.6144, longitude: 31.1197, timezone: 'Africa/Johannesburg', type: 'international' },
  { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco', latitude: 33.3675, longitude: -7.5860, timezone: 'Africa/Casablanca', type: 'international' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', latitude: 30.1219, longitude: 31.4056, timezone: 'Africa/Cairo', type: 'international' },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', latitude: -1.3192, longitude: 36.9278, timezone: 'Africa/Nairobi', type: 'international' },
  { code: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria', latitude: 6.5774, longitude: 3.3213, timezone: 'Africa/Lagos', type: 'international' },
  { code: 'MRU', name: 'Sir Seewoosagur Ramgoolam International', city: 'Mauritius', country: 'Mauritius', latitude: -20.4307, longitude: 57.6750, timezone: 'Indian/Mauritius', type: 'international' },
  { code: 'SEZ', name: 'Seychelles International', city: 'Mahé', country: 'Seychelles', latitude: -4.6746, longitude: 55.4518, timezone: 'Indian/Mahe', type: 'international' }
];

// ============================================
// FUNCIONES DE BÚSQUEDA
// ============================================

/**
 * Busca un aeropuerto por código
 */
export function findAirportByCode(code: string): IAirport | undefined {
  return AIRPORTS_LIST.find(
    airport => airport.code.toUpperCase() === code.toUpperCase()
  );
}

/**
 * Busca aeropuertos por ciudad
 */
export function findAirportsByCity(city: string): IAirport[] {
  return AIRPORTS_LIST.filter(
    airport => airport.city.toLowerCase().includes(city.toLowerCase())
  );
}

/**
 * Busca aeropuertos por país
 */
export function findAirportsByCountry(country: string): IAirport[] {
  return AIRPORTS_LIST.filter(
    airport => airport.country.toLowerCase().includes(country.toLowerCase())
  );
}

/**
 * Busca aeropuertos por query (código, nombre, ciudad o país)
 */
export function searchAirports(query: string): IAirport[] {
  const searchTerm = query.toLowerCase();
  return AIRPORTS_LIST.filter(airport =>
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm)
  );
}

/**
 * Filtra airports según parámetros de búsqueda
 */
export function filterAirports(params: {
  city?: string;
  country?: string;
  type?: string;
}): IAirport[] {
  let results = [...AIRPORTS_LIST];
  
  if (params.city) {
    results = results.filter(
      airport => airport.city.toLowerCase() === params.city!.toLowerCase()
    );
  }
  
  if (params.country) {
    results = results.filter(
      airport => airport.country.toLowerCase() === params.country!.toLowerCase()
    );
  }
  
  if (params.type) {
    results = results.filter(
      airport => airport.type === params.type
    );
  }
  
  return results;
}

// ============================================
// CIUDADES PRINCIPALES (para autocompletado rápido)
// ============================================

export const MAJOR_CITIES = [
  { code: 'MAD', name: 'Madrid', country: 'Spain' },
  { code: 'BCN', name: 'Barcelona', country: 'Spain' },
  { code: 'LIS', name: 'Lisbon', country: 'Portugal' },
  { code: 'LON', name: 'London', country: 'United Kingdom' },
  { code: 'PAR', name: 'Paris', country: 'France' },
  { code: 'NYC', name: 'New York', country: 'United States' },
  { code: 'LAX', name: 'Los Angeles', country: 'United States' },
  { code: 'MIA', name: 'Miami', country: 'United States' },
  { code: 'MEX', name: 'Mexico City', country: 'Mexico' },
  { code: 'CUN', name: 'Cancún', country: 'Mexico' },
  { code: 'LIM', name: 'Lima', country: 'Peru' },
  { code: 'BOG', name: 'Bogotá', country: 'Colombia' },
  { code: 'SCL', name: 'Santiago', country: 'Chile' },
  { code: 'GRU', name: 'São Paulo', country: 'Brazil' },
  { code: 'GIG', name: 'Rio de Janeiro', country: 'Brazil' },
  { code: 'EZE', name: 'Buenos Aires', country: 'Argentina' },
  { code: 'TYO', name: 'Tokyo', country: 'Japan' },
  { code: 'DXB', name: 'Dubai', country: 'United Arab Emirates' },
  { code: 'SIN', name: 'Singapore', country: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong', country: 'Hong Kong' },
  { code: 'SYD', name: 'Sydney', country: 'Australia' },
  { code: 'JNB', name: 'Johannesburg', country: 'South Africa' }
];

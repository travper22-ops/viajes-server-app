-- =====================================================
-- TABLAS CMS PARA DESTINOS Y BLOG
-- Travel Agency - Supabase Schema Extension
-- =====================================================

-- =====================================================
-- DESTINATIONS - Tabla de Destinos Turísticos
-- =====================================================
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    price_from DECIMAL(10,2) DEFAULT 0,
    category VARCHAR(50) DEFAULT 'beach',  -- beach, mountain, city, cultural, adventure, romantic
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Índices para destinos
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(is_featured);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_destinations_created ON destinations(created_at DESC);

-- =====================================================
-- BLOG_POSTS - Tabla de Artículos del Blog
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author_name VARCHAR(100),
    is_published BOOLEAN DEFAULT false,
    category VARCHAR(50) DEFAULT 'travel',  -- travel, tips, destinations, news, guides
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Índices para blog
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created ON blog_posts(created_at DESC);

-- =====================================================
-- HOTELS - Tabla de Hoteles (ya referenciada en el código)
-- =====================================================
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(300),
    city VARCHAR(100),
    country VARCHAR(100),
    star_rating INTEGER DEFAULT 3,
    image_url TEXT,
    amenities TEXT[],  -- Array de amenidades
    price_per_night DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_country ON hotels(country);
CREATE INDEX IF NOT EXISTS idx_hotels_active ON hotels(is_active);

-- =====================================================
-- HOTEL_ROOMS - Habitaciones de Hoteles
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_type VARCHAR(50) NOT NULL,  -- standard, deluxe, suite, etc.
    description TEXT,
    max_occupancy INTEGER DEFAULT 2,
    price_per_night DECIMAL(10,2) NOT NULL,
    amenities TEXT[],
    image_url TEXT,
    available_count INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotel_rooms_hotel ON hotel_rooms(hotel_id);

-- =====================================================
-- HOTEL_BOOKINGS - Reservas de Hoteles
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    hotel_id UUID REFERENCES hotels(id),
    room_id UUID REFERENCES hotel_rooms(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, confirmed, cancelled, completed
    payment_status VARCHAR(20) DEFAULT 'pending',  -- pending, paid, refunded
    guest_name VARCHAR(100),
    guest_email VARCHAR(100),
    guest_phone VARCHAR(20),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hotel_bookings_user ON hotel_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hotel ON hotel_bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_status ON hotel_bookings(status);

-- =====================================================
-- PROFILES - Perfiles de Usuario (ya referenciado)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user',  -- user, admin, agent
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =====================================================
-- BOOKINGS - Reservas de Vuelos
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    flight_id VARCHAR(100),
    origin VARCHAR(3),
    destination VARCHAR(3),
    departure_date DATE,
    return_date DATE,
    passengers JSONB,  -- Array de pasajeros
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    booking_reference VARCHAR(10) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);

-- =====================================================
-- PAYMENTS - Registros de Pagos
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID,
    user_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    stripe_payment_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================
-- TRANSFER_BOOKINGS - Reservas de Traslados
-- =====================================================
CREATE TABLE IF NOT EXISTS transfer_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    pickup_location VARCHAR(200),
    dropoff_location VARCHAR(200),
    pickup_datetime TIMESTAMPTZ,
    vehicle_type VARCHAR(50),
    passengers INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transfer_bookings_user ON transfer_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_transfer_bookings_status ON transfer_bookings(status);

-- =====================================================
-- USER_PREFERENCES - Preferencias de Usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    currency VARCHAR(3) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'es',
    notifications_email BOOLEAN DEFAULT true,
    notifications_sms BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- =====================================================
-- HOTEL_REVIEW - Reseñas de Hoteles
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    user_id UUID,
    reviewer_name TEXT,
    reviewer_email TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    pros TEXT[],
    cons TEXT[],
    is_approved BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotel_reviews_hotel ON hotel_reviews(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reviews_approved ON hotel_reviews(is_approved);

-- =====================================================
-- TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Trigger para actualizar updated_at en destinations
CREATE OR REPLACE FUNCTION update_destination_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_destinations_timestamp
    BEFORE UPDATE ON destinations
    FOR EACH ROW
    EXECUTE FUNCTION update_destination_timestamp();

-- Trigger para actualizar updated_at en blog_posts
CREATE OR REPLACE FUNCTION update_blog_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_timestamp
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_post_timestamp();

-- Trigger para actualizar updated_at en hotels
CREATE OR REPLACE FUNCTION update_hotel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hotels_timestamp
    BEFORE UPDATE ON hotels
    FOR EACH ROW
    EXECUTE FUNCTION update_hotel_timestamp();

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_reviews ENABLE ROW LEVEL SECURITY;

-- Destinations: cualquiera puede leer, solo admin puede modificar
CREATE POLICY "Public can read destinations" ON destinations FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage destinations" ON destinations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Blog: cualquiera puede leer publicados, solo admin puede modificar
CREATE POLICY "Public can read published blog" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admin can manage blog" ON blog_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Hotels: cualquiera puede leer activos
CREATE POLICY "Public can read active hotels" ON hotels FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage hotels" ON hotels FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles: usuarios pueden ver/editar su propio perfil, admin puede ver todos
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Hotel bookings: usuarios pueden ver sus reservas
CREATE POLICY "Users can view own hotel bookings" ON hotel_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create hotel bookings" ON hotel_bookings FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Bookings: usuarios pueden ver sus reservas
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());

-- Payments: usuarios pueden ver sus pagos
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (user_id = auth.uid());

-- Transfer bookings: usuarios pueden ver sus traslados
CREATE POLICY "Users can view own transfers" ON transfer_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create transfers" ON transfer_bookings FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- User preferences: usuarios pueden editar sus preferencias
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (user_id = auth.uid());

-- Hotel reviews: cualquiera puede leer aprobadas
CREATE POLICY "Public can read approved reviews" ON hotel_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews" ON hotel_reviews FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- DATOS DE EJEMPLO PARA DESTINOS
-- =====================================================
INSERT INTO destinations (name, country, description, image_url, is_featured, price_from, category) VALUES
('Cancún', 'México', 'Famoso destino de playa en el Caribe mexicano con aguas cristalinas y vida nocturna vibrante', 'https://images.unsplash.com/photo-1552074291-ad4dfd8b11c0?w=800', true, 450, 'beach'),
('Barcelona', 'España', 'Ciudad cosmopolita con arquitectura modernista, playas y vida cultural única', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', true, 380, 'city'),
('Machu Picchu', 'Perú', 'Ciudadela inca ubicada en los Andes, uno de los sitios arqueológicos más impresionantes del mundo', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', true, 650, 'cultural'),
('Santorini', 'Grecia', 'Isla volcánica con casas blancas, iglesias de domo azul y atardeceres espectaculares', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', true, 520, 'romantic'),
('Tokio', 'Japón', 'Metrópolis moderna que mezcla rascacielos con templos tradicionales y gastronomía única', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', true, 720, 'city'),
('Costa Rica', 'Costa Rica', 'Destino de ecoturismo con selva tropical, volcanes y biodiversidad única', 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=800', true, 480, 'adventure')
ON CONFLICT DO NOTHING;

-- =====================================================
-- DATOS DE EJEMPLO PARA BLOG
-- =====================================================
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, is_published, category) VALUES
('Los 10 destinos más visitados en 2024', 'destinos-mas-visitados-2024', 
'Descubre los destinos turísticos que más han cautivado a los viajeros este año',
'Contenido completo del artículo sobre los destinos más visitados...',
'Equipo Travel', true, 'destinations'),
('Cómo encontrar vuelos baratos: 15 consejos efectivos', 'consejos-vuelos-baratos',
'Aprende a ahorrar en tus próximos vuelos con estos consejos de expertos',
'Contenido completo con consejos para encontrar vuelos baratos...',
'Equipo Travel', true, 'tips'),
('Guía completa para visitar Machu Picchu', 'guia-machu-picchu',
'Todo lo que necesitas saber para planificar tu visita a la ciudadela inca',
'Contenido completo de la guía...',
'Carlos Mendoza', true, 'guides');

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Tablas CMS creadas exitosamente!';
    RAISE NOTICE '📋 Tablas creadas:';
    RAISE NOTICE '   - destinations (destinos turísticos)';
    RAISE NOTICE '   - blog_posts (artículos del blog)';
    RAISE NOTICE '   - hotels (hoteles)';
    RAISE NOTICE '   - hotel_rooms (habitaciones)';
    RAISE NOTICE '   - hotel_bookings (reservas de hotel)';
    RAISE NOTICE '   - profiles (perfiles de usuario)';
    RAISE NOTICE '   - bookings (reservas de vuelos)';
    RAISE NOTICE '   - payments (pagos)';
    RAISE NOTICE '   - transfer_bookings (traslados)';
    RAISE NOTICE '   - user_preferences (preferencias)';
    RAISE NOTICE '   - hotel_reviews (reseñas)';
END $$;

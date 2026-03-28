import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, MobileNav, Footer, PageBanner } from '../components/layout';
import SEO from '../components/seo/SEO';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image_url: string;
  price_from: number;
  category: string;
  is_featured?: boolean;
}

const categories = [
  { id: 'all', name: 'Todos', icon: 'fa-globe' },
  { id: 'beach', name: 'Playa', icon: 'fa-umbrella-beach' },
  { id: 'city', name: 'Ciudad', icon: 'fa-building' },
  { id: 'mountain', name: 'Montaña', icon: 'fa-mountain' },
  { id: 'cultural', name: 'Cultural', icon: 'fa-landmark' },
  { id: 'adventure', name: 'Aventura', icon: 'fa-compass' },
  { id: 'romantic', name: 'Romántico', icon: 'fa-heart' }
];

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, [activeCategory]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const url = activeCategory === 'all' 
        ? `${API}/destinations`
        : `${API}/destinations?category=${activeCategory}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setDestinations(data.destinations || []);
    } catch (error) {
      console.error('Error:', error);
      // Fallback destinations
      setDestinations([
        { id: '1', name: 'Cancún', country: 'México', description: 'Paradisiaco destino de playa con aguas cristalinas', image_url: '/img/tour/t1.jpg', price_from: 450, category: 'beach' },
        { id: '2', name: 'Barcelona', country: 'España', description: 'Ciudad cosmopolita y vibrante con arquitectura única', image_url: '/img/tour/t2.jpg', price_from: 380, category: 'city' },
        { id: '3', name: 'Machu Picchu', country: 'Perú', description: 'Ciudadela inca mythical rodeada de montañas', image_url: '/img/tour/t3.jpg', price_from: 650, category: 'cultural' },
        { id: '4', name: 'Madrid', country: 'España', description: 'Capital vibrante con arte y gastronomía', image_url: '/img/about-02.jpg', price_from: 320, category: 'city' },
        { id: '5', name: 'Maldivas', country: 'Maldivas', description: 'Islas paradisíacas con villas sobre el agua', image_url: '/img/tour/t4.jpg', price_from: 1200, category: 'beach' },
        { id: '6', name: 'Andorra', country: 'España', description: 'Destino de montaña ideal para invierno', image_url: '/img/tour/holidays.jpg', price_from: 280, category: 'mountain' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/img/_placeholder.svg';
  };

  return (
    <div id="body">
      <SEO
        title="Destinos de Viaje | Descubre el Mundo"
        description="Explora los mejores destinos de viaje: playas, ciudades, montañas y más. Encuentra inspiración para tu próxima aventura y reserva al mejor precio."
        keywords="destinos viaje, destinos turísticos, viajes España, destinos playa, destinos Europa, viajes baratos"
        url="https://travelagency.com/destinos"
      />
      <MobileNav />
      <Header />
      <PageBanner
        title="Destinos"
        subtitle="Descubre los lugares más increíbles del mundo"
        breadcrumbs={[{ to: '/', icon: 'fa-home', label: 'Inicio' }, { label: 'Destinos' }]}
      />

      {/* Search and Categories Section */}
      <section className="search-tab-wrap py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              >
                <i className={`fa ${cat.icon}`}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 flex justify-center">
            <div className="search-box-2">
              <i className="fa fa-search"></i>
              <input
                type="text"
                placeholder="Buscar destino o país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="tour-wrap">
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 16px'}}>
          {loading ? (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div className="spinner"></div>
              <p style={{marginTop:16,color:'#888'}}>Cargando destinos...</p>
            </div>
          ) : (
            <>
              <div className="dest-grid">
                {filteredDestinations.map((destination) => (
                  <div key={destination.id} className="tour-block">
                    <div className="tour-img">
                      <img
                        src={destination.image_url}
                        alt={destination.name}
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <span className="price-tour">
                        Desde ${destination.price_from || '450'}
                      </span>
                    </div>
                    <div className="tour-content">
                      <div className="tour-info">
                        <span className="tour-location">
                          <i className="fa fa-map-marker"></i>
                          {destination.country}
                        </span>
                        <span className="tour-category">
                          <i className={`fa ${categories.find(c => c.id === destination.category)?.icon || 'fa-map'}`}></i>
                          {destination.category}
                        </span>
                      </div>
                      <h3 className="tour-title">{destination.name}</h3>
                      <p className="tour-desc">{destination.description}</p>
                      <Link to={`/hoteles?destination=${destination.name}`} className="btn-book">
                        Ver Hoteles <i className="fa fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDestinations.length === 0 && (
                <div style={{textAlign:'center',padding:'60px 0'}}>
                  <i className="fa fa-search" style={{fontSize:40,color:'#ccc',display:'block',marginBottom:12}}></i>
                  <h3 style={{fontSize:20,fontWeight:700,color:'#333',marginBottom:8}}>No se encontraron destinos</h3>
                  <p style={{color:'#888'}}>Intenta con otra búsqueda o categoría</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{background:'#003580',padding:'48px 16px',textAlign:'center'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <h2 style={{color:'#fff',fontSize:22,fontWeight:700,marginBottom:10}}>¿No encuentras lo que buscas?</h2>
          <p style={{color:'rgba(255,255,255,0.85)',marginBottom:24}}>
            Contáctanos y te ayudamos a planificar tu próximo viaje
          </p>
          <Link to="/contacto" className="btn-book" style={{display:'inline-flex',background:'#fff',color:'#003580'}}>
            <i className="fa fa-envelope"></i> Contáctanos
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

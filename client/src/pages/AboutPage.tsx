import { Header, MobileNav, Footer, PageBanner } from '../components/layout';
import { Quote } from 'lucide-react';
import { WhyUsGrid, TeamGrid, StatsBar } from '../components/about';
import SEO from '../components/seo/SEO';

export default function AboutPage() {
  const aboutImages = ['/img/about-02.jpg', '/img/about-03.jpg', '/img/about-04.jpg', '/img/about-05.jpg'];
  const features = ['Ideas Creativas', 'Diseño Adaptable para todos los dispositivos', 'Características Excelentes'];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/img/_placeholder.svg';
  };

  return (
    <div id="body">
      <SEO
        title="Sobre Nosotros | Viajes y Experiencias"
        description="Somos una agencia de viajes especializada en vuelos, hoteles y paquetes turísticos. Conoce nuestro equipo y nuestra pasión por los viajes."
        keywords="agencia de viajes, sobre nosotros, quiénes somos, equipo viajes, agencia turismo España"
        url="https://travelagency.com/sobre-nosotros"
      />
      <MobileNav />
      <Header />
      <PageBanner
        title="Sobre Nosotros"
        subtitle="Ayudamos a las personas a encontrar experiencias increíbles a un precio razonable"
        breadcrumbs={[{ to: '/', icon: 'fa-home', label: 'Inicio' }, { label: 'Sobre Nosotros' }]}
      />

      {/* Intro con imagen real */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">¡Somos Viajes y Experiencias!</p>
              <h2 className="text-3xl font-bold font-poppins text-gray-800 mb-4">
                Somos una <span className="text-primary">agencia de viajes</span> de servicio completo que hace realidad tus sueños.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Un equipo de diseñadores y agentes de viajes apasionados e inigualables. Especializados en vuelos, hoteles, paquetes vacacionales y traslados para toda España y el mundo.
              </p>
              <ul className="space-y-3 mb-6">
                {features.map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-600">
                    <i className="fa fa-check-circle" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* img/about-01.jpg — foto principal sobre nosotros */}
            <div className="about-img-wrap">
              <img
                src="/img/about-01.jpg"
                alt="Sobre Viajes y Experiencias"
                onError={handleImageError}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fotos secundarias about-02 a about-05 */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aboutImages.map((src, i) => (
              <div key={i} className="img-card h-48">
                <img 
                  src={src} 
                  alt={`Sobre nosotros ${i + 2}`}
                  className="w-full h-48 object-cover"
                  onError={handleImageError} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote banner */}
      <section className="bg-primary py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote size={40} className="text-white/30 mx-auto mb-4" />
            <h3 className="text-white text-xl md:text-2xl font-light leading-relaxed italic">
              Nuestra pasión por la excelencia en el servicio al cliente es solo una de las razones por las que somos líderes en el mercado.
            </h3>
          </div>
        </div>
      </section>

      <StatsBar />
      <WhyUsGrid />
      <TeamGrid />
      <Footer />
    </div>
  );
}

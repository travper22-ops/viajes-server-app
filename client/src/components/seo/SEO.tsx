// ============================================
// COMPONENTE DE SEO PARA REACT
// ============================================

import { useEffect, useState } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  canonical?: string;
}

interface MetaTag {
  name: string;
  content: string;
  property?: string;
}

interface LinkTag {
  rel: string;
  href: string;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  noIndex = false,
  canonical,
}: SEOProps) {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [linkTags, setLinkTags] = useState<LinkTag[]>([]);

  // Valores por defecto
  const defaultTitle = 'Viajes y Experiencias - Vuelos, Hoteles y Paquetes Turísticos';
  const defaultDescription = 'Tu agencia de viajes online. Reserva vuelos, hoteles, paquetes vacacionales, autobuses y transferencias. Los mejores precios garantizados.';
  const defaultImage = '/img/og-image.jpg';
  const defaultUrl = 'https://travelagency.com/';

  const fullTitle = title ? `${title} | Travel Agency` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = url || defaultUrl;

  useEffect(() => {
    const newMetaTags: MetaTag[] = [];
    const newLinkTags: LinkTag[] = [];

    // ============================================
    // METADATOS BÁSICOS
    // ============================================
    newMetaTags.push({ name: 'title', content: fullTitle });
    newMetaTags.push({ name: 'description', content: fullDescription });
    
    if (keywords) {
      newMetaTags.push({ name: 'keywords', content: keywords });
    }

    // Robots
    if (noIndex) {
      newMetaTags.push({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      newMetaTags.push({ name: 'robots', content: 'index, follow' });
    }

    // ============================================
    // OPEN GRAPH
    // ============================================
    newMetaTags.push({ property: 'og:type', content: type });
    newMetaTags.push({ property: 'og:url', content: fullUrl });
    newMetaTags.push({ property: 'og:title', content: fullTitle });
    newMetaTags.push({ property: 'og:description', content: fullDescription });
    newMetaTags.push({ property: 'og:image', content: fullImage });
    newMetaTags.push({ property: 'og:image:width', content: '1200' });
    newMetaTags.push({ property: 'og:image:height', content: '630' });
    newMetaTags.push({ property: 'og:locale', content: 'es_ES' });
    newMetaTags.push({ property: 'og:site_name', content: 'Travel Agency' });

    // Article specific
    if (type === 'article') {
      if (author) {
        newMetaTags.push({ property: 'article:author', content: author });
      }
      if (publishedTime) {
        newMetaTags.push({ property: 'article:published_time', content: publishedTime });
      }
      if (modifiedTime) {
        newMetaTags.push({ property: 'article:modified_time', content: modifiedTime });
      }
    }

    // ============================================
    // TWITTER CARD
    // ============================================
    newMetaTags.push({ name: 'twitter:card', content: 'summary_large_image' });
    newMetaTags.push({ name: 'twitter:url', content: fullUrl });
    newMetaTags.push({ name: 'twitter:title', content: fullTitle });
    newMetaTags.push({ name: 'twitter:description', content: fullDescription });
    newMetaTags.push({ name: 'twitter:image', content: fullImage });

    // ============================================
    // CANONICAL
    // ============================================
    if (canonical) {
      newLinkTags.push({ rel: 'canonical', href: canonical });
    } else {
      newLinkTags.push({ rel: 'canonical', href: fullUrl });
    }

    setMetaTags(newMetaTags);
    setLinkTags(newLinkTags);
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, noIndex, canonical, fullTitle, fullDescription, fullImage, fullUrl]);

  useEffect(() => {
    // Actualizar título
    document.title = fullTitle;

    // Eliminar metadatos existentes
    const existingMeta = document.querySelectorAll('meta[data-seo]');
    existingMeta.forEach(el => el.remove());

    const existingLinks = document.querySelectorAll('link[data-seo]');
    existingLinks.forEach(el => el.remove());

    // Agregar nuevos metadatos
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo', 'true');
      
      if (tag.property) {
        meta.setAttribute('property', tag.property);
      } else {
        meta.setAttribute('name', tag.name);
      }
      
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });

    // Agregar nuevos links
    linkTags.forEach(link => {
      const linkEl = document.createElement('link');
      linkEl.setAttribute('data-seo', 'true');
      linkEl.setAttribute('rel', link.rel);
      linkEl.setAttribute('href', link.href);
      document.head.appendChild(linkEl);
    });

    // Cleanup al desmontar
    return () => {
      const existingMeta = document.querySelectorAll('meta[data-seo]');
      existingMeta.forEach(el => el.remove());

      const existingLinks = document.querySelectorAll('link[data-seo]');
      existingLinks.forEach(el => el.remove());
    };
  }, [metaTags, linkTags, fullTitle]);

  // Este componente no renderiza nada
  return null;
}

// ============================================
// HOOK PARA USO FÁCIL DE SEO
// ============================================

export function useSEO(props: SEOProps) {
  return <SEO {...props} />;
}

// ============================================
// COMPONENTES PREDEFINIDOS PARA PÁGINAS COMUNES
// ============================================

/**
 * SEO para páginas de búsqueda de vuelos
 */
export function FlightSearchSEO({ origin, destination, date }: { origin?: string; destination?: string; date?: string }) {
  return (
    <SEO
      title={`Vuelos ${origin || ''} - ${destination || ''} | Buscar`}
      description={`Busca y compara vuelos desde ${origin || 'origen'} hasta ${destination || 'destino'}. Encuentra las mejores ofertas en vuelos.`}
      keywords={`vuelos, ${origin}, ${destination}, buscar vuelos, barato, económica, business, primera clase`}
      url={`/vuelos?origin=${origin || ''}&destination=${destination || ''}`}
    />
  );
}

/**
 * SEO para páginas de hoteles
 */
export function HotelSearchSEO({ city, checkIn, checkOut }: { city?: string; checkIn?: string; checkOut?: string }) {
  return (
    <SEO
      title={`Hoteles en ${city || 'España'} | Reservar`}
      description={`Encuentra los mejores hoteles en ${city || 'España'}. Reserva tu alojamiento al mejor precio con取消了取消预订.`}
      keywords={`hoteles, ${city}, reservar hotel, alojamiento, motel, hostal, apartamento`}
      url={`/hoteles?city=${city || ''}`}
    />
  );
}

/**
 * SEO para páginas de detail hotel
 */
export function HotelDetailSEO({ name, city, rating, price }: { name?: string; city?: string; rating?: number; price?: number }) {
  return (
    <SEO
      title={`${name || 'Hotel'} en ${city || 'España'} - $${price || '0'}/noche`}
      description={`Reserva ${name || 'este hotel'} en ${city || 'España'}. Valoración: ${rating || 0} estrellas. ${price ? 'Desde $' + price + '/noche' : 'Mejor precio garantizado.'}`}
      keywords={`${name}, hotel ${city}, reservar ${name}, ${city} hotel, ${rating} estrellas`}
      type="product"
    />
  );
}

/**
 * SEO para páginas de blog
 */
export function BlogSEO({ title, summary, author, publishedTime }: { title: string; summary: string; author?: string; publishedTime?: string }) {
  return (
    <SEO
      title={title}
      description={summary}
      keywords={title.split(' ').join(', ')}
      type="article"
      author={author}
      publishedTime={publishedTime}
    />
  );
}

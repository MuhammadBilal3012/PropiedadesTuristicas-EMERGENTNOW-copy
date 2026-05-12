import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, User } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

// WhatsApp icon component
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const PropertyCard = ({ property, featured = false }) => {
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const creatorInfo = property.created_by_info;
  
  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (creatorInfo?.telefono_whatsapp) {
      const phone = creatorInfo.telefono_whatsapp.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(`Hola, me interesa la propiedad: ${property.title}`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  return (
    <div
      data-testid={`property-card-${property.id}`}
      className={`property-card group ${featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=srgb&fm=jpg&q=85'}
          alt={property.title}
          className="property-image w-full h-full object-cover"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Property Type Badge */}
        <Badge
          className="absolute top-4 left-4 uppercase text-xs tracking-wider font-semibold px-3 py-1"
          style={{ backgroundColor: '#0F172A', color: 'white' }}
        >
          {property.property_type}
        </Badge>

        {/* Featured Badge */}
        {property.is_featured && (
          <Badge
            className="absolute top-4 right-4 uppercase text-xs tracking-wider font-semibold px-3 py-1"
            style={{ backgroundColor: '#C5A059', color: 'white' }}
          >
            Destacada
          </Badge>
        )}

        {/* Agent Info Overlay - Bottom Right */}
        {creatorInfo && (creatorInfo.nombre_completo || creatorInfo.foto_perfil) && (
          <div 
            className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 shadow-lg"
            style={{ zIndex: 10 }}
          >
            {/* Agent Photo */}
            {creatorInfo.foto_perfil ? (
              <img 
                src={creatorInfo.foto_perfil} 
                alt={creatorInfo.nombre_completo || 'Agente'}
                className="w-8 h-8 rounded-full object-cover border-2 border-amber-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-amber-400">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            )}
            
            {/* Agent Name */}
            <span className="text-xs font-medium text-slate-800 max-w-[100px] truncate">
              {creatorInfo.nombre_completo || creatorInfo.username}
            </span>
            
            {/* WhatsApp Button */}
            {creatorInfo.telefono_whatsapp && (
              <button
                onClick={handleWhatsAppClick}
                className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                title="Contactar por WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        )}

        {/* Price on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="font-heading text-2xl font-bold text-white">
            {formatPrice(property.price, property.currency)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Price - visible by default */}
        <div className="mb-3 group-hover:opacity-0 group-hover:h-0 transition-all duration-300 overflow-hidden">
          <span className="font-heading text-2xl font-bold text-slate-900">
            {formatPrice(property.price, property.currency)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-stone-500 mb-4">
          <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#C5A059' }} />
          <span className="text-sm truncate">{property.location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-stone-600 text-sm mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Square className="h-4 w-4" />
            <span>{property.area} m²</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link to={`/propiedad/${property.id}`}>
          <Button
            data-testid={`view-property-${property.id}`}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 transition-all"
          >
            Ver más
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;

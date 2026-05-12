import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, ArrowLeft, X, ChevronLeft, ChevronRight, Check, Phone, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import PropertyMap from '../components/PropertyMap';
import { getProperty, sendContactMessage } from '../lib/api';
import { toast } from 'sonner';

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const PropertyDetailPage = ({ agency }) => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadProperty = useCallback(async () => {
    try {
      const data = await getProperty(id);
      setProperty(data);
      setFormData(prev => ({
        ...prev,
        message: `Hola, me interesa la propiedad "${data.title}" en ${data.location}. Me gustaria recibir mas informacion.`
      }));
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    loadProperty();
  }, [loadProperty]);

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendContactMessage({ ...formData, property_id: id });
      toast.success('Mensaje enviado correctamente');
      setFormData({ name: '', email: '', phone: '', message: `Hola, me interesa la propiedad "${property.title}" en ${property.location}.` });
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    } finally {
      setSubmitting(false);
    }
  };

  const openLightbox = (index) => { setCurrentImageIndex(index); setLightboxOpen(true); };
  const nextImage = () => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);

  const getWhatsAppUrl = () => {
    const phone = agency?.whatsapp?.replace(/[^0-9]/g, '') || '18098475498';
    const message = encodeURIComponent(`Hola, me interesa la propiedad "${property?.title}" en ${property?.location}.`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-1/4 mb-8" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-[4/3] bg-stone-200" />
              <div className="space-y-4">
                <div className="h-10 bg-stone-200 rounded w-3/4" />
                <div className="h-6 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Propiedad no encontrada</h2>
          <Link to="/propiedades"><Button style={{ backgroundColor: '#C5A059' }} className="text-white">Ver todas las propiedades</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="property-detail-page" className="min-h-screen bg-stone-50 pt-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <Link to="/propiedades" className="inline-flex items-center gap-2 text-stone-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />Volver a propiedades
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image with fixed height */}
            <div 
              className="relative overflow-hidden cursor-pointer group" 
              style={{ aspectRatio: '16/10', minHeight: '300px' }}
              onClick={() => openLightbox(0)}
            >
              <img src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <Badge className="absolute top-4 left-4 uppercase text-xs" style={{ backgroundColor: '#0F172A' }}>{property.property_type}</Badge>

              {/* Mobile-only price overlay (bottom-left of photo) */}
              <div
                className="md:hidden absolute bottom-3 left-3 px-3 py-1.5 rounded-md"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
                data-testid="mobile-price-overlay"
              >
                <p
                  className="font-bold text-white text-lg leading-none"
                  style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.3px' }}
                >
                  {formatPrice(property.price, property.currency)}
                </p>
              </div>
              
              {/* Agent Info Overlay */}
              {property.created_by_info && (
                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full pl-1 pr-2 md:pr-4 py-1 max-w-[calc(100%-1rem)]">
                  {property.created_by_info.foto_perfil ? (
                    <img 
                      src={property.created_by_info.foto_perfil} 
                      alt={property.created_by_info.nombre_completo || property.created_by_info.username}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 border-white flex-shrink-0">
                      {(property.created_by_info.nombre_completo || property.created_by_info.username || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white text-xs md:text-sm font-medium truncate">
                      {property.created_by_info.nombre_completo || property.created_by_info.username}
                    </span>
                    {property.created_by_info.telefono_whatsapp && (
                      <a 
                        href={`https://wa.me/${property.created_by_info.telefono_whatsapp.replace(/[^0-9]/g, '')}?text=Hola, me interesa la propiedad "${property.title}"`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 md:p-1.5 bg-green-500 hover:bg-green-600 rounded-full transition-colors flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WhatsAppIcon />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {property.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {property.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden cursor-pointer group" onClick={() => openLightbox(index + 1)}>
                    <img src={image.url} alt={image.alt || `Imagen ${index + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 break-words">{property.title}</h1>
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: '#C5A059' }} />
                    <span className="break-words">{property.address || property.location}</span>
                  </div>
                </div>
                <p className="hidden md:block font-heading text-2xl sm:text-3xl md:text-4xl font-bold whitespace-nowrap" style={{ color: '#C5A059' }}>{formatPrice(property.price, property.currency)}</p>
              </div>

              <div className="flex flex-wrap gap-4 md:gap-6 py-6 border-y border-stone-200">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-100 flex items-center justify-center flex-shrink-0"><Bed className="h-5 w-5 md:h-6 md:w-6 text-slate-900" /></div>
                    <div><p className="text-xl md:text-2xl font-semibold text-slate-900">{property.bedrooms}</p><p className="text-xs md:text-sm text-stone-500">Habitaciones</p></div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-100 flex items-center justify-center flex-shrink-0"><Bath className="h-5 w-5 md:h-6 md:w-6 text-slate-900" /></div>
                    <div><p className="text-xl md:text-2xl font-semibold text-slate-900">{property.bathrooms}</p><p className="text-xs md:text-sm text-stone-500">Banos</p></div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-100 flex items-center justify-center flex-shrink-0"><Square className="h-5 w-5 md:h-6 md:w-6 text-slate-900" /></div>
                  <div><p className="text-xl md:text-2xl font-semibold text-slate-900">{property.area}</p><p className="text-xs md:text-sm text-stone-500">m2</p></div>
                </div>
              </div>

              <div className="py-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4">Descripcion</h2>
                <p
                  className="text-stone-600 leading-relaxed whitespace-pre-line break-words"
                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                >
                  {property.description}
                </p>
              </div>

              {property.amenities?.length > 0 && (
                <div className="py-6 border-t border-stone-200">
                  <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4">Amenidades</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-stone-600">
                        <Check className="h-4 w-4" style={{ color: '#C5A059' }} /><span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="py-6 border-t border-stone-200">
                <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4">Ubicacion</h2>
                <PropertyMap 
                  latitude={property.latitude} 
                  longitude={property.longitude}
                  title={property.title}
                  location={property.location}
                />
                <p className="text-stone-600 mt-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: '#C5A059' }} />
                  {property.address || property.location}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-property-btn" className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold transition-all">
                <WhatsAppIcon />Contactar por WhatsApp
              </a>

              <div className="bg-white p-6 shadow-lg border border-stone-100">
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-6">Solicitar Informacion</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label htmlFor="name">Nombre *</Label><Input id="name" data-testid="contact-name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="mt-1.5 bg-stone-50" /></div>
                  <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" data-testid="contact-email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required className="mt-1.5 bg-stone-50" /></div>
                  <div><Label htmlFor="phone">Telefono</Label><Input id="phone" type="tel" data-testid="contact-phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-1.5 bg-stone-50" /></div>
                  <div><Label htmlFor="message">Mensaje *</Label><Textarea id="message" data-testid="contact-message" value={formData.message} onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))} required rows={4} className="mt-1.5 bg-stone-50" /></div>
                  <Button type="submit" data-testid="contact-submit" disabled={submitting} className="w-full py-3 text-white font-semibold" style={{ backgroundColor: '#0F172A' }}>{submitting ? 'Enviando...' : 'Enviar Mensaje'}</Button>
                </form>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-stone-600"><Phone className="h-5 w-5" style={{ color: '#C5A059' }} /><span>{agency?.phone || '+18098475498'}</span></div>
                  <div className="flex items-center gap-3 text-stone-600"><Mail className="h-5 w-5" style={{ color: '#C5A059' }} /><span>{agency?.email || 'info@propiedadesturisticasrd.com'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && property.images && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-stone-300 z-10" onClick={() => setLightboxOpen(false)}><X className="h-8 w-8" /></button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 z-10 p-2" onClick={(e) => { e.stopPropagation(); prevImage(); }}><ChevronLeft className="h-10 w-10" /></button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 z-10 p-2" onClick={(e) => { e.stopPropagation(); nextImage(); }}><ChevronRight className="h-10 w-10" /></button>
          <img src={property.images[currentImageIndex]?.url} alt="Property" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">{currentImageIndex + 1} / {property.images.length}</div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;

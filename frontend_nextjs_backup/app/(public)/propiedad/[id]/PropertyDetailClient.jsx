'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Bed, Bath, Square, ArrowLeft, X, ChevronLeft, ChevronRight, Check, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

// Dynamic import for map to avoid SSR issues
const PropertyMap = dynamic(() => import('./PropertyMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-stone-200 flex items-center justify-center">
      <MapPin className="h-12 w-12 text-stone-400 animate-pulse" />
    </div>
  )
});

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function PropertyDetailClient({ property, agency }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    message: `Hola, me interesa la propiedad "${property.title}" en ${property.location}. Me gustaria recibir mas informacion.`
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, property_id: property.id }),
      });
      
      if (response.ok) {
        toast.success('Mensaje enviado correctamente');
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          message: `Hola, me interesa la propiedad "${property.title}" en ${property.location}.`
        });
      } else {
        toast.error('Error al enviar el mensaje');
      }
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    } finally {
      setSubmitting(false);
    }
  };

  const openLightbox = (index) => { 
    setCurrentImageIndex(index); 
    setLightboxOpen(true); 
  };
  
  const nextImage = () => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);

  const getWhatsAppUrl = () => {
    const phone = agency?.whatsapp?.replace(/[^0-9]/g, '') || '18098475498';
    const message = encodeURIComponent(`Hola, me interesa la propiedad "${property?.title}" en ${property?.location}.`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div data-testid="property-detail-page" className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <Link href="/propiedades" className="inline-flex items-center gap-2 text-stone-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />Volver a propiedades
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image with fixed height */}
            <div 
              className="relative overflow-hidden cursor-pointer group" 
              style={{ aspectRatio: '16/10', minHeight: '300px' }}
              onClick={() => openLightbox(0)}
            >
              <img 
                src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'} 
                alt={property.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <Badge className="absolute top-4 left-4 uppercase text-xs" style={{ backgroundColor: '#0F172A' }}>{property.property_type}</Badge>
              
              {/* Agent Info Overlay */}
              {property.created_by_info && (
                <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full pl-1 pr-4 py-1">
                  {property.created_by_info.foto_perfil ? (
                    <img 
                      src={property.created_by_info.foto_perfil} 
                      alt={property.created_by_info.nombre_completo || property.created_by_info.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                      {(property.created_by_info.nombre_completo || property.created_by_info.username || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                      {property.created_by_info.nombre_completo || property.created_by_info.username}
                    </span>
                    {property.created_by_info.telefono_whatsapp && (
                      <a 
                        href={`https://wa.me/${property.created_by_info.telefono_whatsapp.replace(/[^0-9]/g, '')}?text=Hola, me interesa la propiedad "${property.title}"`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
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
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin className="h-5 w-5" style={{ color: '#C5A059' }} />
                    <span>{property.address || property.location}</span>
                  </div>
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold" style={{ color: '#C5A059' }}>{formatPrice(property.price, property.currency)}</p>
              </div>

              <div className="flex flex-wrap gap-6 py-6 border-y border-stone-200">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-stone-100 flex items-center justify-center"><Bed className="h-6 w-6 text-slate-900" /></div>
                    <div><p className="text-2xl font-semibold text-slate-900">{property.bedrooms}</p><p className="text-sm text-stone-500">Habitaciones</p></div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-stone-100 flex items-center justify-center"><Bath className="h-6 w-6 text-slate-900" /></div>
                    <div><p className="text-2xl font-semibold text-slate-900">{property.bathrooms}</p><p className="text-sm text-stone-500">Baños</p></div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-100 flex items-center justify-center"><Square className="h-6 w-6 text-slate-900" /></div>
                  <div><p className="text-2xl font-semibold text-slate-900">{property.area}</p><p className="text-sm text-stone-500">m²</p></div>
                </div>
              </div>

              <div className="py-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4">Descripción</h2>
                <p className="text-stone-600 leading-relaxed whitespace-pre-line">{property.description}</p>
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

              {/* Interactive Map */}
              <div className="py-6 border-t border-stone-200">
                <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4">Ubicación</h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  <PropertyMap 
                    location={property.location}
                    latitude={property.latitude}
                    longitude={property.longitude}
                    title={property.title}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-property-btn" className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold transition-all">
                <WhatsAppIcon />Contactar por WhatsApp
              </a>

              <div className="bg-white p-6 shadow-lg border border-stone-100">
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-6">Solicitar Información</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label htmlFor="name">Nombre *</Label><Input id="name" data-testid="contact-name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="mt-1.5 bg-stone-50" /></div>
                  <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" data-testid="contact-email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required className="mt-1.5 bg-stone-50" /></div>
                  <div><Label htmlFor="phone">Teléfono</Label><Input id="phone" type="tel" data-testid="contact-phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-1.5 bg-stone-50" /></div>
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
}

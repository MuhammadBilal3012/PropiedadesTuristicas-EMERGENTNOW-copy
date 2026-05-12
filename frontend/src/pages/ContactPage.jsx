import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import PropertyMap from '../components/PropertyMap';
import { sendContactMessage } from '../lib/api';
import { toast } from 'sonner';

const ContactPage = ({ agency }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Office location coordinates
  const officeLatitude = agency?.office_latitude || 18.4861;
  const officeLongitude = agency?.office_longitude || -69.9312;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendContactMessage(formData);
      toast.success('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono',
      value: agency?.phone || '+18098475498',
      link: `tel:${agency?.phone || '+18098475498'}`,
    },
    {
      icon: Mail,
      title: 'Email',
      value: agency?.email || 'info@propiedadesturisticasrd.com',
      link: `mailto:${agency?.email || 'info@propiedadesturisticasrd.com'}`,
    },
    {
      icon: MapPin,
      title: 'Dirección',
      value: agency?.address || 'Santo Domingo, República Dominicana',
      link: null,
    },
    {
      icon: Clock,
      title: 'Horario',
      value: 'Lun - Vie: 9:00 AM - 6:00 PM',
      link: null,
    },
  ];

  return (
    <div data-testid="contact-page" className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="bg-slate-900 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: '#C5A059' }}>
            Estamos Aquí Para Ti
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Contacto
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            ¿Tienes preguntas sobre nuestras propiedades? ¿Necesitas asesoría inmobiliaria? 
            Nuestro equipo está listo para ayudarte.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900 mb-8">
                Información de Contacto
              </h2>
              
              <div className="space-y-6 mb-12">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: '#C5A059' }}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500 mb-1">{item.title}</p>
                      {item.link ? (
                        <a
                          href={item.link}
                          className="text-lg text-slate-900 hover:text-amber-700 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-lg text-slate-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="bg-green-50 p-6 border border-green-100 rounded-lg">
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
                  ¿Prefieres WhatsApp?
                </h3>
                <p className="text-stone-600 mb-4">
                  Escríbenos directamente por WhatsApp para una respuesta más rápida.
                </p>
                <a
                  href={`https://wa.me/${(agency?.whatsapp || '+18098475498').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, me gustaría obtener más información sobre sus propiedades.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="contact-whatsapp-btn"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold transition-all rounded-lg"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
              </div>

              {/* Interactive Map with Leaflet */}
              <div className="mt-8">
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" style={{ color: '#C5A059' }} />
                  Nuestra Ubicación
                </h3>
                <div className="rounded-lg overflow-hidden shadow-lg border border-stone-200">
                  <PropertyMap 
                    latitude={officeLatitude} 
                    longitude={officeLongitude}
                    title={agency?.name || 'Nuestra Oficina'}
                    location={agency?.address || 'Santo Domingo, República Dominicana'}
                  />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-white p-8 md:p-10 shadow-lg border border-stone-100 rounded-lg">
                <h2 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
                  Envíanos un Mensaje
                </h2>
                <p className="text-stone-500 mb-8">
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        data-testid="form-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        required
                        className="mt-2 bg-stone-50 border-stone-200 focus:border-slate-900"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        data-testid="form-email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        required
                        className="mt-2 bg-stone-50 border-stone-200 focus:border-slate-900"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      data-testid="form-phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="mt-2 bg-stone-50 border-stone-200 focus:border-slate-900"
                      placeholder="+1 (809) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      data-testid="form-message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      required
                      rows={5}
                      className="mt-2 bg-stone-50 border-stone-200 focus:border-slate-900"
                      placeholder="¿En qué podemos ayudarte? Cuéntanos sobre el tipo de propiedad que buscas..."
                    />
                  </div>

                  <Button
                    type="submit"
                    data-testid="form-submit"
                    disabled={submitting}
                    className="w-full py-4 text-white font-semibold text-lg transition-all hover:shadow-lg rounded-lg"
                    style={{ backgroundColor: '#C5A059' }}
                  >
                    {submitting ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>

                  <p className="text-xs text-stone-500 text-center">
                    Al enviar este formulario, aceptas nuestra política de privacidad y el 
                    tratamiento de tus datos personales.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Mensaje enviado correctamente. Te contactaremos pronto.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error('Error al enviar el mensaje. Intenta de nuevo.');
      }
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page" className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#C5A059' }}>
            Contáctanos
          </p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Estamos Aquí para Ayudarte
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            ¿Tienes preguntas sobre alguna propiedad? ¿Necesitas asesoría? Contáctanos y te responderemos lo antes posible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-8">Información de Contacto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6" style={{ color: '#C5A059' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Dirección</h3>
                    <p className="text-stone-600">Santo Domingo, República Dominicana</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6" style={{ color: '#C5A059' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Teléfono</h3>
                    <p className="text-stone-600">+1 (809) 847-5498</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6" style={{ color: '#C5A059' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                    <p className="text-stone-600">info@propiedadesturisticasrd.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6" style={{ color: '#C5A059' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Horario</h3>
                    <p className="text-stone-600">Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                    <p className="text-stone-600">Sábados: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 shadow-lg">
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">Envíanos un Mensaje</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      data-testid="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-1.5 bg-stone-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      data-testid="contact-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1.5 bg-stone-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="contact-email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="mt-1.5 bg-stone-50"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    data-testid="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={5}
                    className="mt-1.5 bg-stone-50"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="contact-submit"
                  disabled={submitting}
                  className="w-full py-3 text-white font-semibold"
                  style={{ backgroundColor: '#C5A059' }}
                >
                  {submitting ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

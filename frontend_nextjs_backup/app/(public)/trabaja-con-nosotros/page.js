'use client';

import { useState } from 'react';
import { Briefcase, User, Phone, Mail, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function WorkWithUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    linkedin_url: '',
    position: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Aplicación enviada correctamente. Te contactaremos pronto.');
        setFormData({ name: '', phone: '', email: '', linkedin_url: '', position: '', message: '' });
      } else {
        toast.error('Error al enviar la aplicación');
      }
    } catch (error) {
      toast.error('Error al enviar la aplicación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="work-with-us-page" className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#C5A059' }}>
            Únete a Nuestro Equipo
          </p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trabaja con Nosotros
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Estamos buscando personas talentosas y apasionadas por el sector inmobiliario. ¡Forma parte de nuestro equipo!
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">
              ¿Por qué trabajar con nosotros?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Crecimiento Profesional</h3>
              <p className="text-stone-600">Oportunidades de desarrollo y capacitación continua.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Comisiones Atractivas</h3>
              <p className="text-stone-600">Sistema de comisiones competitivo en el mercado.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Ambiente Colaborativo</h3>
              <p className="text-stone-600">Un equipo que se apoya mutuamente para alcanzar el éxito.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 shadow-lg">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6 text-center">
              Envía tu Aplicación
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name"><User className="h-4 w-4 inline mr-1" /> Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1.5 bg-stone-50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone"><Phone className="h-4 w-4 inline mr-1" /> Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="mt-1.5 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email"><Mail className="h-4 w-4 inline mr-1" /> Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="mt-1.5 bg-stone-50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position"><Briefcase className="h-4 w-4 inline mr-1" /> Posición de Interés</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Ej: Agente Inmobiliario"
                    className="mt-1.5 bg-stone-50"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin"><Linkedin className="h-4 w-4 inline mr-1" /> LinkedIn (opcional)</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1.5 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Cuéntanos sobre ti</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={5}
                  placeholder="Tu experiencia, habilidades, por qué te gustaría trabajar con nosotros..."
                  className="mt-1.5 bg-stone-50"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-white font-semibold bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Enviando...' : 'Enviar Aplicación'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

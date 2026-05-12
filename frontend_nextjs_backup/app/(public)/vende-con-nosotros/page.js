'use client';

import { useState } from 'react';
import { DollarSign, Home, MapPin, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SellWithUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    property_description: '',
    property_type: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/sell-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Solicitud enviada correctamente. Te contactaremos pronto.');
        setFormData({ name: '', phone: '', email: '', property_description: '', property_type: '', location: '' });
      } else {
        toast.error('Error al enviar la solicitud');
      }
    } catch (error) {
      toast.error('Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="sell-with-us-page" className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#C5A059' }}>
            Vende tu Propiedad
          </p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Vende con Nosotros
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Confía en nuestro equipo de expertos para vender tu propiedad al mejor precio y en el menor tiempo posible.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Mejor Precio</h3>
              <p className="text-stone-600">Evaluamos tu propiedad para obtener el mejor precio del mercado.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Home className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Marketing Profesional</h3>
              <p className="text-stone-600">Fotografía profesional y promoción en múltiples plataformas.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Asesoría Completa</h3>
              <p className="text-stone-600">Te acompañamos en todo el proceso de venta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 shadow-lg">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6 text-center">
              Cuéntanos sobre tu Propiedad
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name"><User className="h-4 w-4 inline mr-1" /> Nombre *</Label>
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
                <Label htmlFor="email"><Mail className="h-4 w-4 inline mr-1" /> Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1.5 bg-stone-50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label><Home className="h-4 w-4 inline mr-1" /> Tipo de Propiedad</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
                  >
                    <SelectTrigger className="mt-1.5 bg-stone-50">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Local Comercial">Local Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location"><MapPin className="h-4 w-4 inline mr-1" /> Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ciudad o zona"
                    className="mt-1.5 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción de la Propiedad *</Label>
                <Textarea
                  id="description"
                  value={formData.property_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_description: e.target.value }))}
                  required
                  rows={5}
                  placeholder="Cuéntanos más sobre tu propiedad: metros cuadrados, habitaciones, características especiales..."
                  className="mt-1.5 bg-stone-50"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-white font-semibold"
                style={{ backgroundColor: '#C5A059' }}
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

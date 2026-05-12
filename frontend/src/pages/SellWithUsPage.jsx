import { useState } from 'react';
import { Home, MapPin, Phone, User, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SellWithUsPage = ({ agency }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    property_type: '',
    location: '',
    property_description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.property_description) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/sell-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Solicitud enviada correctamente');
      } else {
        throw new Error('Error al enviar');
      }
    } catch (error) {
      toast.error('Error al enviar la solicitud. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white p-12 shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C5A05920' }}>
              <CheckCircle className="h-10 w-10" style={{ color: '#C5A059' }} />
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-4">
              Solicitud Recibida
            </h1>
            <p className="text-stone-600 mb-8">
              Gracias por confiar en nosotros. Nuestro equipo se pondra en contacto contigo pronto para evaluar tu propiedad.
            </p>
            <Button onClick={() => window.location.href = '/'} style={{ backgroundColor: '#C5A059' }} className="text-white">
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="sell-with-us-page" className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#C5A059' }}>
            Vende tu Propiedad
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Vende con Nosotros
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Confia en expertos para vender tu propiedad al mejor precio. Nuestro equipo te acompanara en todo el proceso.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 md:p-10 shadow-lg border border-stone-100">
            <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
              Cuentanos sobre tu propiedad
            </h2>
            <p className="text-stone-500 mb-8">
              Completa el formulario y nos pondremos en contacto contigo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Nombre Completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-2"
                    placeholder="Tu nombre"
                    data-testid="sell-name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Telefono *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="mt-2"
                    placeholder="+1 (809) 000-0000"
                    data-testid="sell-phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="property_type" className="flex items-center gap-2">
                    <Home className="h-4 w-4" /> Tipo de Propiedad
                  </Label>
                  <Select value={formData.property_type} onValueChange={(v) => setFormData(prev => ({ ...prev, property_type: v }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Local Comercial">Local Comercial</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Ubicacion
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-2"
                    placeholder="Ciudad o zona"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Descripcion de la Propiedad *
                </Label>
                <Textarea
                  id="description"
                  value={formData.property_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_description: e.target.value }))}
                  required
                  className="mt-2"
                  rows={5}
                  placeholder="Describe tu propiedad: tamano, habitaciones, caracteristicas especiales, precio aproximado..."
                  data-testid="sell-description"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-lg font-semibold text-white"
                style={{ backgroundColor: '#C5A059' }}
                data-testid="sell-submit"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>

              <p className="text-xs text-stone-500 text-center">
                Al enviar este formulario, aceptas ser contactado por nuestro equipo de ventas.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellWithUsPage;

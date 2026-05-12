import { useState } from 'react';
import { User, Phone, Mail, FileText, Briefcase, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const WorkWithUsPage = ({ agency }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    position: '',
    linkedin_url: '',
    cv_url: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/job-applications`, {
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-4">
              Aplicacion Recibida
            </h1>
            <p className="text-stone-600 mb-8">
              Gracias por tu interes en formar parte de nuestro equipo. Revisaremos tu perfil y te contactaremos si hay una oportunidad que se ajuste a ti.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-green-600 hover:bg-green-700 text-white">
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="work-with-us-page" className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-green-700 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest mb-4 text-green-200">
            Oportunidades de Carrera
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Trabaja con Nosotros
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Unete a nuestro equipo de profesionales apasionados por el sector inmobiliario. Buscamos talento que quiera crecer con nosotros.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 md:p-10 shadow-lg border border-stone-100">
            <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
              Enviar tu Perfil
            </h2>
            <p className="text-stone-500 mb-8">
              Completa el formulario con tu informacion y nos pondremos en contacto contigo.
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
                    placeholder="Tu nombre completo"
                    data-testid="work-name"
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
                    data-testid="work-phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="mt-2"
                  placeholder="tu@email.com"
                  data-testid="work-email"
                />
              </div>

              <div>
                <Label htmlFor="position" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Posicion de Interes
                </Label>
                <Select value={formData.position} onValueChange={(v) => setFormData(prev => ({ ...prev, position: v }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleccionar posicion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agente de Ventas">Agente de Ventas</SelectItem>
                    <SelectItem value="Agente de Alquileres">Agente de Alquileres</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Administracion">Administracion</SelectItem>
                    <SelectItem value="Atencion al Cliente">Atencion al Cliente</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Perfil de LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="mt-2"
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
                <div>
                  <Label htmlFor="cv" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Enlace a CV/Portafolio
                  </Label>
                  <Input
                    id="cv"
                    type="url"
                    value={formData.cv_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, cv_url: e.target.value }))}
                    className="mt-2"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Mensaje / Por que quieres trabajar con nosotros
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="mt-2"
                  rows={4}
                  placeholder="Cuentanos sobre ti, tu experiencia y por que te gustaria unirte a nuestro equipo..."
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                data-testid="work-submit"
              >
                {submitting ? 'Enviando...' : 'Enviar Aplicacion'}
              </Button>

              <p className="text-xs text-stone-500 text-center">
                Al enviar este formulario, aceptas que revisemos tu perfil para futuras oportunidades laborales.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkWithUsPage;
